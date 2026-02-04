import { useState, useEffect } from 'react'
import { useAppStore, usePendapatanStore, useBelanjaStore, useVersionStore, useKegiatanStore, usePembiayaan1Store, usePembiayaan2Store } from '../stores'
import { exportToExcel, downloadFile } from '../services/exportService'

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative ${sizeClasses[size]} w-full mx-4 glass-card p-6 animate-fade-in`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div>{children}</div>
            </div>
        </div>
    )
}

// Commit Modal
export function CommitModal() {
    const { modals, closeModal, addNotification } = useAppStore()
    const { addCommit } = useVersionStore()
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (message.trim()) {
            setIsLoading(true)
            try {
                // Create snapshot of current state
                const { createSnapshot } = await import('../services/snapshotService.js')
                const snapshot = createSnapshot()

                // Commit with snapshot
                addCommit(message, snapshot)
                setMessage('')
                closeModal('commit')
                addNotification({
                    type: 'success',
                    message: 'Versi baru berhasil disimpan!'
                })
            } catch (error) {
                console.error('Failed to create commit:', error)
                addNotification({
                    type: 'error',
                    message: 'Gagal menyimpan versi: ' + error.message
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <Modal isOpen={modals.commit} onClose={() => closeModal('commit')} title="💾 Simpan Versi Baru">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Catatan Perubahan
                    </label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Contoh: Update belanja bidang 01, tambah pendapatan PADes..."
                        className="input-cyber h-24 resize-none"
                        autoFocus
                        disabled={isLoading}
                    />
                </div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => closeModal('commit')} className="btn-ghost" disabled={isLoading}>
                        Batal
                    </button>
                    <button type="submit" className="btn-cyber" disabled={!message.trim() || isLoading}>
                        {isLoading ? 'Menyimpan...' : 'Simpan Versi'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Add/Edit// Pendapatan Modal (Dynamic for Category/Item)
export function PendapatanModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const {
        addPendapatanCategory, updatePendapatanCategory,
        addItem, updateItem
    } = usePendapatanStore()

    const isOpen = modals.pendapatan
    const context = editingItem // { mode, type, data, parentId }

    const [form, setForm] = useState({})

    useEffect(() => {
        if (isOpen && context) {
            if (context.mode === 'edit') {
                setForm(context.data)
            } else {
                if (context.type === 'category') {
                    setForm({ kode: '', sumber: '' })
                } else {
                    setForm({
                        uraian: '', anggaran: 0, perubahan: 0, volume: 1,
                        satuan: 'Unit', harga: 0, jumlah: 0, sumberDana: ''
                    })
                }
            }
        }
    }, [isOpen, context])

    const handleClose = () => {
        closeModal('pendapatan')
        setEditingItem(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { type, mode, parentId } = context

        try {
            if (type === 'category') {
                if (mode === 'edit') updatePendapatanCategory(context.data.id, form)
                else addPendapatanCategory(form)
            } else {
                const numericData = {
                    ...form,
                    anggaran: parseInt(String(form.anggaran).replace(/\D/g, '')) || 0,
                    perubahan: parseInt(String(form.perubahan).replace(/\D/g, '')) || 0,
                    volume: parseFloat(form.volume) || 0,
                    harga: parseInt(String(form.harga).replace(/\D/g, '')) || 0,
                    jumlah: (parseFloat(form.volume) || 0) * (parseInt(String(form.harga).replace(/\D/g, '')) || 0)
                }
                if (mode === 'edit') updateItem(parentId, context.data.id, numericData)
                else addItem(parentId, numericData)
            }

            addNotification({
                type: 'success',
                message: `${type === 'category' ? 'Kategori' : 'Rincian'} berhasil ${mode === 'edit' ? 'diupdate' : 'ditambahkan'}`
            })
            handleClose()
        } catch (error) {
            addNotification({ type: 'error', message: 'Gagal memproses data' })
        }
    }

    if (!context) return null

    const title = `${context.mode === 'edit' ? '✏️ Edit' : '➕ Tambah'} ${context.type === 'category' ? 'Kategori Pendapatan' : 'Rincian Pendapatan'}`

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} size={context.type === 'item' ? 'md' : 'sm'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {context.type === 'category' ? (
                    <>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">KODE</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.kode || ''}
                                onChange={e => setForm({ ...form, kode: e.target.value })}
                                placeholder="4.1.1."
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">SUMBER PENDAPATAN</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.sumber || ''}
                                onChange={e => setForm({ ...form, sumber: e.target.value })}
                                placeholder="Hasil Usaha Desa"
                                required
                            />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">URAIAN</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.uraian || ''}
                                onChange={e => setForm({ ...form, uraian: e.target.value })}
                                placeholder="Bagi Hasil BUMDesa"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">ANGGARAN (Rp)</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.anggaran || ''}
                                onChange={e => setForm({ ...form, anggaran: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">PERUBAHAN (Rp)</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.perubahan || ''}
                                onChange={e => setForm({ ...form, perubahan: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">VOLUME</label>
                            <input
                                type="number" step="0.01" className="input-cyber"
                                value={form.volume || ''}
                                onChange={e => setForm({ ...form, volume: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">SATUAN</label>
                            <input
                                type="text" className="input-cyber"
                                value={form.satuan || ''}
                                onChange={e => setForm({ ...form, satuan: e.target.value })}
                                placeholder="Tahun"
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">HARGA SATUAN (Rp)</label>
                            <input
                                type="text" className="input-cyber font-bold text-cyan-400"
                                value={form.harga || ''}
                                onChange={e => setForm({ ...form, harga: e.target.value })}
                                required
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">SUMBER DANA</label>
                            <select
                                className="input-cyber"
                                value={form.sumberDana || ''}
                                onChange={e => setForm({ ...form, sumberDana: e.target.value })}
                                required
                            >
                                <option value="">Pilih Sumber Dana</option>
                                <option value="Pendapatan Asli Desa">Pendapatan Asli Desa</option>
                                <option value="Alokasi Dana Desa">Alokasi Dana Desa</option>
                                <option value="Dana Desa (Dropping APBN)">Dana Desa (Dropping APBN)</option>
                                <option value="Penerimaan Bagi Hasil Pajak Retribusi">Penerimaan Bagi Hasil Pajak Retribusi</option>
                                <option value="Penerimaan Bantuan Keuangan Kabupaten">Penerimaan Bantuan Keuangan Kabupaten</option>
                                <option value="Penerimaan Bantuan Keuangan Propinsi">Penerimaan Bantuan Keuangan Propinsi</option>
                                <option value="Swadaya Masyarakat">Swadaya Masyarakat</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">Simpan</button>
                </div>
            </form>
        </Modal>
    )
}

// Export Modal with REAL export functionality
export function ExportModal() {
    const { modals, closeModal, addNotification, selectedYear, currentProject } = useAppStore()
    const { pendapatan } = usePendapatanStore()
    const { bidangData } = useBelanjaStore()
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async (format) => {
        setIsExporting(true)

        try {
            const exportData = {
                pendapatan,
                belanja: bidangData,
                tahun: selectedYear,
                version: currentProject?.currentVersion || '1.0'
            }

            if (format === 'excel') {
                const buffer = await exportToExcel(exportData)
                const filename = `APBDes_${selectedYear}_v${currentProject?.currentVersion || '1.0'}.xlsx`
                downloadFile(buffer, filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

                addNotification({
                    type: 'success',
                    message: `Excel berhasil diexport: ${filename}`
                })
            }

            closeModal('export')
        } catch (error) {
            console.error('Export error:', error)
            addNotification({
                type: 'error',
                message: `Export gagal: ${error.message}`
            })
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Modal isOpen={modals.export} onClose={() => closeModal('export')} title="📤 Export Dokumen">
            <div className="space-y-4">
                <p className="text-gray-400">Pilih format dokumen yang ingin di-export:</p>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                        className="p-4 glass-card hover:border-cyan-500/50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
                    >
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <span className="font-medium text-white">Excel (.xlsx)</span>
                        <span className="text-xs text-gray-500">Data lengkap</span>
                    </button>
                </div>

                {isExporting && (
                    <div className="text-center py-2">
                        <span className="text-cyan-400">Sedang memproses export...</span>
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                    <p>📊 <strong>Excel</strong>: 3 sheet (Pendapatan, Belanja, Ringkasan) dengan format lengkap</p>
                </div>
            </div>
        </Modal>
    )
}

// New Branch Modal
export function NewBranchModal() {
    const { modals, closeModal, addNotification } = useAppStore()
    const { addBranch } = useVersionStore()
    const [name, setName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (name.trim()) {
            setIsLoading(true)
            try {
                // Create snapshot of current state for the new branch
                const { createSnapshot } = await import('../services/snapshotService.js')
                const snapshot = createSnapshot()

                addBranch(name.toLowerCase().replace(/\s+/g, '-'), snapshot)
                setName('')
                closeModal('newBranch')
                addNotification({
                    type: 'success',
                    message: `Branch "${name}" berhasil dibuat!`
                })
            } catch (error) {
                console.error('Failed to create branch:', error)
                addNotification({
                    type: 'error',
                    message: 'Gagal membuat branch: ' + error.message
                })
            } finally {
                setIsLoading(false)
            }
        }
    }

    return (
        <Modal isOpen={modals.newBranch} onClose={() => closeModal('newBranch')} title="🌿 Buat Branch Baru">
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Nama Branch</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="alt-fokus-pembangunan"
                        className="input-cyber"
                        autoFocus
                        disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Branch baru akan menyimpan salinan data APBDes saat ini. Perubahan di branch ini tidak akan mempengaruhi branch lain.
                    </p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => closeModal('newBranch')} className="btn-ghost" disabled={isLoading}>Batal</button>
                    <button type="submit" className="btn-cyber" disabled={!name.trim() || isLoading}>
                        {isLoading ? 'Membuat...' : 'Buat Branch'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Belanja Item Modal (Add/Edit for RAB Rinci / Leaf Level)
export function BelanjaModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const { addRABRinci, updateRABRinci } = useBelanjaStore()
    const isEdit = modals.editBelanja
    const isOpen = modals.addBelanja || modals.editBelanja

    const [form, setForm] = useState({
        noUrut: '',
        uraian: '',
        volume: '',
        satuan: '',
        hargaSatuan: '',
        sumberDana: ''
    })

    useEffect(() => {
        if (isOpen && editingItem) {
            if (isEdit && editingItem.data) {
                setForm({
                    noUrut: editingItem.data.noUrut || '',
                    uraian: editingItem.data.uraian || '',
                    volume: (editingItem.data.volume || 1).toString(),
                    satuan: editingItem.data.satuan || 'Unit',
                    hargaSatuan: (editingItem.data.hargaSatuan || 0).toString(),
                    sumberDana: editingItem.data.sumberDana || ''
                })
            } else {
                setForm({ noUrut: '', uraian: '', volume: '1', satuan: 'Unit', hargaSatuan: '0', sumberDana: '' })
            }
        }
    }, [isOpen, editingItem, isEdit])

    const handleClose = () => {
        closeModal('addBelanja')
        closeModal('editBelanja')
        setEditingItem(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { parentKeys, data } = editingItem

        const numericData = {
            ...form,
            noUrut: form.noUrut,
            uraian: form.uraian,
            volume: parseFloat(form.volume) || 0,
            satuan: form.satuan,
            hargaSatuan: parseInt(form.hargaSatuan.replace(/\D/g, '')) || 0,
            sumberDana: form.sumberDana,
            jumlah: (parseFloat(form.volume) || 0) * (parseInt(form.hargaSatuan.replace(/\D/g, '')) || 0)
        }

        try {
            if (isEdit) {
                updateRABRinci(parentKeys, data.id, numericData)
            } else {
                addRABRinci(parentKeys, numericData)
            }
            addNotification({ type: 'success', message: `Rincian berhasil ${isEdit ? 'diupdate' : 'ditambahkan'}` })
            handleClose()
        } catch (error) {
            addNotification({ type: 'error', message: 'Gagal menyimpan rincian' })
        }
    }

    if (!isOpen) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEdit ? '✏️ Edit Rincian Belanja' : '➕ Tambah Rincian Belanja'} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-6 gap-4">
                    <div className="col-span-1">
                        <label className="block text-xs text-gray-400 mb-1">NO URUT</label>
                        <input type="text" className="input-cyber" value={form.noUrut} onChange={e => setForm({ ...form, noUrut: e.target.value })} placeholder="1" required />
                    </div>
                    <div className="col-span-5">
                        <label className="block text-xs text-gray-400 mb-1">URAIAN PEKERJAAN</label>
                        <input type="text" className="input-cyber" value={form.uraian} onChange={e => setForm({ ...form, uraian: e.target.value })} placeholder="Contoh: Belanja Laptop HP 14s" required />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">VOLUME</label>
                        <input type="number" step="0.01" className="input-cyber" value={form.volume} onChange={e => setForm({ ...form, volume: e.target.value })} required />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">SATUAN</label>
                        <input type="text" className="input-cyber" value={form.satuan} onChange={e => setForm({ ...form, satuan: e.target.value })} placeholder="Unit/Bulan" required />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">HARGA SATUAN (Rp)</label>
                        <input type="text" className="input-cyber font-mono font-bold text-cyan-400" value={form.hargaSatuan} onChange={e => setForm({ ...form, hargaSatuan: e.target.value })} required />
                    </div>
                    <div className="col-span-6">
                        <label className="block text-xs text-gray-400 mb-1">SUMBER DANA</label>
                        <select className="input-cyber" value={form.sumberDana} onChange={e => setForm({ ...form, sumberDana: e.target.value })} required>
                            <option value="">Pilih Sumber Dana</option>
                            <option value="Pendapatan Asli Desa">Pendapatan Asli Desa</option>
                            <option value="Alokasi Dana Desa">Alokasi Dana Desa</option>
                            <option value="Dana Desa (Dropping APBN)">Dana Desa (Dropping APBN)</option>
                            <option value="Penerimaan Bagi Hasil Pajak Retribusi">Penerimaan Bagi Hasil Pajak Retribusi</option>
                            <option value="Penerimaan Bantuan Keuangan Kabupaten">Penerimaan Bantuan Keuangan Kabupaten</option>
                            <option value="Penerimaan Bantuan Keuangan Propinsi">Penerimaan Bantuan Keuangan Propinsi</option>
                            <option value="Swadaya Masyarakat">Swadaya Masyarakat</option>
                        </select>
                    </div>
                </div>
                <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/10 mt-4 flex justify-between items-center">
                    <span className="text-gray-400 text-xs">ESTIMASI TOTAL</span>
                    <span className="text-xl font-bold text-cyan-400 font-mono">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format((parseFloat(form.volume) || 0) * (parseInt(form.hargaSatuan.replace(/\D/g, '')) || 0))}
                    </span>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">Simpan Data</button>
                </div>
            </form>
        </Modal>
    )
}


// Belanja Forms Modal (Sub Bidang, Kegiatan, Paket, RAB)
export function BelanjaFormsModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const {
        addSubBidang, updateSubBidang,
        addKegiatan, updateKegiatan,
        addPaket, updatePaket,
        addRAB, updateRAB
    } = useBelanjaStore()

    const isOpen = modals.belanjaForm
    const context = editingItem // { mode, type, data, parentKeys }

    const [form, setForm] = useState({})

    useEffect(() => {
        if (isOpen && context) {
            if (context.mode === 'edit' && context.data) {
                setForm(context.data)
            } else {
                // Initialize based on type
                if (context.type === 'subBidang') setForm({ kode: '', nama: '' })
                else if (context.type === 'kegiatan') setForm({ kode: '', nama: '' })
                else if (context.type === 'paket') setForm({ noUrut: '', namaSubRincian: '' })
                else if (context.type === 'rab') setForm({ kode: '', namaRekening: '' })
            }
        }
    }, [isOpen, context])

    const handleClose = () => {
        closeModal('belanjaForm')
        setEditingItem(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { type, mode, parentKeys, data } = context

        try {
            if (type === 'subBidang') {
                if (mode === 'edit') updateSubBidang(parentKeys.bidang, data.kode, form)
                else addSubBidang(parentKeys.bidang, form)
            } else if (type === 'kegiatan') {
                if (mode === 'edit') updateKegiatan(parentKeys.bidang, parentKeys.sub, data.id, form)
                else addKegiatan(parentKeys.bidang, parentKeys.sub, form)
            } else if (type === 'paket') {
                if (mode === 'edit') updatePaket(parentKeys.bidang, parentKeys.sub, parentKeys.keg, data.id, form)
                else addPaket(parentKeys.bidang, parentKeys.sub, parentKeys.keg, form)
            } else if (type === 'rab') {
                if (mode === 'edit') updateRAB(parentKeys.bidang, parentKeys.sub, parentKeys.keg, parentKeys.pkt, data.id, form)
                else addRAB(parentKeys.bidang, parentKeys.sub, parentKeys.keg, parentKeys.pkt, form)
            }

            addNotification({ type: 'success', message: `${type} berhasil ${mode === 'edit' ? 'diupdate' : 'ditambahkan'}` })
            handleClose()
        } catch (error) {
            console.error('Submit error:', error)
            addNotification({ type: 'error', message: 'Gagal memproses data' })
        }
    }

    if (!isOpen || !context) return null

    const title = `${context.mode === 'edit' ? '✏️ Edit' : '➕ Tambah'} ${context.type === 'subBidang' ? 'Sub Bidang' :
        context.type === 'kegiatan' ? 'Kegiatan' :
            context.type === 'paket' ? 'Paket Pekerjaan' : 'Sub Rekening RAB'
        }`

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
            <form onSubmit={handleSubmit} className="space-y-4">
                {(context.type === 'subBidang' || context.type === 'kegiatan' || context.type === 'rab') && (
                    <>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">KODE</label>
                            <input type="text" className="input-cyber" value={form.kode || ''} onChange={e => setForm({ ...form, kode: e.target.value })} placeholder="Contoh: 01.01 atau 5.2.1." required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">NAMA / REKENING</label>
                            <input type="text" className="input-cyber" value={form.nama || form.namaRekening || ''} onChange={e => setForm({ ...form, [context.type === 'rab' ? 'namaRekening' : 'nama']: e.target.value })} placeholder="Masukkan nama..." required />
                        </div>
                    </>
                )}

                {context.type === 'paket' && (
                    <>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">NO URUT</label>
                            <input type="text" className="input-cyber" value={form.noUrut || ''} onChange={e => setForm({ ...form, noUrut: e.target.value })} placeholder="1" required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">NAMA PAKET / SUB RINCIAN</label>
                            <input type="text" className="input-cyber" value={form.namaSubRincian || ''} onChange={e => setForm({ ...form, namaSubRincian: e.target.value })} placeholder="Contoh: Tahap I" required />
                        </div>
                    </>
                )}

                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">Simpan</button>
                </div>
            </form>
        </Modal>
    )
}

// Notifications System
export function Notifications() {
    const { notifications, removeNotification } = useAppStore()

    if (notifications.length === 0) return null

    return (
        <div className="fixed bottom-4 right-4 z-[100] space-y-2 max-w-sm w-full">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className={`p-4 rounded-lg shadow-2xl glass-card border-l-4 flex items-center justify-between animate-slide-in ${n.type === 'success' ? 'border-green-500 bg-green-500/10' :
                        n.type === 'error' ? 'border-red-500 bg-red-500/10' :
                            'border-cyan-500 bg-cyan-500/10'
                        }`}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-white text-sm font-medium">{n.message}</span>
                    </div>
                    <button
                        onClick={() => removeNotification(n.id)}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    )
}

// Paket Detail View (Read-only)
export function PaketDetailModal() {
    const { modals, closeModal, editingItem } = useAppStore()
    const isOpen = modals.viewPaket
    const paket = editingItem

    if (!isOpen || !paket) return null

    return (
        <Modal isOpen={isOpen} onClose={() => closeModal('viewPaket')} title="📋 Rincian Paket Kegiatan" size="lg">
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-dark-600/50">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Nama Paket</p>
                        <p className="text-lg font-bold text-white">{paket.nama}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Uraian Output</p>
                        <p className="text-white">{paket.uraianOutput}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Volume/Satuan</p>
                        <p className="text-white font-mono">{paket.volume} {paket.satuan}</p>
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Informasi Tambahan
                    </h4>
                    <div className="bg-dark-700/30 rounded-xl p-4 border border-dark-600/50">
                        <p className="text-sm text-gray-400 italic">
                            Data rincian biaya paket ini dapat dilihat pada modul <strong>Belanja</strong> dengan mencari rekening belanja yang terkait dengan kegiatan ini.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button onClick={() => closeModal('viewPaket')} className="btn-cyber">Tutup</button>
                </div>
            </div>
        </Modal>
    )
}

// Kegiatan (Perencanaan) Forms Modal
export function KegiatanFormsModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const { addSubBidang, updateSubBidang, addKegiatan, updateKegiatan, addPaket, updatePaket } = useKegiatanStore()

    const isOpen = modals.kegiatanForm
    const context = editingItem // { mode, type, data, parentKeys }

    const [form, setForm] = useState({})

    useEffect(() => {
        if (isOpen && context) {
            if (context.mode === 'edit' && context.data) {
                setForm(context.data)
            } else {
                if (context.type === 'subBidang') setForm({ kode: '', nama: '' })
                else if (context.type === 'kegiatan') setForm({ kode: '', nama: '' })
                else if (context.type === 'paket') setForm({ nama: '', uraianOutput: '', volume: 1, satuan: 'Unit' })
            }
        }
    }, [isOpen, context])

    const handleClose = () => {
        closeModal('kegiatanForm')
        setEditingItem(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const { type, mode, parentKeys, data } = context

        try {
            if (type === 'subBidang') {
                if (mode === 'edit') updateSubBidang(parentKeys.bidang, data.kode, form)
                else addSubBidang(parentKeys.bidang, form)
            } else if (type === 'kegiatan') {
                if (mode === 'edit') updateKegiatan(parentKeys.bidang, parentKeys.sub, data.kode, form)
                else addKegiatan(parentKeys.bidang, parentKeys.sub, form)
            } else if (type === 'paket') {
                const numericData = { ...form, volume: parseFloat(form.volume) || 0 }
                if (mode === 'edit') updatePaket(parentKeys.bidang, parentKeys.sub, parentKeys.keg, data.id, numericData)
                else addPaket(parentKeys.bidang, parentKeys.sub, parentKeys.keg, numericData)
            }

            addNotification({ type: 'success', message: `${type} berhasil ${mode === 'edit' ? 'diupdate' : 'ditambahkan'}` })
            handleClose()
        } catch (error) {
            addNotification({ type: 'error', message: 'Gagal memproses data' })
        }
    }

    if (!isOpen || !context) return null

    const title = `${context.mode === 'edit' ? '✏️ Edit' : '➕ Tambah'} ${context.type === 'subBidang' ? 'Sub Bidang' :
        context.type === 'kegiatan' ? 'Kegiatan' : 'Paket Pekerjaan'
        }`

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={title} size={context.type === 'paket' ? 'md' : 'sm'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {context.type !== 'paket' ? (
                    <>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">KODE</label>
                            <input type="text" className="input-cyber" value={form.kode || ''} onChange={e => setForm({ ...form, kode: e.target.value })} placeholder="Contoh: 01.01. atau 01.01.01." required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">NAMA</label>
                            <input type="text" className="input-cyber" value={form.nama || ''} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Masukkan nama..." required />
                        </div>
                    </>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">NAMA PAKET</label>
                            <input type="text" className="input-cyber" value={form.nama || ''} onChange={e => setForm({ ...form, nama: e.target.value })} required />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">URAIAN OUTPUT</label>
                            <input type="text" className="input-cyber" value={form.uraianOutput || ''} onChange={e => setForm({ ...form, uraianOutput: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">VOLUME</label>
                            <input type="number" step="0.01" className="input-cyber" value={form.volume || ''} onChange={e => setForm({ ...form, volume: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">SATUAN</label>
                            <input type="text" className="input-cyber" value={form.satuan || ''} onChange={e => setForm({ ...form, satuan: e.target.value })} required />
                        </div>
                    </div>
                )}
                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">Simpan</button>
                </div>
            </form>
        </Modal>
    )
}

// Pembiayaan Modal
export function PembiayaanModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const { addItem: addP1, updateItem: updateP1 } = usePembiayaan1Store()
    const { addItem: addP2, updateItem: updateP2 } = usePembiayaan2Store()

    const isOpen = modals.pembiayaan
    const context = editingItem // { mode, type, data, parentKeys, storeType: 'p1' | 'p2' }

    const [form, setForm] = useState({})

    useEffect(() => {
        if (isOpen && context) {
            if (context.mode === 'edit' && context.data) {
                setForm(context.data)
            } else {
                setForm({ uraian: '', volume: 1, satuan: 'Unit', harga: 0, sumberDana: '' })
            }
        }
    }, [isOpen, context])

    const handleClose = () => {
        closeModal('pembiayaan')
        setEditingItem(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        // Extract properties carefully as they might come from different versions of the pages
        const { mode, parentKeys, storeType, pageType, katKode, subKode, data } = context

        const currentStoreType = (storeType || pageType || '').toLowerCase()
        const kategori = parentKeys?.kategori || katKode
        const sub = parentKeys?.sub || subKode

        const numericData = {
            ...form,
            volume: parseFloat(form.volume) || 0,
            harga: typeof form.harga === 'string' ? parseInt(form.harga.replace(/\D/g, '')) || 0 : form.harga,
            jumlah: (parseFloat(form.volume) || 0) * (typeof form.harga === 'string' ? parseInt(form.harga.replace(/\D/g, '')) || 0 : form.harga)
        }

        try {
            if (currentStoreType === 'p1') {
                if (mode === 'edit') updateP1(kategori, sub, data.id, numericData)
                else addP1(kategori, sub, numericData)
            } else {
                if (mode === 'edit') updateP2(kategori, sub, data.id, numericData)
                else addP2(kategori, sub, numericData)
            }

            addNotification({ type: 'success', message: `Data pembiayaan berhasil ${mode === 'edit' ? 'diupdate' : 'ditambahkan'}` })
            handleClose()
        } catch (error) {
            console.error('Pembiayaan submit error:', error)
            addNotification({ type: 'error', message: 'Gagal memproses data' })
        }
    }

    if (!isOpen || !context) return null

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`${context.mode === 'edit' ? '✏️ Edit' : '➕ Tambah'} Rincian Pembiayaan`} size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">URAIAN</label>
                        <input type="text" className="input-cyber" value={form.uraian || ''} onChange={e => setForm({ ...form, uraian: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">VOLUME</label>
                        <input type="number" step="0.01" className="input-cyber" value={form.volume || ''} onChange={e => setForm({ ...form, volume: e.target.value })} required />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">SATUAN</label>
                        <input type="text" className="input-cyber" value={form.satuan || ''} onChange={e => setForm({ ...form, satuan: e.target.value })} required />
                    </div>
                    <div className="col-span-2">
                        <label className="block text-xs text-gray-400 mb-1">HARGA SATUAN (Rp)</label>
                        <input type="text" className="input-cyber font-bold text-cyan-400" value={form.harga || ''} onChange={e => setForm({ ...form, harga: e.target.value })} required />
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">Simpan</button>
                </div>
            </form>
        </Modal>
    )
}

// Compare Modal
export function CompareModal() {
    const { modals, closeModal, selectedYear } = useAppStore()
    const { commits, selectedCommit } = useVersionStore()
    const isOpen = modals.compare

    const handleClose = () => closeModal('compare')

    if (!isOpen) return null

    const currentVersion = commits.find(c => c.status === 'current') || { version: 'Current', date: 'Now' }
    const compareVersion = selectedCommit || commits[1] || { version: '1.0', date: 'Old' }

    // Mock comparison data (since we don't have real history snapshots yet)
    const changes = [
        { type: 'added', item: 'Penyelenggaraan Festival Desa', category: 'Pembinaan Kemasyarakatan', amount: 15000000 },
        { type: 'modified', item: 'Pengadaan Laptop Admin', category: 'Penyelenggaraan Pemerintahan', oldValue: 15000000, newValue: 17500000, diff: 2500000 },
        { type: 'deleted', item: 'Bantuan Bibit Ikan', category: 'Pemberdayaan Masyarakat', amount: 5000000 }
    ]

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="🔀 Bandingkan Versi" size="lg">
            <div className="space-y-6">
                {/* Header Comparison */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50 border border-dark-600">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Versi Awal</p>
                        <p className="text-lg font-bold text-gray-300">v{compareVersion.version}</p>
                        <p className="text-xs text-gray-500">{compareVersion.date}</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-medium text-gray-500">vs</span>
                        <svg className="w-5 h-5 text-gray-600 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase">Versi Saat Ini</p>
                        <p className="text-lg font-bold text-cyan-400">v{currentVersion.version}</p>
                        <p className="text-xs text-gray-500">{currentVersion.date}</p>
                    </div>
                </div>

                {/* Changes List */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-300">Daftar Perubahan Detil</h3>
                    {changes.map((change, idx) => (
                        <div key={idx} className={`p-3 rounded-lg border ${change.type === 'added' ? 'bg-green-500/5 border-green-500/20' :
                            change.type === 'modified' ? 'bg-yellow-500/5 border-yellow-500/20' :
                                'bg-red-500/5 border-red-500/20'
                            }`}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold ${change.type === 'added' ? 'bg-green-500/20 text-green-400' :
                                            change.type === 'modified' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            }`}>{change.type}</span>
                                        <span className="text-xs text-gray-500">{change.category}</span>
                                    </div>
                                    <p className="text-gray-200 font-medium">{change.item}</p>
                                </div>
                                <div className="text-right">
                                    {change.type === 'modified' ? (
                                        <>
                                            <p className="text-xs text-gray-500 line-through">{new Intl.NumberFormat('id-ID').format(change.oldValue)}</p>
                                            <p className="text-yellow-400 font-bold">{new Intl.NumberFormat('id-ID').format(change.newValue)}</p>
                                        </>
                                    ) : (
                                        <p className={`font-bold ${change.type === 'added' ? 'text-green-400' : 'text-red-400'}`}>
                                            {new Intl.NumberFormat('id-ID').format(change.amount)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded text-xs text-blue-300">
                    ℹ️ Fitur perbandingan detil real-time sedang dalam pengembangan. Data di atas adalah simulasi.
                </div>

                <div className="flex justify-end pt-4">
                    <button onClick={handleClose} className="btn-cyber">Tutup</button>
                </div>
            </div>
        </Modal>
    )
}

export default Modal

