import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, BriefcaseBusiness } from "lucide-react";
import Sidebar from "../Sidebar";

const AdminLayout = () => {
  const [reduceSidebar, setReduceSidebar] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="w-full h-screen flex bg-[#dadada] relative overflow-hidden">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity"
        />
      )}

      {/* Fixed Sidebar */}
      <Sidebar
        reduceSidebar={reduceSidebar}
        setReduceSidebar={setReduceSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Container: takes remaining width and handles vertical scrolling */}
      <div className="flex-1 min-w-0 h-screen flex flex-col overflow-hidden">
        {/* Mobile Header Bar (< md) */}
        <div className="w-full h-16 border-b border-[#0000009b] bg-[#dadada] flex md:hidden items-center justify-between px-5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg border border-black/20 bg-white/60 hover:bg-black hover:text-white transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu size={20} />
          </button>

          <span className="flex items-center gap-2 font-semibold text-sm">
            <BriefcaseBusiness size={18} /> Portfolio Admin
          </span>

          <div className="w-9" />
        </div>

        {/* Scrollable Content Container */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;