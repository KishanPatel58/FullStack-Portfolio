import { LayoutDashboard } from 'lucide-react'
import React from 'react'

const Dashboard = () => {
  return (
    <div className='relative w-full h-screen flex flex-col justify-center items-center'>
      <div className='TopBar w-full h-[8%] border-b border-[#0000009b] flex items-center justify-between px-[28px]'>
        <span className='flex items-center justify-center gap-2 text-xl font-semibold'><LayoutDashboard /> Dashboard</span>
      </div>
      <div className='MainContent w-full h-[92%]'>
        hello
      </div>
    </div>
  )
}

export default Dashboard