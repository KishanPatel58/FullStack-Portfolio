import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import GridCanvas from '../components/ui/GridCanvas'
import { UseMyContext } from '../context/MyContext'
import Experience from '../sections/Experience';
import Skills from '../sections/Skills';
import Education from '../sections/Education';
import api from '../api/axios';

const About = () => {
  const { Profile } = UseMyContext();
  const [admin, setAdmin] = useState(null)
  


  // Fetch Owner Details.
  const fetchProfileDetails = async () => {
    try {
      const { data } = await api.get("/api/portfolio/profile");
      if (data.success) {
        setAdmin(data.admin)
      }
    } catch (error) {
      console.log("Failed to Fetch:", error)
      return;
    }
  }

  

  useEffect(() => {
    fetchProfileDetails();
    
  }, [])
  return (
    <div className='w-full h-full flex items-center justify-center flex-col'>
      <GridCanvas />

      {/* Profile Section - Vertical & Centered */}
      <div className='w-full flex flex-col items-center justify-center gap-6 mt-20 px-4'>

        {/* Profile Image */}
        <motion.img
          src={admin?.about?.profile?.url}
          alt="My Image"
          className='
            w-[90%]
            sm:w-[50%]
            md:w-[40%]
            lg:w-[30%]
            xl:w-[25%]
            max-w-[380px]
            h-auto
            aspect-[3/4]
            object-cover
            relative z-[20]
            rounded-2xl
          '
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* About Text */}
        <motion.p
          className='
            text-justify
            text-base
            sm:text-lg
            md:text-xl
            leading-relaxed
            w-[90%]
            sm:w-[80%]
            md:w-[70%]
            lg:w-[60%]
            xl:w-[50%]
            max-w-[700px]
          '
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }}
        >
          {admin?.about?.aboutDesc}
        </motion.p>
      </div>

      {/* Other Sections */}
      <Skills />
      <Experience />
      <Education />

      {/* Bottom Space */}
      <div className='w-full mb-5 mt-9 h-10' />
    </div>
  )
}

export default About