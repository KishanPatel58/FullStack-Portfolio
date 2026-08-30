import React, { useState } from 'react'
import { UseMyContext } from '../context/MyContext'
import { motion, AnimatePresence } from "framer-motion"
import { Download, Projector, X, ZoomIn, ZoomOut } from 'lucide-react'

const Resume = () => {
    const { Profile } = UseMyContext()
    const [showResume, setShowResume] = useState(false)
    const [resumeZoom, setResumeZoom] = useState(100) // percentage

    return (
        <>
            {/* Main Resume Section */}
            <div className='relative flex flex-col justify-start items-start gap-2 w-full p-2 mt-10'>
                <motion.h1
                    className='w-[90%] text-start text-3xl mt-2'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                >
                    My Resume<span className='animate-pulse'>_</span>
                </motion.h1>

                <motion.img
                    src={Profile.me.myResume}
                    alt="My Resume"
                    className='mt-2 w-full rounded-lg border border-black/10'
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                />

                <motion.div
                    className='flex w-full items-center justify-start gap-2 mt-3 flex-col sm:flex-row sm:w-[50vh]'
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: 0.2 }}
                >
                    <a
                        href={Profile.me.myResumePdf}
                        download="Kishan_Patel_Resume.pdf"
                        className='border w-full border-black bg-black text-white p-[8px_20px] rounded-lg flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors'
                    >
                        Get Resume <Download size={18} />
                    </a>

                    <button
                        onClick={() => setShowResume(true)}
                        type="button"
                        className='border w-full border-black p-[8px_20px] rounded-lg flex items-center justify-center gap-2 hover:bg-black hover:text-white group transition-all duration-300'
                    >
                        Show Resume
                        <Projector className='group-hover:text-white transition-all duration-300' size={18} />
                    </button>
                </motion.div>
            </div>

            {/* Fullscreen Resume Modal */}
            <AnimatePresence>
                {showResume && (
                    <motion.div
                        className='fixed inset-0 z-[4000] bg-black flex flex-col'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Top Bar */}
                        <div className='w-full flex items-center justify-between px-4 py-3 bg-black border-b border-white/10'>
                            <h2 className='text-white text-sm sm:text-base font-medium tracking-wide'>
                                Resume Preview
                            </h2>

                            <div className='flex items-center gap-3'>
                                {/* Zoom Controls */}
                                <div className='hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5'>
                                    <ZoomOut size={16} className='text-white/70' />
                                    <input
                                        type="range"
                                        min="50"
                                        max="200"
                                        value={resumeZoom}
                                        onChange={(e) => setResumeZoom(Number(e.target.value))}
                                        className='w-28 accent-white cursor-pointer'
                                    />
                                    <ZoomIn size={16} className='text-white/70' />
                                    <span className='text-white text-xs font-medium w-10 text-right'>
                                        {resumeZoom}%
                                    </span>
                                </div>

                                {/* Close Button */}
                                <button
                                    onClick={() => setShowResume(false)}
                                    className='w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Resume Viewer - Draggable */}
                        <div className='flex-1 overflow-hidden flex items-center justify-center p-4 sm:p-8 bg-[#0a0a0a] cursor-grab active:cursor-grabbing'>
                            <motion.img
                                src={Profile.me.myResume}
                                alt="Resume"
                                className='rounded-md shadow-2xl shadow-black/50 border border-white/10'
                                style={{
                                    width: `${resumeZoom}%`,
                                    maxWidth: 'none',
                                    transition: 'width 0.2s ease'
                                }}
                                drag
                                dragConstraints={{ left: -500, right: 500, top: -500, bottom: 500 }}
                                dragElastic={0.1}
                                dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                                whileDrag={{ cursor: "grabbing" }}
                            />
                        </div>

                        {/* Mobile Zoom Controls */}
                        <div className='sm:hidden w-full flex items-center justify-center gap-3 px-4 py-3 bg-black border-t border-white/10'>
                            <ZoomOut size={16} className='text-white/70' />
                            <input
                                type="range"
                                min="50"
                                max="200"
                                value={resumeZoom}
                                onChange={(e) => setResumeZoom(Number(e.target.value))}
                                className='flex-1 accent-white cursor-pointer'
                            />
                            <ZoomIn size={16} className='text-white/70' />
                            <span className='text-white text-xs font-medium w-10 text-right'>
                                {resumeZoom}%
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default Resume