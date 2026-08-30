import React from 'react'
import { motion } from 'framer-motion'
import { UseMyContext } from '../context/MyContext'
import { Link, useParams } from 'react-router-dom';
import { CodeXml, ExternalLink } from 'lucide-react';

const SelectedProject = () => {
    const { Projects } = UseMyContext();
    const params = useParams();
    const selectedProject = Projects.filter(project => project._id === params.id)[0];

    if (!selectedProject) {
        return (
            <div className='w-full h-screen flex items-center justify-center'>
                <p className='text-sm sm:text-base md:text-lg'>Project not found.</p>
            </div>
        )
    }

    return (
        <div className='w-full h-auto mt-15 flex items-center justify-center flex-col'>
            
            {/* Project Image */}
            <motion.img
                src={selectedProject.image}
                alt={selectedProject.name}
                className='mx-auto w-[90%] object-cover rounded-lg'
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            />

            {/* Project Title */}
            <motion.h1
                className='w-[90%] text-left text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl mt-3 font-semibold'
                initial={{ opacity: 0, x: -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
            >
                {selectedProject.name}_
            </motion.h1>

            {/* Tech Stack Heading */}
            <motion.h1
                className='w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-5 font-semibold'
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.1 }}
            >
                Tech Stack_
            </motion.h1>

            {/* Tech Stack Items */}
            <div className='w-[90%] flex flex-wrap justify-start items-start gap-2 mt-3'>
                {selectedProject.techStack.map((stack, idx) => (
                    <motion.span
                        key={idx}
                        className='flex items-center justify-center gap-1.5 border relative w-auto h-auto rounded-full px-2.5 py-1.5'
                        initial={{ opacity: 0, scale: 0.7 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: idx * 0.06 }}
                    >
                        <img src={stack.icon} alt={stack.name} className='w-4 h-4 sm:w-5 sm:h-5 rounded-full' />
                        <p className='text-xs sm:text-sm md:text-base'>{stack.name}</p>
                    </motion.span>
                ))}
            </div>

            {/* Description Heading */}
            <motion.h1
                className='w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-6 font-semibold'
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
            >
                Description_
            </motion.h1>

            {/* Description */}
            <motion.p
                className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl mt-3 text-justify w-[90%] leading-relaxed'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                {selectedProject.desc}
            </motion.p>

            {/* Core Features Heading */}
            <motion.h1
                className='w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-6 font-semibold'
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
            >
                Core Features_
            </motion.h1>

            {/* Core Features */}
            <div className='w-[90%] mt-3'>
                {selectedProject.coreFeatures.map((feature, idx) => (
                    <motion.div
                        key={`${feature.title}-${idx}`}
                        className='mt-4'
                        initial={{ opacity: 0, y: 25 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.2 }}
                        transition={{ duration: 0.45, delay: idx * 0.1 }}
                    >
                        <h1 className='text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-semibold'>
                            {feature.title}_
                        </h1>
                        <ul className='w-full mt-1' style={{ listStyleType: "disc" }}>
                            {feature.description.map((description, index) => (
                                <li key={index} className='text-xs sm:text-sm md:text-base lg:text-lg ml-6 sm:ml-8 mt-1.5 !list-disc'>
                                    <span>{description.desc}</span>
                                    <ul className='w-full' style={{ listStyleType: "disc" }}>
                                        {description?.points?.length > 0 && (
                                            description.points.map((point, ind) => (
                                                <li key={ind} className='ml-6 sm:ml-8 mt-1 !list-disc text-xs sm:text-sm md:text-base'>
                                                    {point}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Links Heading */}
            <motion.h1
                className='w-[90%] text-left text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl mt-8 font-semibold'
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
            >
                Links_
            </motion.h1>

            {/* Project Links */}
            <motion.div
                className='w-[90%] flex justify-start items-center'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                <div className='relative w-full left-0 bottom-0 flex items-center justify-start mt-3 gap-3 mb-6 sm:w-[50vh]'>
                    {selectedProject?.githubLink && (
                        <Link
                            to={selectedProject.githubLink}
                            className='w-1/2 h-auto py-2 sm:py-2.5 bg-black text-white flex items-center justify-center gap-2 border border-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-zinc-800 transition-colors'
                        >
                            Code <CodeXml size={18} />
                        </Link>
                    )}
                    {selectedProject?.publicLink && (
                        <Link
                            to={selectedProject.publicLink}
                            className='w-1/2 h-auto py-2 sm:py-2.5 flex items-center justify-center gap-2 border border-black rounded-lg text-xs sm:text-sm md:text-base hover:bg-black hover:text-white transition-colors'
                        >
                            Live Demo <ExternalLink size={18} />
                        </Link>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

export default SelectedProject