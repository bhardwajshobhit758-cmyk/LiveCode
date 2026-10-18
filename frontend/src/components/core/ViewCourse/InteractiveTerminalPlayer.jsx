import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';
import InteractiveTerminalShell from './InteractiveTerminalShell';

export default function InteractiveTerminalPlayer({ videoData, playerRef }) {
  const [codeStream, setCodeStream] = useState([]);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [interactiveState, setInteractiveState] = useState(null);
  
  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const bindingRef = useRef(null);
  const isMountedRef = useRef(true);
  const lastAppliedIndexRef = useRef(-1);
  const lastVideoTimeRef = useRef(0);
  
  const isSubscribedRef = useRef(false);
  const stateRefs = useRef({
      codeStream: [],
      isInteractiveMode: false,
      videoData: null
  });

  // Keep stateRefs updated seamlessly
  useEffect(() => {
      stateRefs.current.codeStream = codeStream;
      stateRefs.current.isInteractiveMode = isInteractiveMode;
      stateRefs.current.videoData = videoData;
  }, [codeStream, isInteractiveMode, videoData]);

  // Fetch the Code Stream JSON when mounted
  useEffect(() => {
    const url = videoData?.codeStreamUrl;
    // Don't attempt to parse image URLs or invalid formats as JSON code stream
    if (url && !url.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i) && !url.includes("images.unsplash.com")) {
      fetch(url)
        .then(async (res) => {
          const contentType = res.headers.get("content-type") || "";
          if (!res.ok || contentType.includes("image")) {
            return [];
          }
          return res.json();
        })
        .then((data) => {
          if (Array.isArray(data)) {
            setCodeStream(data);
          } else {
            setCodeStream([]);
          }
        })
        .catch((err) => {
          console.warn("Could not load Code Stream JSON, defaulting to empty:", err?.message || err);
          setCodeStream([]);
        });
    } else {
      setCodeStream([]);
    }
  }, [videoData]);

  const getStartingCode = () => {
    return videoData?.initialCode || "";
  };

  // Handle Monaco Initialization
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const type = ydoc.getText('monaco');
    const starterCode = getStartingCode();
    if (starterCode) {
      type.insert(0, starterCode);
    }

    bindingRef.current = new MonacoBinding(
      type,
      editor.getModel(),
      new Set([editor]),
      null
    );

    editor.updateOptions({ readOnly: true });

    lastAppliedIndexRef.current = -1;
    lastVideoTimeRef.current = 0;
    
    // Fallback manual initialization in case mounted very late and video is already playing
    if (playerRef?.current && !isSubscribedRef.current) {
        attachPlayerSync();
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (bindingRef.current) bindingRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, []);

  // Sync Engine Setup
  const attachPlayerSync = () => {
    if (!playerRef?.current || isSubscribedRef.current) return;
    
    const handleStateChange = (state) => {
      if (!isMountedRef.current) return;
      const { codeStream, isInteractiveMode, videoData } = stateRefs.current;
      
      // If UI is waiting, suspended, or missing doc, don't attempt patch
      if (codeStream.length === 0 || isInteractiveMode || !ydocRef.current) return;

      const currentTime = state.currentTime;

      // Handle seeking logic explicitly
      if (currentTime < lastVideoTimeRef.current - 0.5) { 
        if (bindingRef.current) {
            bindingRef.current.destroy();
        }
        if (ydocRef.current) {
            ydocRef.current.destroy();
        }

        const newYdoc = new Y.Doc();
        ydocRef.current = newYdoc;
        
        const type = newYdoc.getText('monaco');
        
        // Clear the editor directly before establishing new binding
        if (editorRef.current) {
            editorRef.current.setValue('');
        }

        const starterCode = getStartingCode();
        if (starterCode) {
            type.insert(0, starterCode);
        }

        if (editorRef.current) {
            bindingRef.current = new MonacoBinding(
                type,
                editorRef.current.getModel(),
                new Set([editorRef.current]),
                null
            );
        }
        
        lastAppliedIndexRef.current = -1;
      }

      // Find all patches that should be applied up to this time
      for (let i = lastAppliedIndexRef.current + 1; i < codeStream.length; i++) {
        const patch = codeStream[i];
        if (patch.t <= currentTime) {
            try {
                const uint8Update = new Uint8Array(patch.u);
                Y.applyUpdate(ydocRef.current, uint8Update, 'player-sync');
                lastAppliedIndexRef.current = i;
            } catch (e) {
                console.warn("Failed to apply patch sync", e);
            }
        } else {
            break; 
        }
      }

      lastVideoTimeRef.current = currentTime;
    };

    playerRef.current.subscribeToStateChange(handleStateChange);
    isSubscribedRef.current = true;
  };

  // Attempt sync engine attach once player loads
  useEffect(() => {
      attachPlayerSync();
  }, [playerRef]);

  const forkTerminal = () => {
    // Pause the video
    if (playerRef?.current) {
        playerRef.current.pause();
    }
    
    // Switch to Interactive Mode
    setIsInteractiveMode(true);
    // Capture exact current content string directly from Editor
    setInteractiveState(editorRef.current.getValue());
  };

  const exitInteractiveMode = () => {
      setIsInteractiveMode(false);
      setInteractiveState(null);
      // Wait, if they resume playback, the yDoc is already messed up?
      // No, yDoc wasn't modified in interactive mode because we unmount it!
      // But we just hide it. Let's just reset the player.
  }

  if (isInteractiveMode) {
      return <InteractiveTerminalShell initialCode={interactiveState} onClose={exitInteractiveMode} />
  }

  return (
    <div className="mt-8 flex flex-col gap-4">
      <div className="flex justify-between items-end">
          <div>
            <h3 className="text-2xl font-bold font-inter livecode-neon-text">Live Code Sync</h3>
            <p className="text-sm text-richblack-300">The code types automatically as you watch the video.</p>
          </div>
          <button 
             onClick={forkTerminal}
             className="livecode-button-primary font-bold px-4 py-2 rounded shadow transition-all"
          >
             Fork & Experiment Offline
          </button>
      </div>

      <div className="w-full h-[400px] border border-white/10 rounded-xl overflow-hidden relative livecode-glass-card">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          theme="vs-dark"
          options={{
            fontSize: 16,
            minimap: { enabled: false },
            wordWrap: 'on'
          }}
          onMount={handleEditorDidMount}
        />
        {codeStream.length > 0 && (
            <div className="absolute top-2 right-4 bg-livecode-400 text-livecodeDark-900 text-xs px-2 py-1 rounded font-bold animate-pulse">
               SYNCING
            </div>
        )}
      </div>
    </div>
  );
}
