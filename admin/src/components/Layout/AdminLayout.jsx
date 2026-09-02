import React from "react";
import Sidebar from "../Sidebar";
import { Outlet } from "react-router-dom";

const AdminLayout = () => {
  return (
    <div className="w-full min-h-screen flex relative">
      <Sidebar />

      <main className="w-[80%] min-h-screen relative">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;