import { useState, useEffect } from 'react'
import TitleBar from './TitleBar'
import Sidebar from './Sidebar'

function Layout({ children }) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Custom Title Bar */}
            <TitleBar />

            {/* Main Content Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-auto p-6">
                    <div className="animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default Layout
