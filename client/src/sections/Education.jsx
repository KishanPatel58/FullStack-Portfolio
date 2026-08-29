import React from 'react'
import { UseMyContext } from '../context/MyContext'

const Education = () => {
    const { Education } = UseMyContext()
    return (
        <div className='px-5 h-auto flex flex-col items-start justify-start w-[90%] gap-2 mt-65'>
            <h1 className='w-full text-start text-3xl mt-6 -ml-4'>Education<span className='animate-pulse'>_</span></h1>
            <div className='w-auto sm:w-full h-fit flex items-center justify-center relative'>
                <div className='Vertical-Stick h-full w-[2px] bg-black flex flex-col items-center justify-center relative z-40 gap-35 sm:gap-40 my-6'>
                    {
                        Education.map((edu, idx) => (
                            <div key={idx} className={`w-[20px] h-[20px] rounded-full relative bg-black`}>
                                <div className={`relative w-[76vw] sm:w-[36vh] h-fit border bg-[#dadada] px-1 rounded-lg ${idx % 2 === 0 ? "-top-3 left-[calc(100%+15px)] md:w-[47vh]" : "-top-3 -right-[calc(100%+15px)] sm:right-[calc(100%+16.5em)] md:!right-[calc(100%+21.8em)] md:!w-[47vh]"}`}>
                                    {/* Tooltip Triangle */}
                                    <div className={`${idx % 2 === 0 ? "arrow-left absolute top-3 -left-[11px]" : "arrow-left absolute -left-[11px]  top-3 sm:rotate-[180deg] sm:left-[calc(100%+2px)]"}`} />

                                    <h1 className='flex items-center border mt-1 justify-between px-1 rounded-lg'>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span className='text-xs'>{edu.year}</span>{edu.active ? <span>-</span> : ""}{edu.active ? <span className='border p-[0.8px_10px] rounded-lg text-xs flex items-center justify-center gap-2'><div className='w-[7px] h-[7px] rounded-full bg-green-500 animate-ping' /> Active</span> : ""}
                                        </div>
                                        <div className='flex items-center justify-center gap-1'>
                                            <span className='text-xs'>{edu.std} -</span>
                                            <span className='text-xs !underline'>{edu.grade}</span>
                                        </div>
                                    </h1>
                                    <h1>@{edu.schoolOrCollege}_</h1>
                                    <p className='text-justify text-sm mb-2'>{edu.description}</p>
                                </div>

                                {/* Company Logo */}
                                <div className={`hidden sm:flex absolute w-auto items-start justify-end sm:w-[40vh] bg-[#dadada] rounded-lg -top-3 ${idx % 2 === 0 ? "-left-[calc(100%+18.5em)]" : "left-[calc(100%+15px)]"}`}>
                                    {/* Tooltip Triangle */}
                                    <div className={`absolute top-3 ${idx % 2 === 0 ? "arrow-right -right-[11px]" : "arrow-left -left-[11px]"}`} />
                                    {edu.logo ? <img src={edu.logo} alt={edu.schoolOrCollege} className={`w-12 h-12 rounded-full absolute -top-1 ${idx % 2 === 0 ? "right-0" : "left-0"}`} /> : <span className={`w-12 h-12 border rounded-full flex items-center justify-center absolute -top-1 ${idx % 2 === 0 ? "right-0" : "left-0"}`}>{edu.schoolOrCollege.charAt(0)}</span>}
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Education