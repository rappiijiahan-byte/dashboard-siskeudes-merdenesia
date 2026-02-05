import { NavLink } from 'react-router-dom'
import { useAppStore } from '../stores'

const menuItems = [
    {
        path: '/',
        label: 'Dashboard',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        )
    },
    {
        path: '/kegiatan',
        label: 'Kegiatan',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        )
    },
    {
        path: '/pendapatan',
        label: 'Pendapatan',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    },
    {
        path: '/belanja',
        label: 'Belanja',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        )
    },
    {
        path: '/pembiayaan-1',
        label: 'Pembiayaan 1',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        )
    },
    {
        path: '/pembiayaan-2',
        label: 'Pembiayaan 2',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
        )
    },
    {
        path: '/history',
        label: 'Riwayat Versi',
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        )
    }
]

function Sidebar({ isCollapsed, onToggle }) {
    const { selectedYear, setSelectedYear, years, currentProject } = useAppStore()

    const handleYearChange = (e) => {
        const year = Number(e.target.value)
        setSelectedYear(year)
        useAppStore.getState().addNotification({
            type: 'info',
            message: `Beralih ke APBDes ${year}`
        })
    }

    const isArchived = selectedYear !== 2026

    return (
        <aside className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 bg-dark-800/50 border-r border-dark-600/50 flex flex-col`}>
            {/* Year Selector */}
            {!isCollapsed && (
                <div className="p-3 border-b border-dark-600/50">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">
                        Tahun Anggaran
                    </label>
                    <div className="flex gap-2">
                        <select
                            value={selectedYear}
                            onChange={handleYearChange}
                            className="flex-1 px-2 py-1 bg-dark-700 border border-dark-500 rounded-lg text-cyan-400 text-sm font-semibold focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                            {years.map(year => (
                                <option key={year.tahun} value={year.tahun}>
                                    APBDes {year.tahun}
                                    {year.status === 'Active' ? ' (Aktif)' : ' (Arsip)'}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={() => useAppStore.getState().openModal('addYear')}
                            className="px-2 py-1 bg-dark-700 border border-dark-500 rounded-lg text-cyan-400 hover:bg-dark-600 hover:border-cyan-500 transition-colors"
                            title="Tambah Tahun Anggaran Baru"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-2 flex items-center gap-2">
                        {isArchived ? (
                            <span className="badge-archived">Archived</span>
                        ) : (
                            <span className="badge-draft">{currentProject?.status || 'Draft'}</span>
                        )}
                        <span className="text-xs text-gray-500">v{currentProject?.currentVersion || '1.0'}</span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `sidebar-item ${isActive ? 'active' : ''} ${isCollapsed ? 'justify-center px-0' : ''}`
                        }
                    >
                        <span className={isCollapsed ? '' : ''}>{item.icon}</span>
                        {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            {/* Toggle Button */}
            <div className="p-3 border-t border-dark-600/50">
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-dark-600/50 text-gray-400 transition-colors"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg
                        className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                </button>
            </div>
        </aside>
    )
}

export default Sidebar
