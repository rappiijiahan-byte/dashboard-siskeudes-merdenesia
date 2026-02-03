import { useState, useEffect } from 'react'

function TitleBar() {
    const [isMaximized, setIsMaximized] = useState(false)

    useEffect(() => {
        const checkMaximized = async () => {
            if (window.electronAPI) {
                const maximized = await window.electronAPI.isMaximized()
                setIsMaximized(maximized)
            }
        }
        checkMaximized()
    }, [])

    const handleMinimize = () => window.electronAPI?.minimize()
    const handleMaximize = async () => {
        window.electronAPI?.maximize()
        const maximized = await window.electronAPI?.isMaximized()
        setIsMaximized(maximized)
    }
    const handleClose = () => window.electronAPI?.close()

    return (
        <header className="titlebar h-10 flex items-center justify-between bg-dark-800/90 border-b border-dark-600/50 backdrop-blur-sm">
            {/* Logo & App Name */}
            <div className="flex items-center gap-3 px-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-cyber flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <span className="text-sm font-semibold text-glow-cyan text-cyan-400">
                    APBDes Version Control
                </span>
            </div>

            {/* Window Controls */}
            <div className="flex items-center">
                {/* Minimize */}
                <button
                    onClick={handleMinimize}
                    className="w-12 h-10 flex items-center justify-center hover:bg-dark-600/50 transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                </button>

                {/* Maximize/Restore */}
                <button
                    onClick={handleMaximize}
                    className="w-12 h-10 flex items-center justify-center hover:bg-dark-600/50 transition-colors"
                >
                    {isMaximized ? (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v2m0 8v2a2 2 0 002 2h2m8 0h2a2 2 0 002-2v-2m0-8V6a2 2 0 00-2-2h-2" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                    )}
                </button>

                {/* Close */}
                <button
                    onClick={handleClose}
                    className="w-12 h-10 flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                    <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </header>
    )
}

export default TitleBar
