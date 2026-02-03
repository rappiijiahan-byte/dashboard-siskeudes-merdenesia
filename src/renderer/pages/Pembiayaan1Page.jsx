import { useState } from 'react'
import { useAppStore, usePembiayaan1Store } from '../stores'

function Pembiayaan1Page() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem } = useAppStore()
    const { kategoriPembiayaan1, addItem, updateItem, deleteItem, getTotalPembiayaan1, getSubTotal } = usePembiayaan1Store()
    const [expandedKategori, setExpandedKategori] = useState(['6.1'])
    const [expandedSub, setExpandedSub] = useState(['6.1.1'])
    const isArchived = isArchiveMode()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const totalPembiayaan1 = getTotalPembiayaan1()

    const toggleKategori = (kode) => {
        setExpandedKategori(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    const toggleSub = (kode) => {
        setExpandedSub(prev =>
            prev.includes(kode) ? prev.filter(k => k !== kode) : [...prev, kode]
        )
    }

    const handleAddItem = (kategoriKode, subKode) => {
        setEditingItem({ mode: 'add', pageType: 'P1', katKode: kategoriKode, subKode })
        openModal('pembiayaan')
    }

    const handleEditItem = (item, kategoriKode, subKode) => {
        setEditingItem({ mode: 'edit', pageType: 'P1', katKode: kategoriKode, subKode, data: item })
        openModal('pembiayaan')
    }

    const handleDeleteItem = (item, kategoriKode, subKode) => {
        if (confirm(`Hapus "${item.uraian}"?`)) {
            deleteItem(kategoriKode, subKode, item.id)
            addNotification({
                type: 'success',
                message: 'Item berhasil dihapus'
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pembiayaan 1</h1>
                    <p className="text-gray-400 mt-1">
                        Penerimaan Pembiayaan - APBDes {selectedYear}
                    </p>
                </div>
            </div>

            {/* Archive Warning */}
            {isArchived && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                    📚 Mode Arsip - Data hanya bisa dilihat, tidak bisa diedit
                </div>
            )}

            {/* Total Card */}
            <div className="glass-card p-6 gradient-border">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">Total Penerimaan Pembiayaan</p>
                        <p className="text-3xl font-bold text-glow-cyan text-cyan-400">{formatCurrency(totalPembiayaan1)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-cyber flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-3">
                {kategoriPembiayaan1.map((kategori) => (
                    <div key={kategori.kode} className="glass-card overflow-hidden">
                        {/* Kategori Header */}
                        <button
                            onClick={() => toggleKategori(kategori.kode)}
                            className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <svg
                                    className={`w-5 h-5 text-gray-400 transition-transform ${expandedKategori.includes(kategori.kode) ? 'rotate-90' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                <div className="text-left">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-green-400 font-semibold">{kategori.kode}</span>
                                        <span className="text-white font-medium">{kategori.nama}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-semibold text-green-400">{formatCurrency(getTotalPembiayaan1())}</span>
                        </button>

                        {/* Expanded Sub Kategori */}
                        {expandedKategori.includes(kategori.kode) && kategori.subKategori.length > 0 && (
                            <div className="border-t border-dark-600/50">
                                {kategori.subKategori.map((sub) => (
                                    <div key={sub.kode} className="border-b border-dark-600/30 last:border-0">
                                        {/* Sub Kategori Header */}
                                        <button
                                            onClick={() => toggleSub(sub.kode)}
                                            className="w-full flex items-center justify-between p-4 pl-12 bg-dark-700/30 hover:bg-dark-600/40 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <svg
                                                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedSub.includes(sub.kode) ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className="font-mono text-cyan-300 text-sm">{sub.kode}</span>
                                                <span className="text-gray-300">{sub.nama}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-300">{formatCurrency(getSubTotal(kategori.kode, sub.kode))}</span>
                                                {!isArchived && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleAddItem(kategori.kode, sub.kode)
                                                        }}
                                                        className="px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/30 transition-colors"
                                                    >
                                                        + Tambah
                                                    </button>
                                                )}
                                            </div>
                                        </button>

                                        {/* Items */}
                                        {expandedSub.includes(sub.kode) && (
                                            <div className="bg-dark-800/50">
                                                {sub.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex items-center justify-between p-3 pl-20 border-t border-dark-600/20 group hover:bg-dark-600/20"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-mono text-cyan-200 text-xs">{item.kode}</span>
                                                            <span className="text-gray-300 text-sm">{item.uraian}</span>
                                                        </div>
                                                        <div className="flex items-center gap-4 text-sm">
                                                            <span className="text-cyan-400 font-medium w-32 text-right">{formatCurrency(item.jumlah)}</span>

                                                            {/* Action Buttons */}
                                                            {!isArchived && (
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleEditItem(item, kategori.kode, sub.kode)}
                                                                        className="p-1 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400"
                                                                        title="Edit"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteItem(item, kategori.kode, sub.kode)}
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
                                                {sub.items.length === 0 && (
                                                    <div className="p-4 pl-20 text-center text-gray-500 text-sm">
                                                        Belum ada item
                                                        {!isArchived && (
                                                            <button
                                                                onClick={() => handleAddItem(kategori.kode, sub.kode)}
                                                                className="ml-2 text-cyan-400 hover:underline"
                                                            >
                                                                + Tambah item pertama
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Pembiayaan1Page
