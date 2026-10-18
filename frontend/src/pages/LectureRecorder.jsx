import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { MonacoBinding } from 'y-monaco';

export default function LectureRecorder() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [codeStream, setCodeStream] = useState([]);
  const [time, setTime] = useState(0);

  const editorRef = useRef(null);
  const ydocRef = useRef(null);
  const providerRef = useRef(null); // Just a dummy provider if needed, but we don't need one for local
  const timerRef = useRef(null);
  const bindingRef = useRef(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (bindingRef.current) bindingRef.current.destroy();
      if (ydocRef.current) ydocRef.current.destroy();
    };
  }, []);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  const startRecording = () => {
    if (!editorRef.current) return;

    // Reset stream
    setCodeStream([]);
    setTime(0);

    // Destroy previous to prevent duplicate updates recorded
    if (bindingRef.current) bindingRef.current.destroy();
    if (ydocRef.current) ydocRef.current.destroy();

    // Initialize Yjs
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    const type = ydoc.getText('monaco');
    
    // Pre-fill Y.Doc with the current editor content.
    // This prevents y-monaco from seeing the document as empty and generating 
    // a massive "insert" patch for the pre-existing code, which causes duplication
    // during playback if the player also initializes with initialCode.
    const currentCode = editorRef.current.getValue();
    if (currentCode) {
        type.insert(0, currentCode);
    }
    
    // Bind Yjs to Monaco
    bindingRef.current = new MonacoBinding(
      type,
      editorRef.current.getModel(),
      new Set([editorRef.current]),
      null // Optional provider (Awareness)
    );

    startTimeRef.current = Date.now();

    // Listen to all updates and record them
    ydoc.on('update', (update) => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000;
      // Convert Uint8Array to standard Array so it can be stringified to JSON
      setCodeStream((prev) => [...prev, { t: currentTime, u: Array.from(update) }]);
    });

    setRecording(true);

    timerRef.current = setInterval(() => {
      setTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  };

  const stopAndDownload = () => {
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);

    if (codeStream.length === 0) {
      alert("No code changes recorded!");
      return;
    }

    // Save initial state + stream if we wanted. 
    // Wait, the very first update will just be the initial text being inserted into Ydoc if Monaco was populated.
    // If Monaco was empty, the first update is the first keypress. Let's just save the stream.
    const fileData = JSON.stringify(codeStream);
    const blob = new Blob([fileData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `codeStream_${Date.now()}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col h-screen bg-livecodeDark-900 text-richblack-5 font-inter">
      <div className="flex items-center justify-between px-6 py-3 bg-livecodeDark-800 border-b border-white/10 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard/my-courses')}
            className="flex items-center gap-2 text-sm text-richblack-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/10 transition-colors"
            title="Return to Dashboard"
          >
            <IoArrowBack className="text-base" />
            <span>Dashboard</span>
          </button>
          <div>
            <h1 className="text-lg font-bold livecode-neon-text">Instructor Code Recorder</h1>
            <p className="text-xs text-richblack-300">
              Click Start, type your code while recording your OBS video. Stop to download the JSON stream.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-2xl font-mono text-livecode-300">
            {formatTime(time)}
          </div>
          {!recording ? (
            <button
              onClick={startRecording}
              className="livecode-button-primary px-6 py-2 rounded-md font-semibold transition-all"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopAndDownload}
              className="bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-md font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2"
            >
              <span className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></span>
              Stop & Download JSON
            </button>
          )}
        </div>
      </div>

      <div className="flex-grow w-full h-full relative p-4">
          <div className="w-full h-full border border-white/10 rounded-md overflow-hidden bg-[#1e1e1e]">
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
          </div>
          {recording && (
             <div className="absolute top-8 right-8 bg-livecodeDark-800/90 backdrop-blur px-4 py-2 rounded-full border border-red-500/30 text-sm flex items-center gap-2 z-50 text-white">
               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
               {codeStream.length} patches recorded
             </div>
          )}
      </div>
    </div>
  );
}
