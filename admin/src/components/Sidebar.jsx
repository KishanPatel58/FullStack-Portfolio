import {
  BellDot,
  BookMarked,
  BookOpen,
  BriefcaseBusiness,
  ContactRound,
  FileUser,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { UseAdmin } from "../context/AdminContext";

const Sidebar = ({
  reduceSidebar,
  setReduceSidebar,
  mobileOpen,
  setMobileOpen,
}) => {
  const { admin } = UseAdmin();
  const location = useLocation();
  const [activeLink, setActiveLink] = useState("");

  const navLinks = [
    { name: "Dashboard", to: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Skills", to: "/admin/skills", icon: GraduationCap },
    { name: "Education", to: "/admin/education", icon: BookOpen },
    { name: "Experience", to: "/admin/experience", icon: BookMarked },
    { name: "Projects", to: "/admin/projects", icon: FolderGit2 },
    { name: "About", to: "/admin/about", icon: ContactRound },
    { name: "Resume", to: "/admin/resume", icon: FileUser },
    { name: "Notifications", to: "/admin/notifications", icon: BellDot },
  ];

  useEffect(() => {
    const currentTab = location.pathname.split("/")[2] || "dashboard";
    setActiveLink(currentTab.toLowerCase());
  }, [location.pathname]);

  const handleNavClick = (linkName) => {
    setActiveLink(linkName.toLowerCase());
    if (setMobileOpen) setMobileOpen(false); // Auto-close drawer on mobile route click
  };

  return (
    <aside
      className={`
        h-screen bg-[#dadada] border-r border-[#0000009b] flex flex-col justify-between shrink-0
        transition-all duration-300 ease-in-out
        fixed top-0 left-0 z-50
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:sticky
        ${reduceSidebar ? "md:w-[72px]" : "md:w-[20%] md:min-w-[230px]"}
        w-72 max-w-[85vw]
      `}
    >
      {/* =====================================================
          TOP HEADER (Locked to h-16)
      ====================================================== */}
      <div
        className={`w-full h-16 border-b border-[#0000009b] flex items-center transition-all duration-300 shrink-0 ${reduceSidebar ? "md:justify-center px-4" : "justify-between px-6"
          }`}
      >
        {/* Brand Name / Logo */}
        <div className="flex items-center gap-2 font-semibold text-lg truncate">
          <BriefcaseBusiness size={22} className="shrink-0" />
          <span className={reduceSidebar ? "md:hidden" : "block"}>
            Portfolio
          </span>
        </div>

        {/* Mobile Close Button (Screen < md) */}
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg border border-black/20 hover:bg-black hover:text-white md:hidden transition-colors cursor-pointer"
          title="Close Sidebar"
        >
          <X size={18} />
        </button>

        {/* Desktop Collapse Toggle (Screen >= md) */}
        {!reduceSidebar ? (
          <button
            type="button"
            onClick={() => setReduceSidebar(true)}
            className="hidden md:flex p-1.5 rounded-md hover:bg-black/10 transition-colors cursor-pointer relative group shrink-0"
            title="Collapse sidebar"
          >
            <PanelLeft size={20} />
            <span className="absolute top-1/2 -translate-y-1/2 left-full ml-3 px-2.5 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
              Close Sidebar
            </span>
          </button>
        ) : (
          <div className="hidden md:flex relative group w-full items-center justify-center">
            <button
              type="button"
              onClick={() => setReduceSidebar(false)}
              className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-black/10 transition-colors cursor-pointer"
            >
              <span className="group-hover:hidden transition-all text-black">
                <BriefcaseBusiness size={22} />
              </span>
              <span className="hidden group-hover:block transition-all text-black">
                <PanelLeft size={22} />
              </span>
            </button>
            <span className="absolute top-1/2 -translate-y-1/2 left-full ml-3 px-2.5 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
              Open Sidebar
            </span>
          </div>
        )}
      </div>

      {/* =====================================================
          MIDDLE NAVIGATION
      ====================================================== */}
      <nav className="w-full flex-1 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-1.5">
        {navLinks.map((link, idx) => {
          const isActive = activeLink === link.name.toLowerCase();
          const Icon = link.icon;

          return (
            <Link
              key={idx}
              to={link.to}
              onClick={() => handleNavClick(link.name)}
              className={`relative flex items-center rounded-lg text-sm font-semibold transition-all duration-200 group ${reduceSidebar
                  ? "md:justify-center p-2.5 px-3"
                  : "justify-start px-3.5 py-2.5 gap-3"
                } ${isActive
                  ? "bg-black/10 text-black"
                  : "text-black/70 hover:bg-black/5 hover:text-black"
                }`}
            >
              <Icon size={20} className="shrink-0" />

              <span className={`truncate ${reduceSidebar ? "md:hidden" : "block"}`}>
                {link.name}
              </span>

              {/* Desktop Collapsed Tooltip */}
              {reduceSidebar && (
                <span className="hidden md:block absolute left-full ml-3 px-2.5 py-1 text-xs text-white bg-black rounded-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-30 shadow-md">
                  {link.name}
                </span>
              )}

              {/* Vertical Active Indicator */}
              <span
                className={`absolute top-0 right-0 h-full w-1.5 bg-black rounded-l transition-opacity ${isActive ? "opacity-100" : "opacity-0"
                  }`}
              />

              {/* Hover Glow */}
              <span
                className={`pointer-events-none absolute inset-y-0 right-0 w-full bg-gradient-to-l from-black/20 via-black/10 to-transparent transition-transform duration-300 ease-out origin-right ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                  }`}
              />
            </Link>
          );
        })}
      </nav>

      {/* =====================================================
          BOTTOM PROFILE & ACTIONS
      ====================================================== */}
      <div className="w-full border-t border-[#0000009b] p-3 flex flex-col items-center gap-2.5 shrink-0">
        <div
          className={`w-full flex items-center ${reduceSidebar ? "md:justify-center" : "justify-start gap-3"
            }`}
        >
          <div className="relative shrink-0">
            {admin?.about?.profile?.url ? (
              <img
                src={admin.about.profile.url}
                alt="Admin Profile"
                className="w-9 h-9 object-cover rounded-full border border-black/30"
              />
            ) : (
              <span className="w-9 h-9 flex items-center justify-center border border-black/30 bg-white rounded-full font-bold text-sm">
                {(admin?.name || "A").charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div
            className={`min-w-0 flex-1 ${reduceSidebar ? "md:hidden" : "block"
              }`}
          >
            <p className="font-semibold text-xs text-black truncate leading-tight">
              {admin?.name || "Admin"}
            </p>
            <p className="text-[11px] text-black/50 truncate leading-tight mt-0.5">
              {admin?.email}
            </p>
          </div>
        </div>

        <button
          type="button"
          title={reduceSidebar ? "Sign Out" : undefined}
          className={`border-none outline-none rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors flex items-center justify-center cursor-pointer shadow-xs ${reduceSidebar ? "md:w-9 md:h-9 md:p-0 w-full py-2 px-3 gap-2 text-xs" : "w-full py-2 px-3 gap-2 text-xs"
            }`}
        >
          <span className={reduceSidebar ? "md:hidden" : "block"}>
            Sign Out
          </span>
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;