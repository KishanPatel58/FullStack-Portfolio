import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../Navbar'

const HomeLayout = () => {
    return (
        <div className='relative flex items-center justify-center flex-col'>
            <Navbar className="w-full h-full border "/>
            <main className='w-full h-full justify-center'>
                <Outlet />
            </main>
        </div>
    )
}

export default HomeLayout