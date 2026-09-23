"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react'

export default function Navbar() {
    const navLinks = [
        { name: "Home", to: "/" },
        { name: "Work", to: "/work" },
        { name: "About", to: "/about" },
        { name: "Reviews", to: "/reviews" },
        { name: "Blog", to: "/blog" },
        { name: "Contact", to: "/contact" },
        { name: "Account", to: "/account" },
        { name: "Hire Me", to: "/hire" },
    ]
    const [currentPage, setCurrentPage] = useState("/")
    const pathname = usePathname()
    useEffect(() => {
        setCurrentPage(pathname)
    }, [pathname])
    return (
        <div className='w-full fixed top-0 left-0 border flex items-center justify-center z-[2000]'>
            <div className='w-[70%] border flex justify-between items-center py-3'>
                <h1 className='text-2xl font-bold tracking-wider'>PORTFOLIO.</h1>
                <nav className='w-auto flex items-center justify-center gap-4'>
                    {
                        navLinks.map((link, idx) => (
                            <Link onClick={() => setCurrentPage(link.to)} key={idx} href={link.to} className={`font-semibold ${link.to === currentPage ? "text-emerald-700" : ""} ${link.to==="/hire"?"p-[3px_15px] rounded-full bg-emerald-400 text-white":""}`}>{link.name}</Link>
                        ))
                    }
                </nav>
            </div>
        </div>
    )
}
