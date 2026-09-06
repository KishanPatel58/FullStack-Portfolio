import { BookMarked, BookOpen, BriefcaseBusiness, ContactRound, FolderGit2, GraduationCap, LayoutDashboard, LogOut, PanelLeft } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { UseAdmin } from '../context/AdminContext';

const Sidebar = () => {
  const { admin } = UseAdmin()
  const [reduceSidebar, setReduceSidebar] = useState(false);
  const location = useLocation()
  const [activeLink, setActiveLink] = useState(null)

  const navLinks = [
    { name: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Skills", to: "/admin/skills", icon: GraduationCap },
    { name: "Education", to: "/admin/education", icon: BookOpen },
    { name: "Experience", to: "/admin/experience", icon: BookMarked },
    { name: "Projects", to: "/admin/projects", icon: FolderGit2 },
    { name: "About", to: "/admin/about", icon: ContactRound },
  ]

  useEffect(() => {
    setActiveLink(location.pathname.split("/")[2])
  }, [])

  return (
    <div className="w-[20%] h-screen sticky top-0 left-0 z-20 bg-[#dadada] border-r border-[#0000009b]">
      <div className='Top w-full h-[8%] border-b border-[#0000009b] flex items-center justify-between px-[28px]'>
        <span className='flex items-center justify-center gap-2 font-semibold'><BriefcaseBusiness /> Portfolio</span>
        <button className='hover:cursor-w-resize w-fit h-fit relative group'>
          <PanelLeft />
          <span className='absolute top-1/2 -translate-y-1/2 -right-36 shrink-0 w-auto h-auto bg-black z-10 text-white p-[6px_20px] rounded-full opacity-0 group-hover:-right-40 group-hover:opacity-100 pointer-events-none transition-all duration-300'>
            {reduceSidebar ? "Open Sidebar" : "Close Sidebar"}
            <div className='triangle-left absolute top-1/2 -translate-1/2 -left-2' />
          </span>
        </button>
      </div>
      <nav className='Middle w-full h-[79%] relative flex flex-col p-3 gap-2'>
        {
          navLinks.map((link, idx) => (
            <Link
              onClick={() => setActiveLink(link.name.toLowerCase())}
              key={idx}
              to={link.to}
              className={`overflow-hidden flex relative items-center rounded-lg justify-start text-lg font-semibold gap-2 w-full p-[7px_15px] ${activeLink === link.name.toLowerCase()
                ? "bg-[#dadada]"
                : ""}transition-all duration-300`}
            >
              <link.icon />

              {link.name}

              {/* Right white active indicator */}
              <span
                className={`h-full w-2 bg-black ${activeLink === link.name.toLowerCase()
                  ? "block absolute top-0 right-0"
                  : "hidden"
                  }`}
              />

              {/* Light effect: RIGHT → LEFT */}
              <span
                className={`pointer-events-none absolute inset-y-0 right-0 w-full bg-gradient-to-l from-black/30 via-black/15 to-transparent transition-all duration-500 ease-out ${activeLink === link.name.toLowerCase()
                  ? "scale-x-100 opacity-100 origin-right"
                  : "scale-x-0 opacity-0 origin-right"
                  }`}
              />
            </Link>
          ))
        }
      </nav>
      <div className='Bottom w-full h-[13%] border-t border-[#0000009b] relative flex items-center justify-start flex-col gap-2'>
        {/* Admin Profile */}
        <div className='flex relative items-center justify-between w-[90%] mt-2'>
          <div className='relative w-[20%] h-auto'>
            {admin?.about?.profile?.url ? <img src={admin?.about?.profile?.url} className='w-10 h-10 object-cover rounded-full' /> : <span className='w-10 h-10 flex items-center justify-center border rounded-full font-semibold text-lg'>{admin?.name?.charAt(0)}</span>}
          </div>
          <div className='flex w-[80%] items-start justify-start flex-col h-full '>
            <p className='w-full text-left font-semibold'>{admin?.name}</p>
            <p className='w-full text-left text-xs'>{admin?.email}</p>
          </div>
        </div>
        <button className='border w-[90%] bg-red-600 text-white py-1.5 border-none outline-none rounded-lg flex items-center justify-center gap-2'>Sign Out <LogOut color="#ffffff" size={18} /></button>
      </div>
    </div>
  )
}

export default Sidebar