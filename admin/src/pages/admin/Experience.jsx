import { BookMarked, PencilSparkles, Plus } from 'lucide-react'
import React from 'react'
import { UseAdmin } from '../../context/AdminContext'

const Experience = () => {
  const {admin}=UseAdmin()
  return (
    <div className='relative w-full h-screen flex flex-col justify-center items-center'>
      <div className='TopBar w-full h-[8%] border-b border-[#0000009b] flex items-center justify-between px-[28px]'>
        <span className='flex items-center justify-center gap-2 text-xl font-semibold'><BookMarked size={30} /> Experience</span>
        {/* Add Skill Button */}
        <button type='button' className='bg-black text-white p-[5px_20px] rounded-lg flex items-center justify-center gap-2 font-semibold'>Add <Plus color="#ffffff" size={18} /></button>
      </div>
      <div className='MainContent w-full h-[92%] flex flex-col justify-center items-center'>
        {
          admin?.about?.experience?.length === 0 ? (<span className='flex items-center justify-center gap-2 text-xl font-semibold text-black/20 italic relative border border-dashed border-black/20 p-[9px_24px]'>No Experience Found <PencilSparkles className='text-black/20' /> 
          <div className='Top-Left absolute w-3 h-3 bg-black/25 -top-1.5 -left-1.5'/> 
          <div className='Top-Right absolute w-3 h-3 bg-black/25 -top-1.5 -right-1.5'/> 
          <div className='Bottom-Left absolute w-3 h-3 bg-black/25 -bottom-1.5 -left-1.5'/> 
          <div className='Bottom-Right absolute w-3 h-3 bg-black/25 -bottom-1.5 -right-1.5'/></span>) : (<div></div>)
        }
      </div>
    </div>
  )
}

export default Experience