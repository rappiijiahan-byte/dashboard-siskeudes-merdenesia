import { useNavigate } from 'react-router-dom'
import { useAppStore, usePendapatanStore, useBelanjaStore, useVersionStore, usePembiayaan1Store, usePembiayaan2Store } from '../stores'

function Dashboard() {
    const navigate = useNavigate()
    const { openModal } = useAppStore()
    const { getTotalPendapatan } = usePendapatanStore()
    const { getTotalBelanja } = useBelanjaStore()
    const { getTotalPembiayaan1 } = usePembiayaan1Store()
    const { getTotalPembiayaan2 } = usePembiayaan2Store()
    const { commits } = useVersionStore()

    const totalPendapatan = getTotalPendapatan()
    const totalPembiayaan1 = getTotalPembiayaan1()
    const totalPembiayaan2 = getTotalPembiayaan2()

    // User requested formula: Pembiayaan 1 + Pembiayaan 2 + Pendapatan = Pagu Indikatif
    const paguIndikatif = totalPendapatan + totalPembiayaan1 + totalPembiayaan2
    const totalBelanja = getTotalBelanja()
    const sisaPagu = paguIndikatif - totalBelanja
    const persenTerpakai = paguIndikatif > 0 ? Math.round((totalBelanja / paguIndikatif) * 100) : 0

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    // Quick action handlers
    const handleAddPendapatan = () => {
        navigate('/pendapatan')
    }

    const handleAddBelanja = () => {
        navigate('/belanja')
    }

    const handleExportExcel = () => {
        openModal('export')
    }

    const handleBackupDatabase = () => {
        openModal('backup')
    }

    const handleNewCommit = () => {
        openModal('commit')
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">
                        Dashboard <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">APBDes 2026</span>
                    </h1>
                    <p className="text-gray-400 mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        Monitor Anggaran Desa secara real-time
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-ghost text-sm" onClick={handleExportExcel}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export
                    </button>
                    <button className="btn-ghost text-sm text-yellow-500 hover:text-yellow-400" onClick={handleBackupDatabase}>
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        Backup
                    </button>
                    <button className="btn-cyber group" onClick={handleNewCommit}>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Snapshot Baru
                        </span>
                    </button>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Pagu */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative glass-card p-6 h-full flex flex-col justify-between border-cyan-500/20">
                        <div className="flex items-start justify-between">
                            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 rounded">Total Pagu</span>
                        </div>
                        <div className="mt-6">
                            <p className="text-sm text-gray-400 font-medium">Pagu Indikatif</p>
                            <p className="text-xl font-bold text-white mt-1 font-mono tracking-tight">{formatCurrency(paguIndikatif)}</p>
                        </div>
                    </div>
                </div>

                {/* Pendapatan */}
                <div
                    className="glass-card p-6 cursor-pointer hover:border-green-500/40 transition-all group"
                    onClick={() => navigate('/pendapatan')}
                >
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <svg className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </div>
                    <div className="mt-6">
                        <p className="text-sm text-gray-400 font-medium">Total Pendapatan</p>
                        <p className="text-xl font-bold text-white mt-1 font-mono tracking-tight">{formatCurrency(totalPendapatan)}</p>
                    </div>
                </div>

                {/* Pembiayaan */}
                <div
                    className="glass-card p-6 cursor-pointer hover:border-purple-500/40 transition-all group"
                    onClick={() => navigate('/pembiayaan-1')}
                >
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-500 block">P1 + P2</span>
                        </div>
                    </div>
                    <div className="mt-6">
                        <p className="text-sm text-gray-400 font-medium">Total Pembiayaan</p>
                        <p className="text-xl font-bold text-white mt-1 font-mono tracking-tight">{formatCurrency(totalPembiayaan1 + totalPembiayaan2)}</p>
                    </div>
                </div>

                {/* Belanja */}
                <div
                    className="glass-card p-6 cursor-pointer hover:border-magenta-500/40 transition-all group"
                    onClick={() => navigate('/belanja')}
                >
                    <div className="flex items-start justify-between">
                        <div className="w-12 h-12 rounded-xl bg-magenta-500/10 border border-magenta-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-magenta-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${persenTerpakai <= 100 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {persenTerpakai}%
                        </span>
                    </div>
                    <div className="mt-6">
                        <p className="text-sm text-gray-400 font-medium">Total Belanja</p>
                        <p className="text-xl font-bold text-white mt-1 font-mono tracking-tight">{formatCurrency(totalBelanja)}</p>
                    </div>
                </div>
            </div>

            {/* Middle Section: Breakdown & Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Detailed Breakdown */}
                <div className="lg:col-span-2 glass-card overflow-hidden">
                    <div className="p-6 border-b border-dark-600/50 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Rincian Pagu Indikatif</h3>
                        <div className="text-xs text-gray-500 italic">Rumus: P1 + P2 + Pendapatan</div>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-300">Pendapatan Desa</span>
                                </div>
                                <span className="text-white font-medium">{formatCurrency(totalPendapatan)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                    <span className="text-gray-300">Pembiayaan 1 (Penerimaan)</span>
                                </div>
                                <span className="text-white font-medium">{formatCurrency(totalPembiayaan1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                    <span className="text-gray-300">Pembiayaan 2 (Pengeluaran)</span>
                                </div>
                                <span className="text-white font-medium">{formatCurrency(totalPembiayaan2)}</span>
                            </div>

                            <div className="pt-4 mt-4 border-t border-dark-600/50 flex items-center justify-between font-bold">
                                <span className="text-cyan-400 uppercase tracking-wider text-xs">Total Pagu Indikatif</span>
                                <span className="text-white text-lg">{formatCurrency(paguIndikatif)}</span>
                            </div>
                        </div>

                        {/* Progress Visualization */}
                        <div className="mt-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-400">Pemanfaatan Anggaran Kontra Belanja</span>
                                <span className={`text-sm font-bold ${persenTerpakai > 100 ? 'text-red-400' : 'text-cyan-400'}`}>
                                    {persenTerpakai}%
                                </span>
                            </div>
                            <div className="h-3 bg-dark-600 rounded-full overflow-hidden p-0.5 border border-dark-500">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(34,211,238,0.3)] ${persenTerpakai > 100 ? 'bg-red-500 shadow-red-500/50' : 'bg-gradient-cyber'
                                        }`}
                                    style={{ width: `${Math.min(persenTerpakai, 100)}%` }}
                                />
                            </div>
                            <div className="flex justify-between mt-3 text-xs">
                                <div className="flex flex-col">
                                    <span className="text-gray-500 uppercase text-[10px]">Terpakai</span>
                                    <span className="text-gray-300 font-medium">{formatCurrency(totalBelanja)}</span>
                                </div>
                                <div className="flex flex-col text-right">
                                    <span className="text-gray-500 uppercase text-[10px]">Sisa</span>
                                    <span className={`${sisaPagu >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                                        {formatCurrency(sisaPagu)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sisa Pagu Vertical Card */}
                <div className={`glass-card p-6 flex flex-col items-center justify-center text-center overflow-hidden relative group`}>
                    <div className={`absolute inset-0 opacity-5 pointer-events-none transition-opacity group-hover:opacity-10 ${sisaPagu >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>

                    <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-2xl ${sisaPagu >= 0 ? 'bg-green-500/20 text-green-400 ring-2 ring-green-500/20' : 'bg-red-500/20 text-red-400 ring-2 ring-red-500/20'}`}>
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            {sisaPagu >= 0 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            )}
                        </svg>
                    </div>

                    <h4 className="text-gray-400 font-medium mb-1 uppercase tracking-widest text-xs">Posisi Keuangan</h4>
                    <p className={`text-4xl font-black mb-2 tracking-tighter ${sisaPagu >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {sisaPagu >= 0 ? 'SURPLUS' : 'DEFISIT'}
                    </p>
                    <p className={`text-xl font-bold font-mono ${sisaPagu >= 0 ? 'text-white' : 'text-red-500'}`}>
                        {formatCurrency(Math.abs(sisaPagu))}
                    </p>

                    <div className="mt-8 w-full p-4 rounded-xl border border-dashed border-dark-500 text-xs text-gray-500 leading-relaxed italic">
                        {sisaPagu >= 0
                            ? "Dana tersedia mencukupi untuk seluruh rencana belanja yang telah diinput."
                            : "Segera lakukan penyesuaian pada Bidang Belanja atau cari sumber Pendapatan baru."}
                    </div>
                </div>
            </div>

            {/* Bottom Section: Commits & Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Snapshots */}
                <div className="glass-card flex flex-col">
                    <div className="p-6 border-b border-dark-600/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3 className="font-semibold text-white">Snapshot Terakhir</h3>
                        </div>
                        <button onClick={() => navigate('/history')} className="text-xs text-cyan-400 hover:underline">Riwayat Lengkap</button>
                    </div>
                    <div className="p-2 space-y-1">
                        {commits.slice(0, 4).map((commit) => (
                            <div
                                key={commit.id}
                                onClick={() => navigate('/history')}
                                className={`group p-4 rounded-xl cursor-pointer hover:bg-dark-600/50 transition-all border border-transparent ${commit.status === 'current' ? 'bg-cyan-500/5 border-cyan-500/20' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono font-bold ${commit.status === 'current' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-dark-700 text-gray-500'}`}>
                                            v{commit.version}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-1">{commit.message}</p>
                                            <p className="text-[10px] text-gray-500 uppercase mt-0.5 font-mono">{commit.date}</p>
                                        </div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-700 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="glass-card p-6 grid grid-cols-2 gap-4">
                    <button onClick={handleAddPendapatan} className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-dark-700/50 border border-dark-600 hover:border-green-500/50 hover:bg-green-500/5 transition-all">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Entri Pendapatan</span>
                        <span className="text-[10px] text-gray-500 mt-1">Input Penerimaan Desa</span>
                    </button>

                    <button onClick={handleAddBelanja} className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-dark-700/50 border border-dark-600 hover:border-magenta-500/50 hover:bg-magenta-500/5 transition-all">
                        <div className="w-12 h-12 rounded-full bg-magenta-500/10 text-magenta-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Rencana Belanja</span>
                        <span className="text-[10px] text-gray-500 mt-1">Alokasi Kegiatan Desa</span>
                    </button>

                    <button onClick={() => navigate('/kegiatan')} className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-dark-700/50 border border-dark-600 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Daftar Kegiatan</span>
                        <span className="text-[10px] text-gray-500 mt-1">Paket-paket Pekerjaan</span>
                    </button>

                    <button onClick={() => navigate('/history')} className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-dark-700/50 border border-dark-600 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all">
                        <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span className="text-sm font-semibold text-white">Sistem Kontrol</span>
                        <span className="text-[10px] text-gray-500 mt-1">Version Control APBDes</span>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
