import React from 'react';
import { motion } from 'framer-motion';
import { FaReact, FaNodeJs, FaDocker, FaPython, FaAws, FaGithub } from 'react-icons/fa';
import { SiMongodb, SiNextdotjs, SiTailwindcss, SiTypescript } from 'react-icons/si';

const TechMarquee = () => {
    const techStack = [
        { icon: <FaReact />, name: 'React' },
        { icon: <FaNodeJs />, name: 'Node.js' },
        { icon: <SiMongodb />, name: 'MongoDB' },
        { icon: <SiNextdotjs />, name: 'Next.js' },
        { icon: <SiTailwindcss />, name: 'Tailwind CSS' },
        { icon: <SiTypescript />, name: 'TypeScript' },
        { icon: <FaDocker />, name: 'Docker' },
        { icon: <FaPython />, name: 'Python' },
        { icon: <FaAws />, name: 'AWS' },
        { icon: <FaGithub />, name: 'GitHub' },
    ];

    return (
        <div className="w-full py-10 bg-[#0B0F19] border-y border-white/5 overflow-hidden flex flex-col items-center justify-center relative">
            <div className="absolute left-0 w-32 h-full bg-gradient-to-r from-[#0B0F19] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 w-32 h-full bg-gradient-to-l from-[#0B0F19] to-transparent z-10 pointer-events-none"></div>
            
            <p className="text-richblack-400 text-sm font-semibold tracking-widest uppercase mb-6 text-center">
                Powered by Industry Leading Technologies
            </p>
            
            <div className="flex w-[200%]">
                <motion.div 
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
                    className="flex w-full justify-around items-center space-x-16"
                >
                    {/* Double the array for seamless infinite scroll */}
                    {[...techStack, ...techStack].map((tech, index) => (
                        <div key={index} className="flex items-center gap-3 text-richblack-300 hover:text-white transition-colors cursor-pointer group">
                            <span className="text-3xl opacity-50 group-hover:opacity-100 group-hover:text-livecode-400 transition-all">{tech.icon}</span>
                            <span className="font-mono text-lg font-bold opacity-50 group-hover:opacity-100 transition-opacity">{tech.name}</span>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default TechMarquee;
