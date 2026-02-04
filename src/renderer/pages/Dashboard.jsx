import { useNavigate } from 'react-router-dom'
import { useAppStore, usePendapatanStore, useBelanjaStore, useVersionStore } from '../stores'

function Dashboard() {
    const navigate = useNavigate()
    const { openModal } = useAppStore()
    const { getTotalPendapatan } = usePendapatanStore()
    const { getTotalBelanja } = useBelanjaStore()
    const { commits } = useVersionStore()

    const paguIndikatif = getTotalPendapatan()
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
        setTimeout(() => openModal('addPendapatan'), 100)
    }

    const handleAddBelanja = () => {
        navigate('/belanja')
    }

    const handleExportExcel = () => {
        openModal('export')
    }

    const handleNewCommit = () => {
        openModal('commit')
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Dashboard <span className="text-cyan-400">APBDes 2026</span>
                    </h1>
                    <p className="text-gray-400 mt-1">Ringkasan anggaran desa tahun berjalan</p>
                </div>
                <button className="btn-cyber" onClick={handleNewCommit}>
                    <span className="flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Commit Baru
                    </span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Pagu Indikatif */}
                <div
                    className="glass-card p-6 cursor-pointer hover:border-cyan-500/50 transition-colors"
                    onClick={() => navigate('/pendapatan')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <span className="badge-final">Pendapatan</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Pagu Indikatif</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(paguIndikatif)}</p>
                </div>

                {/* Total Belanja */}
                <div
                    className="glass-card p-6 cursor-pointer hover:border-magenta-500/50 transition-colors"
                    onClick={() => navigate('/belanja')}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-magenta-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-magenta-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <span className="badge-draft">Belanja</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Total Belanja</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(totalBelanja)}</p>
                </div>

                {/* Sisa Pagu */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl ${sisaPagu >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'} flex items-center justify-center`}>
                            <svg className={`w-6 h-6 ${sisaPagu >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {sisaPagu >= 0 ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                )}
                            </svg>
                        </div>
                        <span className={`text-sm font-medium ${sisaPagu >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {sisaPagu >= 0 ? 'Tersedia' : 'Defisit!'}
                        </span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Sisa Pagu</p>
                    <p className={`text-2xl font-bold ${sisaPagu >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatCurrency(Math.abs(sisaPagu))}
                    </p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">Penggunaan Anggaran</h3>
                    <span className={`font-bold ${persenTerpakai > 100 ? 'text-red-400' : 'text-cyan-400'}`}>
                        {persenTerpakai}%
                    </span>
                </div>
                <div className="h-4 bg-dark-600 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${persenTerpakai > 100 ? 'bg-red-500' : 'bg-gradient-cyber'
                            }`}
                        style={{ width: `${Math.min(persenTerpakai, 100)}%` }}
                    />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                    <span>Terpakai: {formatCurrency(totalBelanja)}</span>
                    <span>Sisa: {formatCurrency(sisaPagu)}</span>
                </div>
                {persenTerpakai > 100 && (
                    <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                        ⚠️ Belanja melebihi Pagu Indikatif! Harap kurangi belanja atau tambah pendapatan.
                    </div>
                )}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={handleAddPendapatan} className="btn-ghost flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            Tambah Pendapatan
                        </button>
                        <button onClick={handleAddBelanja} className="btn-ghost flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Tambah Belanja
                        </button>
                        <button onClick={handleExportExcel} className="col-span-2 btn-ghost flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                            </svg>
                            Export Excel
                        </button>

                    </div>
                </div>

                {/* Recent Commits */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Riwayat Commit</h3>
                        <button
                            onClick={() => navigate('/history')}
                            className="text-sm text-cyan-400 hover:text-cyan-300"
                        >
                            Lihat semua →
                        </button>
                    </div>
                    <div className="space-y-3">
                        {commits.slice(0, 3).map((commit, index) => (
                            <div
                                key={commit.id}
                                onClick={() => navigate('/history')}
                                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-dark-500/30 transition-colors ${commit.status === 'current' ? 'bg-cyan-500/10 border border-cyan-500/30' : 'bg-dark-600/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${commit.status === 'current' ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                                    <div>
                                        <p className="text-sm font-medium text-white">{commit.message}</p>
                                        <p className="text-xs text-gray-500">{commit.date}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-mono ${commit.status === 'current' ? 'text-cyan-400' : 'text-gray-500'}`}>
                                    v{commit.version}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard
