import { useState } from 'react'
import { useAppStore, useKegiatanStore } from '../stores'

function KegiatanPage() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem } = useAppStore()
    const {
        bidangKegiatan,
        addSubBidang, updateSubBidang, deleteSubBidang,
        addKegiatan, updateKegiatan, deleteKegiatan,
        addPaket, updatePaket, deletePaket,
        getTotalPaket
    } = useKegiatanStore()

    const [expandedBidang, setExpandedBidang] = useState(['04.2002.01'])
    const [expandedSubBidang, setExpandedSubBidang] = useState(['04.2002.01.01.'])
    const [expandedKegiatan, setExpandedKegiatan] = useState(['04.2002.01.01.01.'])
    const isArchived = isArchiveMode()

    const toggleBidang = (kode) => {
        setExpandedBidang(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    const toggleSubBidang = (kode) => {
        setExpandedSubBidang(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    const toggleKegiatan = (kode) => {
        setExpandedKegiatan(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    // Add handlers
    const handleAddSubBidang = (bidangKode) => {
        setEditingItem({ mode: 'add', type: 'subBidang', parentKeys: { bidang: bidangKode } })
        openModal('kegiatanForm')
    }

    const handleAddKegiatan = (bidangKode, subKode) => {
        setEditingItem({ mode: 'add', type: 'kegiatan', parentKeys: { bidang: bidangKode, sub: subKode } })
        openModal('kegiatanForm')
    }

    const handleAddPaket = (bidangKode, subKode, kegKode) => {
        setEditingItem({ mode: 'add', type: 'paket', parentKeys: { bidang: bidangKode, sub: subKode, keg: kegKode } })
        openModal('kegiatanForm')
    }

    // Edit handlers
    const handleEditSubBidang = (bidangKode, sub) => {
        setEditingItem({ mode: 'edit', type: 'subBidang', data: sub, parentKeys: { bidang: bidangKode } })
        openModal('kegiatanForm')
    }

    const handleEditKegiatan = (bidangKode, subKode, keg) => {
        setEditingItem({ mode: 'edit', type: 'kegiatan', data: keg, parentKeys: { bidang: bidangKode, sub: subKode } })
        openModal('kegiatanForm')
    }

    const handleEditPaket = (bidangKode, subKode, kegKode, paket) => {
        setEditingItem({ mode: 'edit', type: 'paket', data: paket, parentKeys: { bidang: bidangKode, sub: subKode, keg: kegKode } })
        openModal('kegiatanForm')
    }

    // Delete handlers
    const handleDeleteSubBidang = (bidangKode, sub) => {
        if (confirm(`Hapus Sub Bidang "${sub.nama}"?`)) {
            deleteSubBidang(bidangKode, sub.kode)
            addNotification({ type: 'success', message: 'Sub Bidang berhasil dihapus' })
        }
    }

    const handleDeleteKegiatan = (bidangKode, subKode, keg) => {
        if (confirm(`Hapus Kegiatan "${keg.nama}"?`)) {
            deleteKegiatan(bidangKode, subKode, keg.kode)
            addNotification({ type: 'success', message: 'Kegiatan berhasil dihapus' })
        }
    }

    const handleDeletePaket = (bidangKode, subKode, kegKode, paket) => {
        if (confirm(`Hapus Paket "${paket.nama}"?`)) {
            deletePaket(bidangKode, subKode, kegKode, paket.id)
            addNotification({ type: 'success', message: 'Paket berhasil dihapus' })
        }
    }

    const handleViewPaket = (paket) => {
        setEditingItem(paket)
        openModal('viewPaket')
    }

    const totalPaket = getTotalPaket()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kegiatan</h1>
                    <p className="text-gray-400 mt-1">
                        Pengelolaan Bidang, Sub Bidang, Kegiatan & Paket - APBDes {selectedYear}
                    </p>
                </div>
            </div>

            {/* Archive Warning */}
            {isArchived && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                    📚 Mode Arsip - Data hanya bisa dilihat, tidak bisa diedit
                </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Total Bidang</p>
                    <p className="text-2xl font-bold text-cyan-400">{bidangKegiatan.length}</p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Total Sub Bidang</p>
                    <p className="text-2xl font-bold text-purple-400">
                        {bidangKegiatan.reduce((acc, b) => acc + b.subBidang.length, 0)}
                    </p>
                </div>
                <div className="glass-card p-4">
                    <p className="text-sm text-gray-400 mb-1">Total Paket</p>
                    <p className="text-2xl font-bold text-green-400">{totalPaket}</p>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-3">
                {bidangKegiatan.map((bidang) => (
                    <div key={bidang.kode} className="glass-card overflow-hidden">
                        {/* Bidang Header */}
                        <button
                            onClick={() => toggleBidang(bidang.kode)}
                            className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedBidang.includes(bidang.kode) ? 'rotate-90' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="text-left">
                                    <span className="font-mono text-cyan-400 font-semibold mr-2">{bidang.kode}</span>
                                    <span className="text-white font-medium">{bidang.nama}</span>
                                </div>
                            </div>
                            <span className="text-gray-400 text-sm">{bidang.subBidang.length} Sub Bidang</span>
                        </button>

                        {/* Expanded Bidang Content */}
                        {expandedBidang.includes(bidang.kode) && (
                            <div className="border-t border-dark-600/50">
                                {/* Add Sub Bidang Button */}
                                {!isArchived && (
                                    <div className="p-2 pl-12 bg-dark-700/20">
                                        <button
                                            onClick={() => handleAddSubBidang(bidang.kode)}
                                            className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                        >
                                            + Tambah Sub Bidang
                                        </button>
                                    </div>
                                )}

                                {bidang.subBidang.map((sub) => (
                                    <div key={sub.kode} className="border-b border-dark-600/30 last:border-0">
                                        {/* Sub Bidang Header */}
                                        <div className="flex items-center justify-between p-3 pl-12 bg-dark-700/30 hover:bg-dark-600/30">
                                            <button
                                                onClick={() => toggleSubBidang(sub.kode)}
                                                className="flex items-center gap-3 flex-1 text-left"
                                            >
                                                <svg
                                                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedSubBidang.includes(sub.kode) ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className="font-mono text-purple-400 text-sm">{sub.kode}</span>
                                                <span className="text-gray-300 text-sm">{sub.nama}</span>
                                            </button>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-xs">{sub.kegiatan.length} Kegiatan</span>
                                                {!isArchived && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => handleEditSubBidang(bidang.kode, sub)}
                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSubBidang(bidang.kode, sub)}
                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-red-400"
                                                            title="Hapus"
                                                        >
                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expanded Sub Bidang Content */}
                                        {expandedSubBidang.includes(sub.kode) && (
                                            <div className="bg-dark-800/30">
                                                {/* Add Kegiatan Button */}
                                                {!isArchived && (
                                                    <div className="p-2 pl-16">
                                                        <button
                                                            onClick={() => handleAddKegiatan(bidang.kode, sub.kode)}
                                                            className="px-3 py-1 text-xs bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                                                        >
                                                            + Tambah Kegiatan
                                                        </button>
                                                    </div>
                                                )}

                                                {sub.kegiatan.map((keg) => (
                                                    <div key={keg.kode}>
                                                        {/* Kegiatan Header */}
                                                        <div className="flex items-center justify-between p-3 pl-16 bg-dark-600/20 hover:bg-dark-600/30">
                                                            <button
                                                                onClick={() => toggleKegiatan(keg.kode)}
                                                                className="flex items-center gap-3 flex-1 text-left"
                                                            >
                                                                <svg
                                                                    className={`w-3 h-3 text-gray-500 transition-transform ${expandedKegiatan.includes(keg.kode) ? 'rotate-90' : ''}`}
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                </svg>
                                                                <span className="font-mono text-green-400 text-xs">{keg.kode}</span>
                                                                <span className="text-gray-400 text-sm">{keg.nama}</span>
                                                            </button>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-gray-500 text-xs">{keg.paket.length} Paket</span>
                                                                {!isArchived && (
                                                                    <div className="flex gap-1">
                                                                        <button
                                                                            onClick={() => handleEditKegiatan(bidang.kode, sub.kode, keg)}
                                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                                            title="Edit"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteKegiatan(bidang.kode, sub.kode, keg)}
                                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-red-400"
                                                                            title="Hapus"
                                                                        >
                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Expanded Kegiatan Content - Paket Table */}
                                                        {expandedKegiatan.includes(keg.kode) && (
                                                            <div className="bg-dark-800/50 pl-20 pr-4 py-2">
                                                                {/* Add Paket Button */}
                                                                {!isArchived && (
                                                                    <div className="mb-2">
                                                                        <button
                                                                            onClick={() => handleAddPaket(bidang.kode, sub.kode, keg.kode)}
                                                                            className="px-3 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                                                                        >
                                                                            + Tambah Paket
                                                                        </button>
                                                                    </div>
                                                                )}

                                                                {keg.paket.length > 0 ? (
                                                                    <table className="w-full text-sm">
                                                                        <thead>
                                                                            <tr className="text-left text-gray-500 border-b border-dark-600/50">
                                                                                <th className="py-2 pr-4">ID</th>
                                                                                <th className="py-2 pr-4">Nama Paket</th>
                                                                                <th className="py-2 pr-4">Uraian Output</th>
                                                                                <th className="py-2 pr-4 text-right">Volume</th>
                                                                                <th className="py-2 pr-4">Satuan</th>
                                                                                {!isArchived && <th className="py-2 w-20">Aksi</th>}
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {keg.paket.map((paket, idx) => (
                                                                                <tr key={paket.id} className="border-b border-dark-600/30 group hover:bg-dark-600/20">
                                                                                    <td className="py-2 pr-4 font-mono text-cyan-400">{String(idx + 1).padStart(2, '0')}</td>
                                                                                    <td className="py-2 pr-4 text-gray-300">{paket.nama}</td>
                                                                                    <td className="py-2 pr-4 text-gray-400">{paket.uraianOutput}</td>
                                                                                    <td className="py-2 pr-4 text-right text-gray-300">{paket.volume.toFixed(2)}</td>
                                                                                    <td className="py-2 pr-4 text-gray-400">{paket.satuan}</td>
                                                                                    <td className="py-2">
                                                                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                            <button
                                                                                                onClick={() => handleViewPaket(paket)}
                                                                                                className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                                                                title="Lihat Rincian"
                                                                                            >
                                                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                                                </svg>
                                                                                            </button>
                                                                                            {!isArchiveMode() && (
                                                                                                <>
                                                                                                    <button
                                                                                                        onClick={() => handleEditPaket(bidang.kode, sub.kode, keg.kode, paket)}
                                                                                                        className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                                                                        title="Edit"
                                                                                                    >
                                                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                                        </svg>
                                                                                                    </button>
                                                                                                    <button
                                                                                                        onClick={() => handleDeletePaket(bidang.kode, sub.kode, keg.kode, paket)}
                                                                                                        className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-red-400"
                                                                                                        title="Hapus"
                                                                                                    >
                                                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                                        </svg>
                                                                                                    </button>
                                                                                                </>
                                                                                            )}
                                                                                        </div>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                ) : (
                                                                    <p className="text-gray-500 text-sm py-2">Belum ada paket kegiatan</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}

                                                {sub.kegiatan.length === 0 && (
                                                    <p className="text-gray-500 text-sm py-3 pl-16">Belum ada kegiatan</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {bidang.subBidang.length === 0 && (
                                    <p className="text-gray-500 text-sm py-4 pl-12">Belum ada sub bidang</p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default KegiatanPage
