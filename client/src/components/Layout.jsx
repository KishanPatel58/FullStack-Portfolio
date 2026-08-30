import React from 'react'
import Navbar from './Navbar'
import { Outlet } from 'react-router-dom'
import Menu from './ui/Menu'

const Layout = () => {
  return (
    <div>
      <Menu />
      <Navbar />
      <main className='w-full h-full justify-center'>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout