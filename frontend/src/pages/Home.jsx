import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from 'react-redux';

// Components
import Footer from '../components/common/Footer';
import ExploreMore from '../components/core/HomePage/ExploreMore';
import Course_Slider from '../components/core/Catalog/Course_Slider';
import BentoGrid from '../components/core/HomePage/BentoGrid';
import TechMarquee from '../components/core/HomePage/TechMarquee';

// Operations
import { fetchCourseCategories } from '../services/operations/courseDetailsAPI';
import { getCatalogPageData } from '../services/operations/pageAndComponentData';

// Icons & Motion
import { FaArrowRight, FaPlay } from "react-icons/fa";
import { motion } from 'framer-motion';

const Home = () => {
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const [CatalogPageData, setCatalogPageData] = useState(null);

    useEffect(() => {
        const fetchCatalogPageData = async () => {
            try {
                const categories = await fetchCourseCategories();
                if (categories.length > 0) {
                    const category_id = categories[Math.floor(Math.random() * categories.length)]._id;
                    const result = await getCatalogPageData(category_id, dispatch);
                    setCatalogPageData(result);
                }
            } catch (error) {
                console.log("CATALOG PAGE DATA ERROR....", error);
            }
        }
        fetchCatalogPageData();
    }, [dispatch]);

    return (
        <div className="flex flex-col min-h-screen bg-[#06080F] font-outfit overflow-x-hidden">
            
            {/* Background Grid CSS Pattern */}
            <div className="fixed inset-0 pointer-events-none z-0" 
                 style={{
                     backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
                     backgroundSize: '50px 50px'
                 }}>
            </div>

            <div className='relative flex-grow z-10'>
                {/* Section 1: Hero */}
                <div className='relative min-h-[90vh] flex flex-col lg:flex-row justify-center mx-auto w-11/12 max-w-7xl items-center text-white pt-20 pb-10 gap-16'>
                    <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-livecode-400/20 rounded-full blur-[120px] pointer-events-none"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                    {/* Hero Text */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className='flex flex-col items-start justify-center lg:w-1/2 w-full z-10'
                    >


                        <h1 className='text-5xl lg:text-7xl font-extrabold mt-4 leading-[1.1] tracking-tight text-white'>
                            Learn to Code,<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-livecode-300 to-livecode-600">
                                Without Leaving Your Browser
                            </span>
                        </h1>
                        
                        <p className="mt-6 w-[90%] text-richblack-300 text-lg md:text-xl font-light tracking-wide leading-relaxed">
                            LiveCode provides a fully-fledged Node.js environment synced directly to your instructor's screen. Watch, fork, and build instantly.
                        </p>

                        <div className='flex flex-row gap-5 mt-10'>
                            <Link to="/signup" className="livecode-button-primary px-8 py-3.5 font-bold text-lg flex items-center gap-3">
                                Start Coding For Free
                            </Link>
                            <Link to="/view-course/69db9cdb1eb2e1a9b37711ec/section/69db9d0f1eb2e1a9b37711f4/sub-section/69db9d661eb2e1a9b37711fd" className="livecode-glass px-8 py-3.5 font-bold text-lg hover:bg-white/10 transition-colors flex items-center gap-3">
                                <FaPlay className="text-livecode-400 text-sm" /> View Demo
                            </Link>
                        </div>
                        

                    </motion.div>

                    {/* Floating Terminal Mockup */}
                    <motion.div 
                        initial={{ opacity: 0, y: 50, rotateX: 20 }}
                        animate={{ opacity: 1, y: 0, rotateX: 0 }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                        style={{ perspective: "1000px" }}
                        className="lg:w-1/2 w-full z-10"
                    >
                        <div className="livecode-glass-card rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                            {/* Window Controls */}
                            <div className="bg-[#0B0F19]/80 border-b border-white/5 px-4 py-3 flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="ml-4 font-mono text-xs text-richblack-400">server.js - LiveCode Engine</span>
                            </div>
                            {/* Code Area */}
                            <div className="bg-[#1e1e1e]/90 p-6 font-mono text-sm leading-relaxed h-[350px] overflow-hidden relative">
                                <p><span className="text-pink-400">import</span> express <span className="text-pink-400">from</span> <span className="text-yellow-300">'express'</span>;</p>
                                <p className="mt-2"><span className="text-pink-400">const</span> app = <span className="text-blue-400">express</span>();</p>
                                <p className="mt-4"><span className="text-richblack-400">// Automatically syncs with instructor via Yjs</span></p>
                                <p>app.<span className="text-blue-400">get</span>(<span className="text-yellow-300">'/api/learn'</span>, (req, res) <span className="text-pink-400">=&gt;</span> {'{'}</p>
                                <p className="ml-4">res.<span className="text-blue-400">json</span>({'{'} <span className="text-livecode-300">status</span>: <span className="text-yellow-300">'success'</span>, <span className="text-livecode-300">platform</span>: <span className="text-yellow-300">'LiveCode'</span> {'}'});</p>
                                <p>{'}'});</p>
                                <p className="mt-4">app.<span className="text-blue-400">listen</span>(<span className="text-green-400">3000</span>, () <span className="text-pink-400">=&gt;</span> {'{'}</p>
                                <p className="ml-4">console.<span className="text-blue-400">log</span>(<span className="text-yellow-300">'Server running instantly in-browser 🚀'</span>);</p>
                                <p>{'}'});</p>
                                
                                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#1e1e1e] to-transparent"></div>
                                
                                {/* Fake Terminal Bottom */}
                                <div className="absolute bottom-4 left-6 right-6">
                                    <div className="flex items-center gap-2 text-livecode-400">
                                        <FaArrowRight className="text-xs" /> 
                                        <span>npm run dev</span>
                                    </div>
                                    <div className="text-green-400 mt-1">&gt; Server running instantly in-browser 🚀</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <TechMarquee />
                <BentoGrid />

                <div className='mx-auto flex flex-col w-11/12 max-w-7xl items-center text-white pb-20'>
                    
                    {/* Explore More - IDE Tab Design */}
                    <div className='relative w-full mt-10 mb-20'>
                        <ExploreMore />
                    </div>

                    {/* Course Sliders */}
                    <div className='w-full px-0 py-12 border-t border-white/5'>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className='text-3xl font-bold text-white'>Trending Masterclasses</h2>
                            <span className="livecode-neon-text font-mono text-sm px-3 py-1 bg-livecode-400/10 rounded-full">Top 10</span>
                        </div>
                        <Course_Slider Courses={CatalogPageData?.selectedCategory?.courses?.length > 0 ? CatalogPageData?.selectedCategory?.courses : CatalogPageData?.differentCategory?.courses} />
                    </div>

                    <div className='w-full px-0 py-12 border-t border-white/5'>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className='text-3xl font-bold text-white'>Latest Drops</h2>
                            <span className="text-pink-400 font-mono text-sm px-3 py-1 bg-pink-400/10 rounded-full">New</span>
                        </div>
                        <Course_Slider Courses={CatalogPageData?.mostSellingCourses} />
                    </div>
                </div>
            </div>

            <div className='relative z-10'>
                <Footer />
            </div>
        </div>
    )
}

export default Home;