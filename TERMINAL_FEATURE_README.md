# LMS Platform & Interactive Terminal Fixes

This document details the recent fixes and enhancements made to resolve broken functionalities, cross-origin resource sharing, and the logic underpinning the "Live Code Sync" Interactive Terminal features.

---

## 1. CORS / COEP Policy Fixes (Cloudinary Video Block)
**Issue:**  
The application required strict headers (`Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`) in `vite.config.js` to allow the in-browser WebContainer (Node.js shell) to function. However, this strict policy completely blocked all third-party media (e.g., lecture videos and profile images) hosted on Cloudinary from rendering.

**Solution:**  
We enforced CORS opt-in behavior on third-party assets rather than weakening the security headers. The `crossOrigin="anonymous"` prop was aggressively added across all relevant frontend components:
- `VideoDetails.jsx` (`<Player>` and `<img preview>`)
- `Upload.jsx` (Drag & drop preview media)
- `Img.jsx` (`<LazyLoadImage>` for global assets like Nav profiles)

## 2. PostCSS Tailwinds Nesting Warning
**Issue:**  
Vite console was continuously throwing `[vite:css] Nested CSS was detected...` due to outdated plugin configurations.
**Solution:**  
In `postcss.config.cjs`, we replaced the generic `postcss-nesting` plugin with the official `tailwindcss/nesting` package to securely parse nested modular CSS within Tailwind layers.

---

## 3. Interactive Terminal: Live Code Sync Sub-system
The Live Code Sync engine relies heavily on **`yjs`** (CRDT text manipulation) and **`y-monaco`** (Editor Binding). Multiple critical bugs were disrupting the recording, fetching, and seeking behaviors.

### A. Blank Editor on Initialization
**Issue:**  
When videos started playing, `InteractiveTerminalPlayer.jsx` successfully pulled `initialCode`, but the editor cleared itself instantly.
**Solution:**  
The `y-monaco` binding will automatically attempt to sync `Y.Doc` content to the Monaco editor model. We resolved this by pushing the `initialCode` directly into the `Y.Doc` string **before** establishing the binding.

### B. Seeking and Rewatching Breaking the Sync
**Issue:**  
The `Yjs` update engine chronologically advances a "state vector". It cannot magically "rewind" to apply old string inserts on a newer document instance when the user hits "rewatch" or scrubs backwards on the video timeline.
**Solution:**  
We introduced a strict time-check observer monitoring video playhead jumps (`currentTime < lastVideoTime - 0.5`). If a rewind is detected, the component completely destroys the `Y.Doc` and Monaco Binding, creates a new instance seeded with `initialCode`, and rapidly applies every single patch from index 0 sequentially in ms to perfectly match the current video timestamp.

### C. Offline WebContainer Crash ("Only a single instance can be booted")
**Issue:**  
When users clicked "Fork & Experiment Offline" and then rapidly closed it, React's rendering lifecycle (or StrictMode) triggered the `WebContainer.boot()` function multiple times asynchronously, crashing the virtual Node.js environment.
**Solution:**  
Introduced a global Promise Lock (`webcontainerBootPromise`). Regardless of how many times the UI mounts/unmounts, the boot cycle is aggressively locked into a singleton promise. 

### D. Hard Refresh (F5) Breaking Data Handlers
**Issue:**  
On a hard refresh, the JSON `codeStream` fetched over the network faster than the heavy Monaco Editor web workers initialized. This race-condition led to mis-attached event listeners acting on stale closures, stopping the auto-typing functionality.
**Solution:**  
Refactored the application state into a mutable `stateRefs` pattern. The `video-react` observer now securely fetches variables by reference. The sync observer safely attaches exactly once after validating that Monaco, `Yjs`, and JSON handlers are securely populated.

### E. Code Duplication / Garbled Text ("Initial Code" bug)
**Issue:**  
The sync stream duplicated code (e.g. `using namespace# std;`) and pasted the initial variables at the bottom of the script natively. 
**Solution:**  
We spotted a structural bug in `LectureRecorder.jsx`. When recording, the tool was incorrectly capturing the existing base code in the editor as a massive "insert everything" patch *at second 0.* By configuring `LectureRecorder.jsx` to pre-sync the `Y.Doc` *before* the recording listener activates, we ensure the backend JSON stream only captures the **differences and keystrokes** actively typed after the Start button is clicked. 

---

## 4. "Fork & Experiment" Node.js Execution
**Issue:**  
Once forking into the offline WebContainer, users couldn't easily execute their JavaScript without manually finding the terminal window and typing standard Node commands.
**Solution:**  
Installed a `"Run ►"` execution button natively into the Monaco editor header inside `InteractiveTerminalShell.jsx`. This button hooks directly into the WebContainer write pipeline (`shellInputRef.current.write('node index.js\r')`) to simulate a CLI execution request on behalf of the student. 
