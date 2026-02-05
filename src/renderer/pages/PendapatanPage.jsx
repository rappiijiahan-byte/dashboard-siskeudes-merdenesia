import { useState } from 'react'
import { useAppStore, usePendapatanStore } from '../stores'
import { exportPendapatanPage, downloadFile } from '../services/exportService'

function PendapatanPage() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem } = useAppStore()
    const {
        pendapatan,
        deletePendapatanCategory,
        deleteItem,
        getTotalPendapatan
    } = usePendapatanStore()

    const [expandedRows, setExpandedRows] = useState([1]) // Default expand first category
    const isArchived = isArchiveMode()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount || 0)
    }

    const toggleRow = (id) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        )
    }

    const totalPendapatan = getTotalPendapatan()

    const handleExport = async () => {
        try {
            const buffer = await exportPendapatanPage({ pendapatan }, selectedYear)
            downloadFile(buffer, `Pendapatan_${selectedYear}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            addNotification({ type: 'success', message: 'Export berhasil' })
        } catch (error) {
            console.error(error)
            addNotification({ type: 'error', message: 'Export gagal: ' + error.message })
        }
    }

    const handleAddCategory = () => {
        setEditingItem({ mode: 'add', type: 'category' })
        openModal('pendapatan')
    }

    const handleEditCategory = (cat) => {
        setEditingItem({ mode: 'edit', type: 'category', data: cat })
        openModal('pendapatan')
    }

    const handleDeleteCategory = (cat) => {
        if (confirm(`Hapus kategori "${cat.sumber}"?`)) {
            deletePendapatanCategory(cat.id)
            addNotification({ type: 'success', message: 'Kategori berhasil dihapus' })
        }
    }

    const handleAddItem = (categoryId) => {
        setEditingItem({ mode: 'add', type: 'item', parentId: categoryId })
        openModal('pendapatan')
    }

    const handleEditItem = (categoryId, item) => {
        setEditingItem({ mode: 'edit', type: 'item', data: item, parentId: categoryId })
        openModal('pendapatan')
    }

    const handleDeleteItem = (categoryId, item) => {
        if (confirm(`Hapus rincian "${item.uraian}"?`)) {
            deleteItem(categoryId, item.id)
            addNotification({ type: 'success', message: 'Rincian berhasil dihapus' })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pendapatan Desa</h1>
                    <p className="text-gray-400 mt-1">
                        Kelola sumber pendapatan APBDes {selectedYear}
                    </p>
                </div>
                {!isArchived && (
                    <div className="flex gap-3">
                        <button
                            onClick={handleExport}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Export Excel
                        </button>
                        <button className="btn-cyber" onClick={handleAddCategory}>
                            <span className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Tambah Kategori
                            </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Archive Warning */}
            {isArchived && (
                <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
                    📚 Mode Arsip - Data hanya bisa dilihat, tidak bisa diedit
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card p-6 gradient-border relative overflow-hidden">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Pendapatan</p>
                            <p className="text-3xl font-bold text-glow-cyan text-cyan-400">{formatCurrency(totalPendapatan)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>
                <div className="glass-card p-6 relative overflow-hidden bg-dark-700/50">
                    <div className="relative z-10 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-1">Total Kategori</p>
                            <p className="text-3xl font-bold text-purple-400">{pendapatan.length}</p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-4">
                {pendapatan.map((cat) => {
                    const catTotal = cat.items.reduce((acc, it) => acc + (parseFloat(it.jumlah) || 0), 0)
                    const isExpanded = expandedRows.includes(cat.id)

                    return (
                        <div key={cat.id} className="glass-card overflow-hidden">
                            {/* Category Header */}
                            <div className={`p-4 flex items-center justify-between transition-colors ${isExpanded ? 'bg-dark-600/30' : 'hover:bg-dark-600/20'}`}>
                                <button
                                    onClick={() => toggleRow(cat.id)}
                                    className="flex items-center gap-4 flex-1"
                                >
                                    <svg
                                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                    <div className="text-left">
                                        <span className="font-mono text-cyan-400 font-bold mr-3">{cat.kode}</span>
                                        <span className="text-white font-medium">{cat.sumber}</span>
                                    </div>
                                </button>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Pagu Total</p>
                                        <p className="text-sm font-bold text-cyan-400">{formatCurrency(catTotal)}</p>
                                    </div>
                                    {!isArchived && (
                                        <div className="flex gap-1 border-l border-dark-500 pl-4 ml-2">
                                            <button
                                                onClick={() => handleEditCategory(cat)}
                                                className="p-1.5 rounded hover:bg-dark-500 text-gray-400 hover:text-cyan-400 transition-colors"
                                                title="Edit Kategori"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCategory(cat)}
                                                className="p-1.5 rounded hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors"
                                                title="Hapus Kategori"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Category Details (Expanded) */}
                            {isExpanded && (
                                <div className="border-t border-dark-600/50 bg-dark-700/20">
                                    <div className="p-3 pl-14 flex justify-between items-center">
                                        <span className="text-xs font-bold text-purple-400 tracking-wider uppercase">Rincian Anggaran</span>
                                        {!isArchived && (
                                            <button
                                                onClick={() => handleAddItem(cat.id)}
                                                className="px-3 py-1 text-xs bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors"
                                            >
                                                + Tambah Rincian
                                            </button>
                                        )}
                                    </div>
                                    <div className="overflow-x-auto px-4 pb-4">
                                        <table className="w-full text-xs text-left">
                                            <thead>
                                                <tr className="text-gray-500 border-b border-dark-600/50">
                                                    <th className="py-2 pr-4 font-medium">URAIAN</th>
                                                    <th className="py-2 px-3 text-right font-medium">ANGGARAN</th>
                                                    <th className="py-2 px-3 text-right font-medium">PERUBAHAN</th>
                                                    <th className="py-2 px-3 text-right font-medium">VOLUME</th>
                                                    <th className="py-2 px-3 font-medium">SATUAN</th>
                                                    <th className="py-2 px-3 text-right font-medium">HARGA</th>
                                                    <th className="py-2 px-3 text-right font-medium text-cyan-400">JUMLAH</th>
                                                    <th className="py-2 px-3 font-medium">SUMBER DANA</th>
                                                    {!isArchived && <th className="py-2 pl-3 w-16">AKSI</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dark-600/30">
                                                {cat.items.map((item) => (
                                                    <tr key={item.id} className="group hover:bg-dark-600/20 transition-colors">
                                                        <td className="py-3 pr-4 text-gray-300 font-medium">{item.uraian}</td>
                                                        <td className="py-3 px-3 text-right text-gray-400">{formatCurrency(item.anggaran)}</td>
                                                        <td className="py-3 px-3 text-right text-gray-400">{formatCurrency(item.perubahan)}</td>
                                                        <td className="py-3 px-3 text-right text-gray-300">{item.volume}</td>
                                                        <td className="py-3 px-3 text-gray-400">{item.satuan}</td>
                                                        <td className="py-3 px-3 text-right text-gray-400">{formatCurrency(item.harga)}</td>
                                                        <td className="py-3 px-3 text-right font-bold text-cyan-400">{formatCurrency(item.jumlah)}</td>
                                                        <td className="py-3 px-3 text-xs text-gray-500 italic max-w-[150px] truncate" title={item.sumberDana}>
                                                            {item.sumberDana}
                                                        </td>
                                                        {!isArchived && (
                                                            <td className="py-3 pl-3">
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => handleEditItem(cat.id, item)}
                                                                        className="p-1 rounded hover:bg-dark-500 text-gray-500 hover:text-cyan-400"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteItem(cat.id, item)}
                                                                        className="p-1 rounded hover:bg-dark-500 text-gray-500 hover:text-red-400"
                                                                    >
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                                {cat.items.length === 0 && (
                                                    <tr>
                                                        <td colSpan={isArchived ? 8 : 9} className="py-4 text-center text-gray-500 italic">
                                                            Belum ada rincian untuk kategori ini
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default PendapatanPage

