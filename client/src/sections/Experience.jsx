import React from 'react'
import { UseMyContext } from '../context/MyContext'

const Experience = () => {
  const { Experience } = UseMyContext();
  return (
    <div className='px-5 h-auto flex flex-col items-start justify-start w-[90%] gap-2'>
      <h1 className='w-full text-start text-3xl mt-6 -ml-4'>Experience<span className='animate-pulse'>_</span></h1>
      <div className='w-auto sm:w-full h-fit flex items-center justify-center relative'>
        <div className='Vertical-Stick h-full w-[2px] bg-black flex flex-col items-center justify-center relative z-40 gap-80 sm:gap-70 my-6'>
          {
            Experience.map((exp, idx) => (
              <div key={idx} className={`w-[20px] h-[20px] rounded-full relative bg-black`}>
                <div className={`relative w-[76vw] sm:w-[36vh] h-fit border bg-[#dadada] px-1 rounded-lg ${idx % 2 === 0 ? "-top-3 left-[calc(100%+15px)] md:w-[47vh]" : "-top-3 -right-[calc(100%+15px)] sm:right-[calc(100%+16.5em)] md:!right-[calc(100%+21.8em)] md:!w-[47vh]"}`}>
                  {/* Tooltip Triangle */}
                  <div className={`${idx % 2 === 0 ? "arrow-left absolute top-3 -left-[11px]" : "arrow-left absolute -left-[11px]  top-3 sm:rotate-[180deg] sm:left-[calc(100%+2px)]"}`} />

                  <h1 className='flex items-center border mt-1 justify-between px-1 rounded-lg'>
                    <div className='flex items-center justify-center gap-1'>
                      <span className='text-xs'>{exp.joiningDate}</span>-{exp.currentlyWorking && exp.lastDate==="" ? <span className='border p-[0.8px_10px] rounded-lg text-xs flex items-center justify-center gap-2'><div className='w-[7px] h-[7px] rounded-full bg-green-500 animate-ping' /> Active</span> : <span className='text-xs'>{exp.lastDate}</span>}
                    </div>
                    <span className='text-xs shrink-0 !underline'>{exp.designation}</span>
                  </h1>
                  <h1>@{exp.company}_</h1>
                  <p className='text-justify text-sm mb-2'>{exp.work}</p>
                </div>

                {/* Company Logo */}
                <div className={`hidden sm:flex absolute w-auto items-start justify-end sm:w-[40vh] bg-[#dadada] rounded-lg -top-3 ${idx % 2 === 0 ? "-left-[calc(100%+18.5em)]" : "left-[calc(100%+15px)]"}`}>
                  {/* Tooltip Triangle */}
                  <div className={`absolute top-3 ${idx % 2 === 0 ? "arrow-right -right-[11px]" : "arrow-left -left-[11px]"}`}/>

                  {exp.logo ? <img src={exp.logo} alt={exp.company} className={`w-20 absolute -top-4 ${idx % 2 === 0 ? "-right-3" : "-left-3"}`}/> : <span className='w-[50px] h-[50px] border rounded-full absolute -top-1 left-[2px] flex items-center justify-center text-2xl'>{exp.company.charAt(0)}</span>}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}

export default Experience