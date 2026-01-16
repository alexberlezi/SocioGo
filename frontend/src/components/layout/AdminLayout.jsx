import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
            <Sidebar />
            <Topbar />

            <main className="lg:pl-[280px] pt-20 min-h-screen">
                <div className="w-full px-4 md:px-8 py-8 animate-fadeIn">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
