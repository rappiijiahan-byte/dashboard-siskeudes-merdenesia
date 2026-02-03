import { useState, useEffect } from 'react'
import { useAppStore, usePendapatanStore, useBelanjaStore, useVersionStore } from '../stores'
import { exportToExcel, exportToPDF, downloadFile } from '../services/exportService'

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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (message.trim()) {
            addCommit(message)
            setMessage('')
            closeModal('commit')
            addNotification({
                type: 'success',
                message: 'Versi baru berhasil disimpan!'
            })
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
                    />
                </div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => closeModal('commit')} className="btn-ghost">
                        Batal
                    </button>
                    <button type="submit" className="btn-cyber" disabled={!message.trim()}>
                        Simpan Versi
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Add/Edit Pendapatan Modal
export function PendapatanModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const { addPendapatan, updatePendapatan } = usePendapatanStore()
    const isEdit = modals.editPendapatan
    const isOpen = modals.addPendapatan || modals.editPendapatan

    const [form, setForm] = useState({
        kode: '',
        sumber: '',
        jumlah: ''
    })

    useEffect(() => {
        if (editingItem && isEdit) {
            setForm({
                kode: editingItem.kode,
                sumber: editingItem.sumber,
                jumlah: editingItem.jumlah.toString()
            })
        } else {
            setForm({ kode: '', sumber: '', jumlah: '' })
        }
    }, [editingItem, isEdit])

    const handleClose = () => {
        closeModal('addPendapatan')
        closeModal('editPendapatan')
        setEditingItem(null)
        setForm({ kode: '', sumber: '', jumlah: '' })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = {
            kode: form.kode,
            sumber: form.sumber,
            jumlah: parseInt(form.jumlah.replace(/\D/g, '')) || 0
        }

        if (isEdit && editingItem) {
            updatePendapatan(editingItem.id, data)
        } else {
            addPendapatan(data)
        }

        handleClose()
        addNotification({
            type: 'success',
            message: isEdit ? 'Pendapatan berhasil diupdate!' : 'Pendapatan baru ditambahkan!'
        })
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? '✏️ Edit Pendapatan' : '➕ Tambah Pendapatan'}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Kode Rekening</label>
                        <input
                            type="text"
                            value={form.kode}
                            onChange={(e) => setForm({ ...form, kode: e.target.value })}
                            placeholder="4.1.1"
                            className="input-cyber"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Sumber Dana</label>
                        <input
                            type="text"
                            value={form.sumber}
                            onChange={(e) => setForm({ ...form, sumber: e.target.value })}
                            placeholder="Hasil Usaha Desa"
                            className="input-cyber"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Jumlah (Rp)</label>
                        <input
                            type="text"
                            value={form.jumlah}
                            onChange={(e) => setForm({ ...form, jumlah: e.target.value })}
                            placeholder="50000000"
                            className="input-cyber"
                            required
                        />
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">{isEdit ? 'Update' : 'Tambah'}</button>
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
            } else if (format === 'pdf') {
                exportToPDF(exportData)

                addNotification({
                    type: 'success',
                    message: 'PDF dibuka di tab baru. Klik "Cetak" untuk menyimpan.'
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

                <div className="grid grid-cols-2 gap-4">
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

                    <button
                        onClick={() => handleExport('pdf')}
                        disabled={isExporting}
                        className="p-4 glass-card hover:border-cyan-500/50 transition-colors flex flex-col items-center gap-2 disabled:opacity-50"
                    >
                        <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="font-medium text-white">PDF</span>
                        <span className="text-xs text-gray-500">Format cetak</span>
                    </button>
                </div>

                {isExporting && (
                    <div className="text-center py-2">
                        <span className="text-cyan-400">Sedang memproses export...</span>
                    </div>
                )}

                <div className="text-xs text-gray-500 mt-4">
                    <p>📊 <strong>Excel</strong>: 3 sheet (Pendapatan, Belanja, Ringkasan) dengan format lengkap</p>
                    <p>📄 <strong>PDF</strong>: Format cetak dengan tabel dan ringkasan</p>
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

    const handleSubmit = (e) => {
        e.preventDefault()
        if (name.trim()) {
            addBranch(name.toLowerCase().replace(/\s+/g, '-'))
            setName('')
            closeModal('newBranch')
            addNotification({
                type: 'success',
                message: `Branch "${name}" berhasil dibuat!`
            })
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
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Gunakan nama yang mendeskripsikan fokus anggaran, contoh: alt-infrastruktur, alt-pemberdayaan
                    </p>
                </div>
                <div className="flex gap-3 justify-end">
                    <button type="button" onClick={() => closeModal('newBranch')} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber" disabled={!name.trim()}>Buat Branch</button>
                </div>
            </form>
        </Modal>
    )
}

// Belanja Item Modal (Add/Edit)
export function BelanjaModal() {
    const { modals, closeModal, editingItem, setEditingItem, addNotification } = useAppStore()
    const { addBelanjaItem, updateBelanjaItem } = useBelanjaStore()
    const isEdit = modals.editBelanja
    const isOpen = modals.addBelanja || modals.editBelanja

    const [form, setForm] = useState({
        nama: '',
        volume: '',
        satuan: '',
        harga: ''
    })

    useEffect(() => {
        if (editingItem?.item && isEdit) {
            setForm({
                nama: editingItem.item.nama,
                volume: editingItem.item.volume.toString(),
                satuan: editingItem.item.satuan,
                harga: editingItem.item.harga.toString()
            })
        } else {
            setForm({ nama: '', volume: '', satuan: '', harga: '' })
        }
    }, [editingItem, isEdit])

    const handleClose = () => {
        closeModal('addBelanja')
        closeModal('editBelanja')
        setEditingItem(null)
        setForm({ nama: '', volume: '', satuan: '', harga: '' })
    }

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!editingItem?.bidangKode || !editingItem?.subKode || !editingItem?.kegKode) {
            addNotification({ type: 'error', message: 'Lokasi item tidak valid' })
            return
        }

        const data = {
            nama: form.nama,
            volume: parseInt(form.volume) || 0,
            satuan: form.satuan,
            harga: parseInt(form.harga.replace(/\D/g, '')) || 0
        }

        if (isEdit && editingItem?.item) {
            updateBelanjaItem(
                editingItem.bidangKode,
                editingItem.subKode,
                editingItem.kegKode,
                editingItem.item.id,
                data
            )
        } else {
            addBelanjaItem(
                editingItem.bidangKode,
                editingItem.subKode,
                editingItem.kegKode,
                data
            )
        }

        handleClose()
        addNotification({
            type: 'success',
            message: isEdit ? 'Item berhasil diupdate!' : 'Item baru ditambahkan!'
        })
    }

    // Calculate preview total
    const previewTotal = (parseInt(form.volume) || 0) * (parseInt(form.harga.replace(/\D/g, '')) || 0)
    const formatCurrency = (amount) => new Intl.NumberFormat('id-ID', {
        style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(amount)

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={isEdit ? '✏️ Edit Item Belanja' : '➕ Tambah Item Belanja'}
        >
            <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Nama Item</label>
                        <input
                            type="text"
                            value={form.nama}
                            onChange={(e) => setForm({ ...form, nama: e.target.value })}
                            placeholder="Gaji Kepala Desa"
                            className="input-cyber"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Volume</label>
                            <input
                                type="number"
                                value={form.volume}
                                onChange={(e) => setForm({ ...form, volume: e.target.value })}
                                placeholder="12"
                                className="input-cyber"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Satuan</label>
                            <input
                                type="text"
                                value={form.satuan}
                                onChange={(e) => setForm({ ...form, satuan: e.target.value })}
                                placeholder="Bulan"
                                className="input-cyber"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Harga Satuan (Rp)</label>
                        <input
                            type="text"
                            value={form.harga}
                            onChange={(e) => setForm({ ...form, harga: e.target.value })}
                            placeholder="5000000"
                            className="input-cyber"
                            required
                        />
                    </div>

                    {/* Preview Total */}
                    <div className="p-4 rounded-lg bg-dark-600/50 border border-dark-500">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400">Total</span>
                            <span className="text-xl font-bold text-cyan-400">{formatCurrency(previewTotal)}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {form.volume || 0} {form.satuan || 'unit'} × {formatCurrency(parseInt(form.harga.replace(/\D/g, '')) || 0)}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 justify-end mt-6">
                    <button type="button" onClick={handleClose} className="btn-ghost">Batal</button>
                    <button type="submit" className="btn-cyber">{isEdit ? 'Update' : 'Tambah'}</button>
                </div>
            </form>
        </Modal>
    )
}

// Notification Toast
export function Notifications() {
    const { notifications, removeNotification } = useAppStore()

    useEffect(() => {
        notifications.forEach(n => {
            const timer = setTimeout(() => removeNotification(n.id), 3000)
            return () => clearTimeout(timer)
        })
    }, [notifications, removeNotification])

    return (
        <div className="fixed bottom-4 right-4 z-50 space-y-2">
            {notifications.map(n => (
                <div
                    key={n.id}
                    className={`px-4 py-3 rounded-lg shadow-lg animate-fade-in flex items-center gap-3 ${n.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' :
                        n.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-400' :
                            'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                        }`}
                >
                    {n.type === 'success' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {n.type === 'error' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                    {n.type === 'info' && (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span>{n.message}</span>
                </div>
            ))}
        </div>
    )
}

export default Modal
