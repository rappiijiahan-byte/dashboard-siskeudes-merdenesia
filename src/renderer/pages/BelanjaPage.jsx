import { useState, useEffect } from 'react'
import { useAppStore, useBelanjaStore } from '../stores'

function BelanjaPage() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem } = useAppStore()
    const { bidangData, getTotalBelanja, deleteBelanjaItem } = useBelanjaStore()
    const [expandedBidang, setExpandedBidang] = useState(['01'])
    const isArchived = isArchiveMode()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const totalBelanja = getTotalBelanja()

    const toggleBidang = (kode) => {
        setExpandedBidang(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    const handleAddItem = (bidangKode, subKode, kegKode) => {
        setEditingItem({
            type: 'add',
            bidangKode,
            subKode,
            kegKode
        })
        openModal('addBelanja')
    }

    const handleEditItem = (item, bidangKode, subKode, kegKode) => {
        setEditingItem({
            type: 'edit',
            item,
            bidangKode,
            subKode,
            kegKode
        })
        openModal('editBelanja')
    }

    const handleDeleteItem = (item, bidangKode, subKode, kegKode) => {
        if (confirm(`Hapus item "${item.nama}"?`)) {
            deleteBelanjaItem(bidangKode, subKode, kegKode, item.id)
            addNotification({
                type: 'success',
                message: `Item "${item.nama}" berhasil dihapus`
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Belanja Desa</h1>
                    <p className="text-gray-400 mt-1">Penyusunan anggaran belanja APBDes {selectedYear}</p>
                </div>
            </div>

            {/* Archive Warning */}
            {isArchived && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                    📚 Mode Arsip - Data hanya bisa dilihat, tidak bisa diedit
                </div>
            )}

            {/* Summary */}
            <div className="glass-card p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Total Belanja</p>
                        <p className="text-3xl font-bold text-glow-magenta text-magenta-400">{formatCurrency(totalBelanja)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-magenta-500 to-cyan-500 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-3">
                {bidangData.map((bidang) => (
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
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-cyan-400 font-semibold">{bidang.kode}</span>
                                        <span className="text-white font-medium">{bidang.nama}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-semibold text-magenta-400">{formatCurrency(bidang.total)}</span>
                        </button>

                        {/* Expanded Content */}
                        {expandedBidang.includes(bidang.kode) && bidang.subBidang.length > 0 && (
                            <div className="border-t border-dark-600/50">
                                {bidang.subBidang.map((sub) => (
                                    <div key={sub.kode} className="border-b border-dark-600/30 last:border-0">
                                        <div className="flex items-center justify-between p-4 pl-12 bg-dark-700/30">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-cyan-300 text-sm">{sub.kode}</span>
                                                <span className="text-gray-300">{sub.nama}</span>
                                            </div>
                                            <span className="text-gray-300">{formatCurrency(sub.total)}</span>
                                        </div>

                                        {/* Kegiatan */}
                                        {sub.kegiatan.map((keg) => (
                                            <div key={keg.kode}>
                                                <div className="flex items-center justify-between p-3 pl-16 bg-dark-600/20">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-cyan-200 text-xs">{keg.kode}</span>
                                                        <span className="text-gray-400 text-sm">{keg.nama}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <span className="text-gray-400 text-sm">{formatCurrency(keg.total)}</span>
                                                        {!isArchived && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleAddItem(bidang.kode, sub.kode, keg.kode)
                                                                }}
                                                                className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                                                            >
                                                                + Tambah
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Items */}
                                                <div className="bg-dark-800/50">
                                                    {keg.items.map((item, idx) => (
                                                        <div
                                                            key={item.id || idx}
                                                            className="flex items-center justify-between p-3 pl-20 border-t border-dark-600/20 group hover:bg-dark-600/20"
                                                        >
                                                            <span className="text-gray-300 text-sm">{item.nama}</span>
                                                            <div className="flex items-center gap-4 text-sm">
                                                                <span className="text-gray-500">{item.volume} {item.satuan}</span>
                                                                <span className="text-gray-500">@ {formatCurrency(item.harga)}</span>
                                                                <span className="text-cyan-400 font-medium w-32 text-right">{formatCurrency(item.total)}</span>

                                                                {/* Action Buttons */}
                                                                {!isArchived && (
                                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => handleEditItem(item, bidang.kode, sub.kode, keg.kode)}
                                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                                            title="Edit"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                            </svg>
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteItem(item, bidang.kode, sub.kode, keg.kode)}
                                                                            className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-red-400"
                                                                            title="Hapus"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {/* Empty state */}
                                                    {keg.items.length === 0 && (
                                                        <div className="p-4 pl-20 text-center text-gray-500 text-sm">
                                                            Belum ada item
                                                            {!isArchived && (
                                                                <button
                                                                    onClick={() => handleAddItem(bidang.kode, sub.kode, keg.kode)}
                                                                    className="ml-2 text-cyan-400 hover:underline"
                                                                >
                                                                    + Tambah item pertama
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Empty kegiatan */}
                                        {sub.kegiatan.length === 0 && (
                                            <div className="p-4 pl-12 text-center text-gray-500 text-sm">
                                                Belum ada kegiatan dalam sub bidang ini
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty state for expandable bidang with no sub items */}
                        {expandedBidang.includes(bidang.kode) && bidang.subBidang.length === 0 && (
                            <div className="border-t border-dark-600/50 p-6 text-center">
                                <p className="text-gray-500 mb-3">Belum ada sub bidang dan kegiatan</p>
                                <p className="text-xs text-gray-600">
                                    Struktur: Bidang → Sub Bidang → Kegiatan → Item Belanja
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BelanjaPage
