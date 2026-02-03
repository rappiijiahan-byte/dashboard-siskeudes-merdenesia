import { useAppStore, usePendapatanStore } from '../stores'

function PendapatanPage() {
    const { addNotification, isArchiveMode, selectedYear } = useAppStore()
    const { pendapatan, addPendapatan, updatePendapatan, deletePendapatan, getTotalPendapatan } = usePendapatanStore()
    const isArchived = isArchiveMode()

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const totalPendapatan = getTotalPendapatan()

    const handleAdd = () => {
        const kode = prompt('Masukkan Kode Rekening:', '4.1.1')
        if (!kode) return

        const sumber = prompt('Masukkan Sumber Dana:', '')
        if (!sumber) return

        const jumlahStr = prompt('Masukkan Jumlah (Rp):', '0')
        const jumlah = parseInt(jumlahStr?.replace(/\D/g, '')) || 0

        addPendapatan({ kode, sumber, jumlah })
        addNotification({
            type: 'success',
            message: 'Pendapatan baru berhasil ditambahkan!'
        })
    }

    const handleEdit = (item) => {
        const kode = prompt('Edit Kode Rekening:', item.kode)
        if (!kode) return

        const sumber = prompt('Edit Sumber Dana:', item.sumber)
        if (!sumber) return

        const jumlahStr = prompt('Edit Jumlah (Rp):', item.jumlah.toString())
        const jumlah = parseInt(jumlahStr?.replace(/\D/g, '')) || item.jumlah

        updatePendapatan(item.id, { kode, sumber, jumlah })
        addNotification({
            type: 'success',
            message: 'Pendapatan berhasil diupdate!'
        })
    }

    const handleDelete = (item) => {
        if (confirm(`Hapus pendapatan "${item.sumber}"?`)) {
            deletePendapatan(item.id)
            addNotification({
                type: 'success',
                message: 'Pendapatan berhasil dihapus'
            })
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
                    <button className="btn-cyber" onClick={handleAdd}>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Tambah Pendapatan
                        </span>
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
                        <p className="text-sm text-gray-400 mb-1">Total Pagu Indikatif</p>
                        <p className="text-3xl font-bold text-glow-cyan text-cyan-400">{formatCurrency(totalPendapatan)}</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-cyber flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <table className="table-cyber">
                    <thead>
                        <tr>
                            <th className="w-24">Kode</th>
                            <th>Sumber Dana</th>
                            <th className="text-right">Jumlah</th>
                            {!isArchived && <th className="w-32 text-center">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {pendapatan.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <span className="font-mono text-cyan-400">{item.kode}</span>
                                </td>
                                <td>{item.sumber}</td>
                                <td className="text-right font-medium">{formatCurrency(item.jumlah)}</td>
                                {!isArchived && (
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-cyan-400 transition-colors"
                                                title="Edit"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item)}
                                                className="p-2 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-red-400 transition-colors"
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
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="bg-dark-600/50">
                            <td colSpan={2} className="font-semibold text-white">Total</td>
                            <td className="text-right font-bold text-cyan-400">{formatCurrency(totalPendapatan)}</td>
                            {!isArchived && <td></td>}
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    )
}

export default PendapatanPage

