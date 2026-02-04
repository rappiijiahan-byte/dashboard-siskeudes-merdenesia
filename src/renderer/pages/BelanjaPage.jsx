import { useState, useEffect } from 'react'
import { useAppStore, useBelanjaStore, usePendapatanStore } from '../stores'
import { exportToExcel, downloadFile } from '../services/exportService'

function BelanjaPage() {
    const { addNotification, isArchiveMode, selectedYear, openModal, setEditingItem, currentProject } = useAppStore()
    const {
        bidangData, getTotalBelanja,
        addSubBidang, updateSubBidang, deleteSubBidang,
        addKegiatan, updateKegiatan, deleteKegiatan,
        deleteBelanjaItem
    } = useBelanjaStore()
    const { pendapatan } = usePendapatanStore()
    const [expandedBidang, setExpandedBidang] = useState(['01'])
    const [expandedSubBidang, setExpandedSubBidang] = useState(['01.01'])
    const [expandedKegiatan, setExpandedKegiatan] = useState([])
    const [expandedPaket, setExpandedPaket] = useState([])
    const [expandedRAB, setExpandedRAB] = useState([])
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

    const togglePaket = (id) => {
        setExpandedPaket(prev =>
            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
        )
    }

    const toggleRAB = (id) => {
        setExpandedRAB(prev =>
            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
        )
    }

    // Hierarchy Handlers
    const handleAdd = (type, parentKeys) => {
        setEditingItem({ mode: 'add', type, parentKeys })
        if (type === 'rabRinci') openModal('addBelanja')
        else openModal('belanjaForm')
    }

    const handleEdit = (type, data, parentKeys) => {
        setEditingItem({ mode: 'edit', type, data, parentKeys })
        if (type === 'rabRinci') openModal('editBelanja')
        else openModal('belanjaForm')
    }

    const handleExportExcel = async () => {
        try {
            const buffer = await exportToExcel({ pendapatan, belanja: bidangData, tahun: selectedYear })
            const filename = `APBDes_Belanja_${selectedYear}_v${currentProject?.currentVersion || '1.0'}.xlsx`
            downloadFile(buffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            addNotification({ type: 'success', message: 'Excel export success!' })
        } catch (error) {
            addNotification({ type: 'error', message: 'Excel export failed' })
        }
    }



    const handleDelete = (type, keys) => {
        if (window.confirm(`Hapus ${type} ini?`)) {
            try {
                if (type === 'subBidang') deleteSubBidang(keys.bidang, keys.sub)
                else if (type === 'kegiatan') deleteKegiatan(keys.bidang, keys.sub, keys.keg)
                else if (type === 'paket') useBelanjaStore.getState().deletePaket(keys.bidang, keys.sub, keys.keg, keys.pkt)
                else if (type === 'rab') useBelanjaStore.getState().deleteRAB(keys.bidang, keys.sub, keys.keg, keys.pkt, keys.rab)
                else if (type === 'rabRinci') useBelanjaStore.getState().deleteRABRinci(keys, keys.id)

                addNotification({ type: 'success', message: `${type} berhasil dihapus` })
            } catch (error) {
                addNotification({ type: 'error', message: 'Gagal menghapus data' })
            }
        }
    }

    const ActionButtons = ({ onAdd, onEdit, onDelete }) => (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAdd && (
                <button onClick={(e) => { e.stopPropagation(); onAdd() }} className="p-1 hover:bg-cyan-500/20 text-cyan-400 rounded transition-colors" title="Tambah">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            )}
            {onEdit && (
                <button onClick={(e) => { e.stopPropagation(); onEdit() }} className="p-1 hover:bg-yellow-500/20 text-yellow-400 rounded transition-colors" title="Edit">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
            )}
            {onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete() }} className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors" title="Hapus">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
            )}
        </div>
    )

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Belanja Desa</h1>
                    <p className="text-gray-400 mt-1">Penyusunan anggaran belanja APBDes {selectedYear}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleExportExcel} className="p-2 px-4 bg-green-600/20 text-green-400 border border-green-600/30 rounded-lg hover:bg-green-600/30 transition-all flex items-center gap-2 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                        Export XLS
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6 border-l-4 border-magenta-500">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1 uppercase tracking-widest font-bold">Total Pagu Belanja</p>
                        <p className="text-3xl font-bold text-glow-magenta text-magenta-400">{formatCurrency(totalBelanja)}</p>
                    </div>
                </div>
            </div>

            {/* Hierarchical List */}
            <div className="space-y-4">
                {bidangData.map((bidang) => (
                    <div key={bidang.kode} className="glass-card overflow-hidden group/bidang">
                        {/* 1. Bidang Header */}
                        <div className="flex items-center group">
                            <button
                                onClick={() => toggleBidang(bidang.kode)}
                                className="flex-1 flex items-center justify-between p-5 bg-dark-700/50 hover:bg-dark-600/60 transition-all border-l-2 border-transparent hover:border-cyan-500"
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`transform transition-transform ${expandedBidang.includes(bidang.kode) ? 'rotate-90' : ''}`}>
                                        <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </span>
                                    <div className="text-left">
                                        <span className="font-mono text-cyan-500 font-bold block text-xs tracking-tighter">{bidang.kode}</span>
                                        <span className="text-white font-bold text-lg">{bidang.nama}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <span className="text-xl font-bold font-mono text-magenta-400">{formatCurrency(bidang.total)}</span>
                                    <ActionButtons onAdd={() => handleAdd('subBidang', { bidang: bidang.kode })} />
                                </div>
                            </button>
                        </div>

                        {/* 2. Sub Bidang Level */}
                        {expandedBidang.includes(bidang.kode) && (bidang.subBidang || []).map(sub => (
                            <div key={sub.kode} className="ml-4 border-l border-white/5 group">
                                <div className="flex items-center px-4 bg-dark-600/30 hover:bg-dark-500/40 border-b border-white/5">
                                    <button
                                        onClick={() => toggleSubBidang(sub.kode)}
                                        className="flex-1 flex items-center justify-between py-4 mr-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={`transform transition-transform text-gray-500 ${expandedSubBidang.includes(sub.kode) ? 'rotate-90' : ''}`}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </span>
                                            <span className="font-mono text-cyan-400 text-sm">{sub.kode}</span>
                                            <span className="text-gray-200 font-semibold">{sub.nama}</span>
                                        </div>
                                        <span className="text-magenta-300 font-bold">{formatCurrency(sub.total)}</span>
                                    </button>
                                    <ActionButtons
                                        onAdd={() => handleAdd('kegiatan', { bidang: bidang.kode, sub: sub.kode })}
                                        onEdit={() => handleEdit('subBidang', sub, { bidang: bidang.kode })}
                                        onDelete={() => handleDelete('subBidang', { bidang: bidang.kode, sub: sub.kode })}
                                    />
                                </div>

                                {/* 3. Kegiatan Level */}
                                {expandedSubBidang.includes(sub.kode) && (sub.kegiatan || []).map(keg => (
                                    <div key={keg.id} className="ml-6 border-l border-white/5 group">
                                        <div className="flex items-center px-3 bg-dark-500/20 hover:bg-dark-500/40 border-b border-white/5">
                                            <button
                                                onClick={() => toggleKegiatan(keg.id)}
                                                className="flex-1 flex items-center justify-between py-3 mr-3"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`transform transition-transform text-gray-600 ${expandedKegiatan.includes(keg.id) ? 'rotate-90' : ''}`}>
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </span>
                                                    <span className="font-mono text-cyan-300 text-xs">{keg.kode}</span>
                                                    <span className="text-gray-300 text-sm italic">{keg.nama}</span>
                                                </div>
                                                <span className="text-gray-200 font-mono text-sm">{formatCurrency(keg.total)}</span>
                                            </button>
                                            <ActionButtons
                                                onAdd={() => handleAdd('paket', { bidang: bidang.kode, sub: sub.kode, keg: keg.id })}
                                                onEdit={() => handleEdit('kegiatan', keg, { bidang: bidang.kode, sub: sub.kode })}
                                                onDelete={() => handleDelete('kegiatan', { bidang: bidang.kode, sub: sub.kode, keg: keg.id })}
                                            />
                                        </div>

                                        {/* 4. Paket Level */}
                                        {expandedKegiatan.includes(keg.id) && (keg.paket || []).map(pkt => (
                                            <div key={pkt.id} className="ml-8 border-l border-magenta-500/20 group">
                                                <div className="flex items-center px-3 bg-magenta-500/5 hover:bg-magenta-500/10 border-b border-white/5">
                                                    <button
                                                        onClick={() => togglePaket(pkt.id)}
                                                        className="flex-1 flex items-center justify-between py-3 mr-3"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <span className={`transform transition-transform text-magenta-500 ${expandedPaket.includes(pkt.id) ? 'rotate-90' : ''}`}>
                                                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                            </span>
                                                            <div className="flex gap-2 text-xs">
                                                                <span className="bg-magenta-500/20 text-magenta-300 px-2 rounded font-bold">PAKET {pkt.noUrut}</span>
                                                                <span className="text-magenta-100 font-medium">{pkt.namaSubRincian}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-6 text-[10px] font-mono mr-4">
                                                            <div className="text-right"><p className="text-gray-500 uppercase">Angg</p><p className="text-gray-300">{formatCurrency(pkt.anggaran)}</p></div>
                                                            <div className="text-right"><p className="text-magenta-400 uppercase font-bold">Jumlah</p><p className="text-magenta-300 font-bold">{formatCurrency(pkt.jumlah)}</p></div>
                                                        </div>
                                                    </button>
                                                    <ActionButtons
                                                        onAdd={() => handleAdd('rab', { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id })}
                                                        onEdit={() => handleEdit('paket', pkt, { bidang: bidang.kode, sub: sub.kode, keg: keg.id })}
                                                        onDelete={() => handleDelete('paket', { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id })}
                                                    />
                                                </div>

                                                {/* 5. RAB Level */}
                                                {expandedPaket.includes(pkt.id) && (pkt.rab || []).map(r => (
                                                    <div key={r.id} className="ml-8 border-l border-cyan-500/20 group">
                                                        <div className="flex items-center px-3 bg-cyan-500/5 hover:bg-cyan-500/10 border-b border-white/5">
                                                            <button
                                                                onClick={() => toggleRAB(r.id)}
                                                                className="flex-1 flex items-center justify-between py-3 mr-3"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`transform transition-transform text-cyan-500 ${expandedRAB.includes(r.id) ? 'rotate-90' : ''}`}>
                                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                                    </span>
                                                                    <div className="flex gap-2 text-xs">
                                                                        <span className="bg-cyan-500/20 text-cyan-300 px-2 rounded font-bold">{r.kode}</span>
                                                                        <span className="text-cyan-100 font-medium">{r.namaRekening}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-6 text-[10px] font-mono mr-4">
                                                                    <div className="text-right"><p className="text-gray-500">ANGG</p><p className="text-gray-300">{formatCurrency(r.anggaran)}</p></div>
                                                                    <div className="text-right"><p className="text-cyan-400 font-bold">TOTAL</p><p className="text-cyan-300 font-bold">{formatCurrency(r.jumlah)}</p></div>
                                                                </div>
                                                            </button>
                                                            <ActionButtons
                                                                onAdd={() => handleAdd('rabRinci', { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id, rab: r.id })}
                                                                onEdit={() => handleEdit('rab', r, { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id })}
                                                                onDelete={() => handleDelete('rab', { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id, rab: r.id })}
                                                            />
                                                        </div>

                                                        {/* 6. RAB Rinci (Leaf Items) */}
                                                        {expandedRAB.includes(r.id) && (
                                                            <div className="bg-dark-900/50 overflow-x-auto">
                                                                <table className="w-full text-[11px] text-left border-collapse">
                                                                    <thead className="bg-dark-800/80 text-gray-500 uppercase tracking-tighter font-bold border-b border-white/5">
                                                                        <tr>
                                                                            <th className="p-2 w-10 text-center">No</th>
                                                                            <th className="p-2">Uraian Rincian Pekerjaan</th>
                                                                            <th className="p-2 text-right">ANGGARAN</th>
                                                                            <th className="p-2 text-right">TOTAL</th>
                                                                            <th className="p-2 text-center">JUMLAH</th>
                                                                            <th className="p-2 text-center">SATUAN</th>
                                                                            <th className="p-2 text-right">HARGA</th>
                                                                            <th className="p-2">Sumber Dana</th>
                                                                            <th className="p-2 text-center">Aksi</th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody className="divide-y divide-white/5">
                                                                        {(r.rabRinci || []).map((item) => (
                                                                            <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                                                                                <td className="p-2 text-center text-gray-500">{item.noUrut}</td>
                                                                                <td className="p-2 font-medium text-gray-300">{item.uraian}</td>
                                                                                <td className="p-2 text-right text-gray-400 font-mono">{formatCurrency(item.anggaran)}</td>
                                                                                <td className="p-2 text-right text-cyan-400 font-bold font-mono">{formatCurrency(item.jumlah)}</td>
                                                                                <td className="p-2 text-center text-gray-400">{item.volume}</td>
                                                                                <td className="p-2 text-center text-gray-400">{item.satuan}</td>
                                                                                <td className="p-2 text-right text-gray-400 font-mono">{formatCurrency(item.hargaSatuan)}</td>
                                                                                <td className="p-2">
                                                                                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] uppercase font-bold text-nowrap">
                                                                                        {item.sumberDana}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="p-2">
                                                                                    <div className="flex justify-center">
                                                                                        <ActionButtons
                                                                                            onEdit={() => handleEdit('rabRinci', item, { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id, rab: r.id })}
                                                                                            onDelete={() => handleDelete('rabRinci', { bidang: bidang.kode, sub: sub.kode, keg: keg.id, pkt: pkt.id, rab: r.id, id: item.id })}
                                                                                        />
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                                {(r.rabRinci || []).length === 0 && (
                                                                    <div className="p-6 text-center text-gray-600 italic text-xs">
                                                                        Belum ada rincian RAB untuk sub-rekening ini.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BelanjaPage
