import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { UseMyContext } from '../context/MyContext'
import Heading from '../components/ui/Heading'
import VanillaTilt from 'vanilla-tilt'

const Skills = () => {
    const { Skills } = UseMyContext()

    useEffect(() => {
        VanillaTilt.init(document.querySelectorAll(".card"), {
            max: 7,
            speed: 10,
            glare: true,
            "max-glare": 0.50
        })
    }, [])

    return (
        <div className='relative flex flex-col justify-start items-start gap-2 w-[90%]'>
            <motion.h1
                className='w-full text-start text-3xl mt-6'
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
            >
                Skills<span className='animate-pulse'>_</span>
            </motion.h1>

            <div className='w-full flex flex-col justify-center items-center gap-5 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mb-3'>
                {Skills.map((skill, idx) => (
                    <motion.div
                        key={idx}
                        className={`card bg-[#dadada] relative w-full h-auto border sm:h-full flex flex-col items-center justify-center gap-2 p-2 rounded-lg`}
                        initial={{
                            opacity: 0,
                            x: idx % 2 === 0 ? -80 : 80,   // even → from left, odd → from right
                            scale: 0.95
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                            scale: 1
                        }}
                        viewport={{ once: true, amount: 0.25 }}
                        transition={{
                            duration: 0.55,
                            delay: idx * 0.12,
                            ease: "easeOut"
                        }}
                    >
                        <h1 className='h-[10%] w-full text-center mb-8'>
                            <Heading title={skill.category} />
                        </h1>

                        <div className='w-full h-[90%] flex items-start justify-start'>
                            <div className='h-auto w-full flex flex-wrap gap-2'>
                                {skill.skills.map((sk, skillIdx) => (
                                    <motion.span
                                        key={skillIdx}
                                        className='h-10 w-auto shrink-0 inline-flex items-center justify-center gap-2 p-2 border rounded-lg relative bg-[#dadada]'
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{
                                            duration: 0.3,
                                            delay: skillIdx * 0.06
                                        }}
                                    >
                                        <p>{sk.name}</p>
                                        <img src={sk.icon} className='w-5 rounded-lg' alt="" />
                                    </motion.span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

export default Skills