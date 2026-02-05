import { useState } from 'react'
import { useAppStore, usePembiayaan2Store } from '../stores'
import { exportPembiayaan2Page, downloadFile } from '../services/exportService'

function Pembiayaan2Page() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem } = useAppStore()
    const { kategoriPembiayaan2, addItem, updateItem, deleteItem, getTotalPembiayaan2, getSubTotal, deleteRapRinci } = usePembiayaan2Store()
    const [expandedKategori, setExpandedKategori] = useState(['6.2'])
    const [expandedSub, setExpandedSub] = useState(['6.2.1', '6.2.2'])
    const [expandedItems, setExpandedItems] = useState([])
    const isArchived = isArchiveMode()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const totalPembiayaan2 = getTotalPembiayaan2()

    const handleExport = async () => {
        try {
            const buffer = await exportPembiayaan2Page({ kategoriPembiayaan2 }, selectedYear)
            downloadFile(buffer, `Pembiayaan2_${selectedYear}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            addNotification({ type: 'success', message: 'Export berhasil' })
        } catch (error) {
            console.error(error)
            addNotification({ type: 'error', message: 'Export gagal: ' + error.message })
        }
    }

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

    const toggleItem = (id) => {
        setExpandedItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleAddItem = (kategoriKode, subKode) => {
        setEditingItem({ mode: 'add', pageType: 'P2', katKode: kategoriKode, subKode })
        openModal('pembiayaan')
    }

    const handleEditItem = (item, kategoriKode, subKode) => {
        setEditingItem({ mode: 'edit', pageType: 'P2', katKode: kategoriKode, subKode, data: item })
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

    // Rinci Handlers
    const handleAddRinci = (item, kategoriKode, subKode) => {
        setEditingItem({
            mode: 'add',
            type: 'rapRinci',
            pageType: 'P2',
            katKode: kategoriKode,
            subKode,
            itemId: item.id // Pass parent item ID
        })
        openModal('pembiayaan')
    }

    const handleEditRinci = (rinci, item, kategoriKode, subKode) => {
        setEditingItem({
            mode: 'edit',
            type: 'rapRinci',
            pageType: 'P2',
            katKode: kategoriKode,
            subKode,
            itemId: item.id,
            data: rinci
        })
        openModal('pembiayaan')
    }

    const handleDeleteRinci = (rinci, item, kategoriKode, subKode) => {
        if (confirm(`Hapus rincian "${rinci.uraian}"?`)) {
            deleteRapRinci(kategoriKode, subKode, item.id, rinci.id)
            addNotification({ type: 'success', message: 'Rincian berhasil dihapus' })
        }
    }

    // Sub Kategori Handlers
    const handleEditSub = (sub, kategoriKode) => {
        setEditingItem({ mode: 'edit', pageType: 'P2', type: 'subKategori', katKode: kategoriKode, data: sub })
        openModal('pembiayaan')
    }

    const handleDeleteSub = (sub, kategoriKode) => {
        if (confirm(`Hapus Sub Kategori "${sub.nama}"?`)) {
            usePembiayaan2Store.getState().deleteSubKategori(kategoriKode, sub.kode)
            addNotification({ type: 'success', message: 'Sub Kategori berhasil dihapus' })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Pembiayaan 2</h1>
                    <p className="text-gray-400 mt-1">
                        Pengeluaran Pembiayaan - APBDes {selectedYear}
                    </p>
                </div>
                {!isArchived && (
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export Excel
                    </button>
                )}
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
                        <p className="text-sm text-gray-400 mb-1">Total Pengeluaran Pembiayaan</p>
                        <p className="text-3xl font-bold text-glow-cyan text-magenta-400">{formatCurrency(totalPembiayaan2)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-magenta-500 to-purple-600 flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-3">
                {kategoriPembiayaan2.map((kategori) => (
                    <div key={kategori.kode} className="glass-card overflow-hidden">
                        {/* Kategori Header */}
                        <div className="w-full flex items-center justify-between p-4 hover:bg-dark-600/30 transition-colors">
                            <div
                                className="flex items-center gap-4 flex-1 cursor-pointer"
                                onClick={() => toggleKategori(kategori.kode)}
                            >
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
                                        <span className="font-mono text-magenta-400 font-semibold">{kategori.kode}</span>
                                        <span className="text-white font-medium">{kategori.nama}</span>
                                    </div>
                                </div>
                            </div>
                            <span className="font-semibold text-magenta-400">{formatCurrency(getTotalPembiayaan2())}</span>
                        </div>

                        {/* Expanded Sub Kategori */}
                        {expandedKategori.includes(kategori.kode) && kategori.subKategori.length > 0 && (
                            <div className="border-t border-dark-600/50">
                                {kategori.subKategori.map((sub) => (
                                    <div key={sub.kode} className="border-b border-dark-600/30 last:border-0">
                                        {/* Sub Kategori Header */}
                                        {/* Sub Kategori Header */}
                                        {/* Sub Kategori Header */}
                                        <div className="w-full flex items-center justify-between p-4 pl-12 bg-dark-700/30 hover:bg-dark-600/40 transition-colors group">
                                            <div
                                                className="flex items-center gap-3 cursor-pointer flex-1"
                                                onClick={() => toggleSub(sub.kode)}
                                            >
                                                <svg
                                                    className={`w-4 h-4 text-gray-500 transition-transform ${expandedSub.includes(sub.kode) ? 'rotate-90' : ''}`}
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                                <span className="font-mono text-purple-300 text-sm">{sub.kode}</span>
                                                <span className="text-gray-300">{sub.nama}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-gray-300">{formatCurrency(getSubTotal(kategori.kode, sub.kode))}</span>
                                                {!isArchived && (
                                                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => handleAddItem(kategori.kode, sub.kode)}
                                                            className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded hover:bg-purple-500/30 transition-colors"
                                                        >
                                                            + Tambah
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditSub(sub, kategori.kode)}
                                                            className="p-1 rounded hover:bg-yellow-500/20 text-gray-500 hover:text-yellow-400"
                                                            title="Edit Sub Kategori"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteSub(sub, kategori.kode)}
                                                            className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400"
                                                            title="Hapus Sub Kategori"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Items Table */}
                                        {expandedSub.includes(sub.kode) && (
                                            <div className="bg-dark-800/50 overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead className="bg-dark-700/80 text-gray-500 uppercase tracking-wide">
                                                        <tr>
                                                            <th className="py-2 px-4 text-left font-semibold w-40">KODE</th>
                                                            <th className="py-2 px-4 text-left font-semibold">URAIAN</th>
                                                            <th className="py-2 px-4 text-right font-semibold w-40">JUMLAH (Rp)</th>
                                                            {!isArchived && <th className="py-2 px-4 text-center font-semibold w-20">AKSI</th>}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-dark-600/30">
                                                        {sub.items.map((item) => (
                                                            <>
                                                                {/* RAP Item Row */}
                                                                <tr key={item.id} className="group hover:bg-dark-600/30 transition-colors">
                                                                    <td className="py-3 px-4 font-mono text-purple-300 text-xs flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => toggleItem(item.id)}
                                                                            className="text-gray-500 hover:text-magenta-400 focus:outline-none"
                                                                        >
                                                                            <svg
                                                                                className={`w-4 h-4 transition-transform ${expandedItems.includes(item.id) ? 'rotate-90' : ''}`}
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                                            </svg>
                                                                        </button>
                                                                        {item.kode || '-'}
                                                                    </td>
                                                                    <td className="py-3 px-4 text-gray-200">{item.uraian}</td>
                                                                    <td className="py-3 px-4 text-right font-bold text-magenta-400">{formatCurrency(item.jumlah)}</td>
                                                                    {!isArchived && (
                                                                        <td className="py-3 px-4">
                                                                            <div className="flex justify-center gap-1 opacity-100">
                                                                                <button
                                                                                    onClick={() => handleAddRinci(item, kategori.kode, sub.kode)}
                                                                                    className="p-1.5 rounded hover:bg-purple-500/20 text-gray-400 hover:text-purple-400"
                                                                                    title="Tambah Rincian"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleEditItem(item, kategori.kode, sub.kode)}
                                                                                    className="p-1.5 rounded hover:bg-purple-500/20 text-gray-400 hover:text-purple-400"
                                                                                    title="Edit"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                    </svg>
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteItem(item, kategori.kode, sub.kode)}
                                                                                    className="p-1.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                                                                                    title="Hapus"
                                                                                >
                                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                </button>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                </tr>

                                                                {/* Expanded RAP Rinci Table */}
                                                                {expandedItems.includes(item.id) && (
                                                                    <tr>
                                                                        <td colSpan="4" className="bg-dark-900/50 p-0 border-y border-dark-600/50">
                                                                            <div className="p-4 pl-12">
                                                                                <div className="flex items-center justify-between mb-2">
                                                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rincian RAP: {item.uraian}</p>
                                                                                    {!isArchived && (
                                                                                        <button
                                                                                            onClick={() => handleAddRinci(item, kategori.kode, sub.kode)}
                                                                                            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded transition-colors"
                                                                                        >
                                                                                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                                                            </svg>
                                                                                            Tambah Rincian
                                                                                        </button>
                                                                                    )}
                                                                                </div>
                                                                                <table className="w-full text-xs bg-dark-800/80 rounded-lg overflow-hidden border border-dark-600/30">
                                                                                    <thead className="bg-dark-700/50 text-gray-400">
                                                                                        <tr>
                                                                                            <th className="py-2 px-3 text-left">No.</th>
                                                                                            <th className="py-2 px-3 text-left">Uraian</th>
                                                                                            <th className="py-2 px-3 text-center">Volume</th>
                                                                                            <th className="py-2 px-3 text-center">Satuan</th>
                                                                                            <th className="py-2 px-3 text-right">Harga (Rp)</th>
                                                                                            <th className="py-2 px-3 text-right">Jumlah (Rp)</th>
                                                                                            <th className="py-2 px-3 text-left">Sumber Dana</th>
                                                                                            {!isArchived && <th className="py-2 px-3 text-center">Aksi</th>}
                                                                                        </tr>
                                                                                    </thead>
                                                                                    <tbody className="divide-y divide-dark-600/20">
                                                                                        {(item.rapRinci || []).map((rinci, idx) => (
                                                                                            <tr key={rinci.id}>
                                                                                                <td className="py-2 px-3 text-gray-500 text-center w-10">{idx + 1}</td>
                                                                                                <td className="py-2 px-3 text-gray-300">{rinci.uraian}</td>
                                                                                                <td className="py-2 px-3 text-center text-gray-400">{rinci.volume}</td>
                                                                                                <td className="py-2 px-3 text-center text-gray-400 text-[10px] uppercase">{rinci.satuan}</td>
                                                                                                <td className="py-2 px-3 text-right text-gray-400 font-mono">{formatCurrency(rinci.hargaSatuan)}</td>
                                                                                                <td className="py-2 px-3 text-right font-bold text-magenta-500/80">{formatCurrency(rinci.jumlah)}</td>
                                                                                                <td className="py-2 px-3 text-gray-400 text-[10px] italic">{rinci.sumberDana}</td>
                                                                                                {!isArchived && (
                                                                                                    <td className="py-2 px-3 text-center">
                                                                                                        <div className="flex justify-center gap-1">
                                                                                                            <button onClick={() => handleEditRinci(rinci, item, kategori.kode, sub.kode)} className="text-magenta-600 hover:text-magenta-400">
                                                                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                                                                            </button>
                                                                                                            <button onClick={() => handleDeleteRinci(rinci, item, kategori.kode, sub.kode)} className="text-red-600 hover:text-red-400">
                                                                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    </td>
                                                                                                )}
                                                                                            </tr>
                                                                                        ))}
                                                                                        {(item.rapRinci || []).length === 0 && (
                                                                                            <tr>
                                                                                                <td colSpan="8" className="py-4 text-center text-dark-400 italic text-xs">Belum ada rincian</td>
                                                                                            </tr>
                                                                                        )}
                                                                                    </tbody>
                                                                                </table>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                {/* Empty state */}
                                                {sub.items.length === 0 && (
                                                    <div className="p-6 text-center text-gray-500 text-sm border-t border-dark-600/30">
                                                        Belum ada item rincian
                                                        {!isArchived && (
                                                            <button
                                                                onClick={() => handleAddItem(kategori.kode, sub.kode)}
                                                                className="ml-2 text-purple-400 hover:underline font-medium"
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

export default Pembiayaan2Page
