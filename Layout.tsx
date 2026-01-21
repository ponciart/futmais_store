import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';

const Layout = () => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;