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
            <div className='relative flex flex-col justify-start items-center gap-2 w-full p-2 mt-10'>
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
                    className='
                        mt-2 rounded-lg border border-black/10 shadow-sm
                        w-[90%]
                        sm:w-[70%]
                        md:w-[55%]
                        lg:w-[45%]
                        xl:w-[40%]
                        2xl:w-[35%]
                        max-w-[520px]
                        object-contain
                    '
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.1 }}
                />

                <motion.div
                    className='flex w-[90%] sm:w-[50vh] items-center justify-center gap-2 mt-3 flex-col sm:flex-row'
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
                <motion.h1 className="text-lg text-justify">Note: <span className='text-red-500'>Drag or Scroll to show Full Resume after click on `Show Resume` Button</span></motion.h1>
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
                        <div className='w-full flex items-center justify-between px-4 py-3 bg-black border-b border-white/10 shrink-0'>
                            <h2 className='text-white text-sm sm:text-base font-medium tracking-wide'>
                                Resume Preview
                            </h2>

                            <div className='flex items-center gap-3'>
                                <div className='hidden sm:flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5'>
                                    <ZoomOut size={16} className='text-white/70' />
                                    <input
                                        type="range"
                                        min="25"
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

                                <button
                                    onClick={() => setShowResume(false)}
                                    className='w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors'
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Resume Viewer - scrollable so full image is always reachable */}
                        <div className='flex-1 overflow-auto bg-[#0a0a0a]'>
                            <div className='min-h-full min-w-full flex items-center justify-center p-4 sm:p-8'>
                                <motion.img
                                    src={Profile.me.myResume}
                                    alt="Resume"
                                    className='rounded-md shadow-2xl shadow-black/50 border border-white/10 cursor-grab active:cursor-grabbing'
                                    style={{
                                        width: `${resumeZoom}%`,
                                        maxWidth: 'none',
                                        height: 'auto',
                                        transition: 'width 0.2s ease'
                                    }}
                                    drag
                                    dragConstraints={{ left: -800, right: 800, top: -800, bottom: 800 }}
                                    dragElastic={0.05}
                                    dragTransition={{ bounceStiffness: 300, bounceDamping: 25 }}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                    whileDrag={{ cursor: "grabbing" }}
                                />
                            </div>
                        </div>

                        {/* Mobile Zoom Controls */}
                        <div className='sm:hidden w-full flex items-center justify-center gap-3 px-4 py-3 bg-black border-t border-white/10 shrink-0'>
                            <ZoomOut size={16} className='text-white/70' />
                            <input
                                type="range"
                                min="25"
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