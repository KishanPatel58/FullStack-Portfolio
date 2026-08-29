import React from 'react'
import GridCanvas from '../components/ui/GridCanvas'
import { UseMyContext } from '../context/MyContext'
import Experience from '../sections/Experience';
import Skills from '../sections/Skills';
import Menu from '../components/ui/Menu';
import Education from '../sections/Education';

const About = () => {
  const { Profile } = UseMyContext();
  return (
    <div className='w-full min-h-screen flex items-center justify-center flex-col'>
      {/* Menu */}
      <Menu />
      <GridCanvas />
      <div className='w-full flex flex-col items-center justify-center gap-3 mt-20 sm:flex-row sm:justify-start sm:items-start sm:px-6 lg:px-15'>
        <img src={Profile.me.myImg} alt="My Image" className='w-[90%] h-[40vh] sm:w-[200vh] sm:h-[40vh] sm:cover md:w-[60vh] relative z-[20] rounded-2xl'/>
        <p className='text-justify px-4 sm:text-xl'>{Profile.me.about}</p>
      </div>
      <Skills />
      <Experience />
      <Education />
    </div>
  )
}

export default About