import React from 'react';
import { motion } from 'framer-motion';
import { FaTerminal, FaNodeJs, FaBolt, FaUsers } from 'react-icons/fa';

const BentoGrid = () => {
    return (
        <div className="w-full max-w-6xl mx-auto py-20 px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                    The Ultimate <span className="livecode-neon-text">Hacker Experience</span>
                </h2>
                <p className="text-richblack-300 text-lg max-w-2xl mx-auto">
                    Everything you need to master software engineering, right in your browser. No local setup required.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
                
                {/* Large Feature 1 */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-2 md:row-span-2 livecode-glass-card p-8 flex flex-col relative overflow-hidden group"
                >
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-livecode-400/20 rounded-full blur-3xl group-hover:bg-livecode-400/30 transition-all"></div>
                    <FaTerminal className="text-5xl text-livecode-300 mb-6" />
                    <h3 className="text-3xl font-bold text-white mb-4 z-10">WebContainer Engine</h3>
                    <p className="text-richblack-300 text-lg z-10 max-w-md">
                        Run a full Node.js environment directly in your browser. Install npm packages, start dev servers, and execute code instantly with zero latency.
                    </p>
                    
                    <div className="mt-auto z-10">
                        <div className="bg-[#0B0F19] rounded-lg p-4 border border-white/10 font-mono text-sm text-livecode-400 shadow-inner">
                            <span className="text-pink-400">~/project</span> $ npm install express<br/>
                            <span className="text-green-400">added 50 packages in 1s</span><br/>
                            <span className="text-pink-400">~/project</span> $ node server.js<br/>
                            <span className="text-white">Server listening on port 3000...</span>
                        </div>
                    </div>
                </motion.div>

                {/* Small Feature 1 */}
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="livecode-glass-card p-8 flex flex-col justify-center relative overflow-hidden group"
                >
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
                    <FaBolt className="text-4xl text-yellow-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Live Sync</h3>
                    <p className="text-richblack-300 text-sm">
                        Watch lectures while the instructor's code types itself automatically in your terminal using CRDTs.
                    </p>
                </motion.div>

                {/* Small Feature 2 */}
                <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="livecode-glass-card p-8 flex flex-col justify-center relative overflow-hidden group"
                >
                     <div className="absolute left-0 bottom-0 w-32 h-32 bg-pink-400/10 rounded-full blur-2xl"></div>
                    <FaUsers className="text-4xl text-pink-400 mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Fork & Experiment</h3>
                    <p className="text-richblack-300 text-sm">
                        Pause the video, fork the interactive environment, and run your own experiments completely offline.
                    </p>
                </motion.div>

                {/* Wide Feature */}
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="md:col-span-3 livecode-glass-card p-8 flex flex-col md:flex-row items-center justify-between relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-livecode-600/10 to-transparent"></div>
                    <div className="z-10 md:w-1/2 mb-6 md:mb-0">
                        <FaNodeJs className="text-5xl text-[#68A063] mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Full Stack Ready</h3>
                        <p className="text-richblack-300">
                            Build React, Vue, Next.js, and Express applications right inside your learning dashboard. We handle the infrastructure.
                        </p>
                    </div>
                    <div className="z-10 w-full md:w-1/3 flex justify-end">
                        <button className="livecode-button-primary px-8 py-3 font-bold w-full md:w-auto">
                            Start Coding
                        </button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
};

export default BentoGrid;
