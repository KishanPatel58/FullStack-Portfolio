import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'

const Layout = () => {
  return (
    <div>
        <Navbar />
        <main className='w-full h-full justify-center'>
            <Outlet />
        </main>
    </div>
  )
}

export default Layout