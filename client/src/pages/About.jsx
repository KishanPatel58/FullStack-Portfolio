import React from 'react'
import { motion } from 'framer-motion'
import GridCanvas from '../components/ui/GridCanvas'
import { UseMyContext } from '../context/MyContext'
import Experience from '../sections/Experience';
import Skills from '../sections/Skills';
import Education from '../sections/Education';

const About = () => {
  const { Profile } = UseMyContext();

  return (
    <div className='w-full h-full flex items-center justify-center flex-col'>
      <GridCanvas />

      {/* Profile Section */}
      <div className='w-full flex flex-col items-center justify-center gap-3 mt-20 sm:flex-row sm:justify-start sm:items-start sm:px-6 lg:px-15'>
        
        {/* Profile Image */}
        <motion.img
          src={Profile.me.myImg}
          alt="My Image"
          className='w-[90%] h-[40vh] sm:w-[200vh] sm:h-[40vh] sm:cover md:w-[60vh] relative z-[20] rounded-2xl'
          initial={{ opacity: 0, x: -50, scale: 0.96 }}
          whileInView={{ opacity: 1, x: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* About Text */}
        <motion.p
          className='text-justify px-4 sm:text-xl'
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          {Profile.me.about}
        </motion.p>
      </div>

      {/* Other Sections (already have their own animations) */}
      <Skills />
      <Experience />
      <Education />

      {/* Bottom Space */}
      <div className='w-full mb-5 mt-9 h-10' />
    </div>
  )
}

export default About