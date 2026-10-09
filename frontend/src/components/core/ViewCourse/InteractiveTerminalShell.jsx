import React, { useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { WebContainer } from '@webcontainer/api';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

let webcontainerInstance = null;
let webcontainerBootPromise = null;

export default function InteractiveTerminalShell({ initialCode, onClose }) {
  const [isBooting, setIsBooting] = useState(true);
  const terminalRef = useRef(null);
  const editorRef = useRef(null);
  const xtermRef = useRef(null);
  const shellInputRef = useRef(null);

  useEffect(() => {
    let fitAddon;
    let shellProcess = null;

    const initTerminal = async () => {
      // 1. Boot WebContainer if not booted
      if (!webcontainerInstance) {
        if (!webcontainerBootPromise) {
          webcontainerBootPromise = WebContainer.boot();
        }
        webcontainerInstance = await webcontainerBootPromise;
      }

      // 2. Initialize xterm.js
      if (!xtermRef.current) {
        xtermRef.current = new Terminal({
          convertEol: true,
          cursorBlink: true,
          theme: { background: '#0f172a' } // match richblack-900 roughly
        });
        fitAddon = new FitAddon();
        xtermRef.current.loadAddon(fitAddon);
        xtermRef.current.open(terminalRef.current);
        fitAddon.fit();
      }

      // 3. Mount files (index.js with initial code)
      await webcontainerInstance.mount({
        'index.js': {
          file: {
            contents: initialCode || '// Start coding here',
          },
        },
        'package.json': {
          file: {
            contents: `
              {
                "name": "dev-env",
                "type": "module",
                "dependencies": {},
                "scripts": {
                  "start": "node index.js"
                }
              }`,
          },
        },
      });

      // 4. Start Shell
      shellProcess = await webcontainerInstance.spawn('jsh');

      // 5. Pipe output to xterm
      shellProcess.output.pipeTo(
        new WritableStream({
          write(data) {
            xtermRef.current.write(data);
          },
        })
      );

      // 6. Pipe xterm input to shell
      const input = shellProcess.input.getWriter();
      shellInputRef.current = input;
      xtermRef.current.onData((data) => {
        input.write(data);
      });

      setIsBooting(false);
    };

    initTerminal();

    // Resize listener
    const handleResize = () => {
      if (fitAddon) fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (shellProcess) shellProcess.kill();
      // Keep xtermRef mostly around or clean it up if needed, but since we unmount, we should dispose
      if (xtermRef.current) {
        xtermRef.current.dispose();
        xtermRef.current = null;
      }
    };
  }, [initialCode]);

  // When Monaco Editor changes, we write it to the WebContainer filesystem
  const handleEditorChange = async (value) => {
    if (webcontainerInstance) {
      await webcontainerInstance.fs.writeFile('/index.js', value);
    }
  };

  const handleRunCode = () => {
    if (shellInputRef.current) {
      shellInputRef.current.write('node index.js\r');
    }
  };

  return (
    <div className="mt-8 flex flex-col gap-4 livecode-glass-card overflow-hidden relative">
      <div className="flex justify-between items-center bg-white/5 border-b border-white/10 p-2 px-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="font-mono text-xs opacity-70 ml-2">student@dev-environment ~ Node.js</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded transition-colors"
        >
          Close & Resume Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 h-[500px] w-full gap-2 p-2">
        {/* EDITOR */}
        <div className="h-full relative border border-white/10 rounded overflow-hidden">
          <div className="absolute top-0 w-full bg-[#1e1e1e] text-xs px-2 py-1 border-b border-white/10 z-10 flex justify-between items-center">
            <span className="livecode-neon-text font-mono">index.js</span>
            <button 
              onClick={handleRunCode}
              disabled={isBooting}
              className="livecode-button-primary text-xs px-3 py-1 rounded shadow transition-all font-bold disabled:opacity-50"
            >
              Run &#9654;
            </button>
          </div>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={initialCode}
            onChange={handleEditorChange}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              wordWrap: 'on',
              padding: { top: 35 }
            }}
          />
        </div>

        {/* TERMINAL */}
        <div className="h-full bg-[#0B0F19] border border-white/10 rounded overflow-hidden relative flex flex-col">
          <div className="bg-[#0B0F19] text-xs px-2 py-1 border-b border-white/10 z-10 sticky top-0">
            <span className="text-livecode-300 font-mono">Terminal</span>
          </div>
          {isBooting && (
            <div className="absolute inset-0 bg-[#0B0F19] z-50 flex items-center justify-center font-mono text-sm text-livecode-400">
              Booting Node.js Environment...
            </div>
          )}
          <div ref={terminalRef} className="flex-1 w-full p-2 h-full" style={{ height: 'calc(100% - 25px)' }}></div>
        </div>
      </div>
    </div>
  );
}
