import { create } from 'zustand'

// App Store - Global state management
export const useAppStore = create((set, get) => ({
    // Current Year
    selectedYear: 2026,
    setSelectedYear: (year) => set({ selectedYear: year }),

    // Years list
    years: [
        { tahun: 2026, status: 'Active', proyek_aktif: 'proj-2026' },
        { tahun: 2025, status: 'Archived', proyek_aktif: 'proj-2025' },
        { tahun: 2024, status: 'Archived', proyek_aktif: 'proj-2024' }
    ],

    // Current project info
    currentProject: {
        id: 'proj-2026',
        nama: 'APBDes 2026',
        status: 'Draft',
        currentVersion: '1.2'
    },

    // Modal states
    modals: {
        commit: false,
        addPendapatan: false,
        editPendapatan: false,
        addBelanja: false,
        editBelanja: false,
        newBranch: false,
        compare: false,
        export: false
    },

    openModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: true }
    })),

    closeModal: (modalName) => set((state) => ({
        modals: { ...state.modals, [modalName]: false }
    })),

    closeAllModals: () => set({
        modals: {
            commit: false,
            addPendapatan: false,
            editPendapatan: false,
            addBelanja: false,
            editBelanja: false,
            newBranch: false,
            compare: false,
            export: false
        }
    }),

    // Edit item state
    editingItem: null,
    setEditingItem: (item) => set({ editingItem: item }),

    // Notifications
    notifications: [],
    addNotification: (notification) => set((state) => ({
        notifications: [...state.notifications, { id: Date.now(), ...notification }]
    })),
    removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
    })),

    // Is archive mode (read-only)
    isArchiveMode: () => get().selectedYear !== 2026
}))

// Pendapatan Store
export const usePendapatanStore = create((set, get) => ({
    pendapatan: [
        { id: 1, kode: '4.1.1', sumber: 'Hasil Usaha Desa', jumlah: 50000000 },
        { id: 2, kode: '4.1.2', sumber: 'Swadaya dan Partisipasi Masyarakat', jumlah: 25000000 },
        { id: 3, kode: '4.2.1', sumber: 'Dana Desa (DD)', jumlah: 800000000 },
        { id: 4, kode: '4.2.2', sumber: 'Alokasi Dana Desa (ADD)', jumlah: 350000000 },
        { id: 5, kode: '4.2.3', sumber: 'Bagi Hasil Pajak/Retribusi', jumlah: 20000000 },
        { id: 6, kode: '4.3.1', sumber: 'Bunga Bank', jumlah: 5000000 }
    ],

    addPendapatan: (item) => set((state) => ({
        pendapatan: [...state.pendapatan, { ...item, id: Date.now() }]
    })),

    updatePendapatan: (id, updates) => set((state) => ({
        pendapatan: state.pendapatan.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    deletePendapatan: (id) => set((state) => ({
        pendapatan: state.pendapatan.filter(p => p.id !== id)
    })),

    getTotalPendapatan: () => get().pendapatan.reduce((acc, item) => acc + item.jumlah, 0)
}))

// Belanja Store  
export const useBelanjaStore = create((set, get) => ({
    bidangData: [
        {
            kode: '01',
            nama: 'Penyelenggaraan Pemerintahan Desa',
            total: 250000000,
            subBidang: [
                {
                    kode: '01.01',
                    nama: 'Belanja Pegawai',
                    total: 180000000,
                    kegiatan: [
                        {
                            kode: '01.01.01',
                            nama: 'Pembayaran Gaji dan Tunjangan',
                            total: 180000000,
                            items: [
                                { id: 1, nama: 'Gaji Kepala Desa', volume: 12, satuan: 'Bulan', harga: 5000000, total: 60000000 },
                                { id: 2, nama: 'Gaji Sekretaris Desa', volume: 12, satuan: 'Bulan', harga: 3500000, total: 42000000 },
                                { id: 3, nama: 'Gaji Kaur Keuangan', volume: 12, satuan: 'Bulan', harga: 3000000, total: 36000000 },
                                { id: 4, nama: 'Tunjangan BPD', volume: 12, satuan: 'Bulan', harga: 3500000, total: 42000000 }
                            ]
                        }
                    ]
                },
                {
                    kode: '01.02',
                    nama: 'Belanja Barang dan Jasa',
                    total: 70000000,
                    kegiatan: []
                }
            ]
        },
        { kode: '02', nama: 'Pelaksanaan Pembangunan Desa', total: 400000000, subBidang: [] },
        { kode: '03', nama: 'Pembinaan Kemasyarakatan Desa', total: 75000000, subBidang: [] },
        { kode: '04', nama: 'Pemberdayaan Masyarakat Desa', total: 62500000, subBidang: [] },
        { kode: '05', nama: 'Penanggulangan Bencana dan Keadaan Mendesak', total: 25000000, subBidang: [] }
    ],

    getTotalBelanja: () => get().bidangData.reduce((acc, b) => acc + b.total, 0),

    // Add item to a specific kegiatan
    addBelanjaItem: (bidangKode, subKode, kegKode, item) => {
        set((state) => {
            const newBidangData = state.bidangData.map(bidang => {
                if (bidang.kode !== bidangKode) return bidang

                const newSubBidang = bidang.subBidang.map(sub => {
                    if (sub.kode !== subKode) return sub

                    const newKegiatan = sub.kegiatan.map(keg => {
                        if (keg.kode !== kegKode) return keg

                        const newItem = {
                            ...item,
                            id: Date.now(),
                            total: item.volume * item.harga
                        }
                        const newItems = [...keg.items, newItem]
                        const newTotal = newItems.reduce((acc, i) => acc + i.total, 0)

                        return { ...keg, items: newItems, total: newTotal }
                    })

                    const newSubTotal = newKegiatan.reduce((acc, k) => acc + k.total, 0)
                    return { ...sub, kegiatan: newKegiatan, total: newSubTotal }
                })

                const newBidangTotal = newSubBidang.reduce((acc, s) => acc + s.total, 0)
                return { ...bidang, subBidang: newSubBidang, total: newBidangTotal }
            })

            return { bidangData: newBidangData }
        })
    },

    // Update existing item
    updateBelanjaItem: (bidangKode, subKode, kegKode, itemId, updates) => {
        set((state) => {
            const newBidangData = state.bidangData.map(bidang => {
                if (bidang.kode !== bidangKode) return bidang

                const newSubBidang = bidang.subBidang.map(sub => {
                    if (sub.kode !== subKode) return sub

                    const newKegiatan = sub.kegiatan.map(keg => {
                        if (keg.kode !== kegKode) return keg

                        const newItems = keg.items.map(item => {
                            if (item.id !== itemId) return item
                            const updated = { ...item, ...updates }
                            updated.total = updated.volume * updated.harga
                            return updated
                        })
                        const newTotal = newItems.reduce((acc, i) => acc + i.total, 0)

                        return { ...keg, items: newItems, total: newTotal }
                    })

                    const newSubTotal = newKegiatan.reduce((acc, k) => acc + k.total, 0)
                    return { ...sub, kegiatan: newKegiatan, total: newSubTotal }
                })

                const newBidangTotal = newSubBidang.reduce((acc, s) => acc + s.total, 0)
                return { ...bidang, subBidang: newSubBidang, total: newBidangTotal }
            })

            return { bidangData: newBidangData }
        })
    },

    // Delete item
    deleteBelanjaItem: (bidangKode, subKode, kegKode, itemId) => {
        set((state) => {
            const newBidangData = state.bidangData.map(bidang => {
                if (bidang.kode !== bidangKode) return bidang

                const newSubBidang = bidang.subBidang.map(sub => {
                    if (sub.kode !== subKode) return sub

                    const newKegiatan = sub.kegiatan.map(keg => {
                        if (keg.kode !== kegKode) return keg

                        const newItems = keg.items.filter(item => item.id !== itemId)
                        const newTotal = newItems.reduce((acc, i) => acc + i.total, 0)

                        return { ...keg, items: newItems, total: newTotal }
                    })

                    const newSubTotal = newKegiatan.reduce((acc, k) => acc + k.total, 0)
                    return { ...sub, kegiatan: newKegiatan, total: newSubTotal }
                })

                const newBidangTotal = newSubBidang.reduce((acc, s) => acc + s.total, 0)
                return { ...bidang, subBidang: newSubBidang, total: newBidangTotal }
            })

            return { bidangData: newBidangData }
        })
    }
}))

// Version/Commit Store
export const useVersionStore = create((set, get) => ({
    commits: [
        {
            id: 'v1.3',
            version: '1.3',
            date: '2026-02-03 14:30',
            author: 'Admin',
            message: 'Update Belanja Bidang 01',
            status: 'current',
            changes: { added: 3, modified: 5, deleted: 1 }
        },
        {
            id: 'v1.2',
            version: '1.2',
            date: '2026-01-25 09:15',
            author: 'Admin',
            message: 'Revisi Pasca Musrenbang',
            status: 'old',
            changes: { added: 12, modified: 8, deleted: 2 }
        },
        {
            id: 'v1.1',
            version: '1.1',
            date: '2026-01-15 16:45',
            author: 'Admin',
            message: 'Versi Pra-Musrenbang',
            status: 'old',
            changes: { added: 25, modified: 0, deleted: 0 }
        },
        {
            id: 'v1.0',
            version: '1.0',
            date: '2026-01-10 10:00',
            author: 'Admin',
            message: 'Initial Draft - APBDes 2026',
            status: 'initial',
            changes: { added: 50, modified: 0, deleted: 0 }
        }
    ],

    branches: [
        { name: 'main', current: true, commits: 4 },
        { name: 'alt-infrastruktur', current: false, commits: 2 },
        { name: 'alt-pemberdayaan', current: false, commits: 1 }
    ],

    selectedCommit: null,
    setSelectedCommit: (commit) => set({ selectedCommit: commit }),

    addCommit: (message) => {
        const currentCommits = get().commits
        const latestVersion = parseFloat(currentCommits[0]?.version || '1.0')
        const newVersion = (latestVersion + 0.1).toFixed(1)

        // Mark old current as old
        const updatedCommits = currentCommits.map(c =>
            c.status === 'current' ? { ...c, status: 'old' } : c
        )

        const newCommit = {
            id: `v${newVersion}`,
            version: newVersion,
            date: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
            author: 'Admin',
            message,
            status: 'current',
            changes: { added: 0, modified: 1, deleted: 0 }
        }

        set({ commits: [newCommit, ...updatedCommits] })
        return newCommit
    },

    addBranch: (name) => set((state) => ({
        branches: [...state.branches, { name, current: false, commits: 0 }]
    })),

    switchBranch: (name) => set((state) => ({
        branches: state.branches.map(b => ({ ...b, current: b.name === name }))
    }))
}))

// Pembiayaan 1 Store - SILPA (Hierarchical)
export const usePembiayaan1Store = create((set, get) => ({
    kategoriPembiayaan1: [
        {
            kode: '6.1',
            nama: 'PENERIMAAN PEMBIAYAAN',
            subKategori: [
                {
                    kode: '6.1.1',
                    nama: 'SILPA Tahun Sebelumnya',
                    items: [
                        { id: 1, kode: '6.1.1.01.01', uraian: 'SILPA Pendapatan Asli Desa', jumlah: 0 },
                        { id: 2, kode: '6.1.1.01.02', uraian: 'SILPA Alokasi Dana Desa', jumlah: 0 },
                        { id: 3, kode: '6.1.1.01.03', uraian: 'SILPA Dana Desa (Dropping APBN)', jumlah: 0 },
                        { id: 4, kode: '6.1.1.01.04', uraian: 'SILPA Penerimaan Bagi Hasil Pajak Retribusi Daerah', jumlah: 0 },
                        { id: 5, kode: '6.1.1.01.05', uraian: 'SILPA Penerimaan Bantuan Keuangan Kab/Kota', jumlah: 0 }
                    ]
                },
                {
                    kode: '6.1.2',
                    nama: 'Pencairan Dana Cadangan',
                    items: [
                        { id: 6, kode: '6.1.2.01', uraian: 'Pencairan Dana Cadangan', jumlah: 0 }
                    ]
                },
                {
                    kode: '6.1.3',
                    nama: 'Hasil Penjualan Kekayaan Desa yang Dipisahkan',
                    items: []
                }
            ]
        }
    ],

    addItem: (kategoriKode, subKode, item) => set((state) => ({
        kategoriPembiayaan1: state.kategoriPembiayaan1.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? { ...sub, items: [...sub.items, { ...item, id: Date.now() }] }
                            : sub
                    )
                }
                : kat
        )
    })),

    updateItem: (kategoriKode, subKode, itemId, updates) => set((state) => ({
        kategoriPembiayaan1: state.kategoriPembiayaan1.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? {
                                ...sub,
                                items: sub.items.map(item =>
                                    item.id === itemId ? { ...item, ...updates } : item
                                )
                            }
                            : sub
                    )
                }
                : kat
        )
    })),

    deleteItem: (kategoriKode, subKode, itemId) => set((state) => ({
        kategoriPembiayaan1: state.kategoriPembiayaan1.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? { ...sub, items: sub.items.filter(item => item.id !== itemId) }
                            : sub
                    )
                }
                : kat
        )
    })),

    addSubKategori: (kategoriKode, subKategori) => set((state) => ({
        kategoriPembiayaan1: state.kategoriPembiayaan1.map(kat =>
            kat.kode === kategoriKode
                ? { ...kat, subKategori: [...kat.subKategori, { ...subKategori, items: [] }] }
                : kat
        )
    })),

    getSubTotal: (kategoriKode, subKode) => {
        const kategori = get().kategoriPembiayaan1.find(k => k.kode === kategoriKode)
        const sub = kategori?.subKategori.find(s => s.kode === subKode)
        return sub?.items.reduce((acc, item) => acc + item.jumlah, 0) || 0
    },

    getKategoriTotal: (kategoriKode) => {
        const kategori = get().kategoriPembiayaan1.find(k => k.kode === kategoriKode)
        return kategori?.subKategori.reduce((acc, sub) =>
            acc + sub.items.reduce((a, item) => a + item.jumlah, 0), 0) || 0
    },

    getTotalPembiayaan1: () => get().kategoriPembiayaan1.reduce((acc, kat) =>
        acc + kat.subKategori.reduce((a, sub) =>
            a + sub.items.reduce((b, item) => b + item.jumlah, 0), 0), 0)
}))

// Pembiayaan 2 Store - Pengeluaran Pembiayaan (Hierarchical)
export const usePembiayaan2Store = create((set, get) => ({
    kategoriPembiayaan2: [
        {
            kode: '6.2',
            nama: 'PENGELUARAN PEMBIAYAAN',
            subKategori: [
                {
                    kode: '6.2.1',
                    nama: 'Pembentukan Dana Cadangan',
                    items: [
                        { id: 1, kode: '6.2.1.01', uraian: 'Pembentukan Dana Cadangan', jumlah: 0 }
                    ]
                },
                {
                    kode: '6.2.2',
                    nama: 'Penyertaan Modal Desa',
                    items: [
                        { id: 2, kode: '6.2.2.01.01', uraian: 'Penyertaan Modal BUMDes (Ketahanan Pangan)', jumlah: 0 },
                        { id: 3, kode: '6.2.2.01.02', uraian: 'Penyertaan Modal Koperasi Desa Merah Putih', jumlah: 0 }
                    ]
                },
                {
                    kode: '6.2.3',
                    nama: 'Pembayaran Kewajiban Desa',
                    items: []
                }
            ]
        }
    ],

    addItem: (kategoriKode, subKode, item) => set((state) => ({
        kategoriPembiayaan2: state.kategoriPembiayaan2.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? { ...sub, items: [...sub.items, { ...item, id: Date.now() }] }
                            : sub
                    )
                }
                : kat
        )
    })),

    updateItem: (kategoriKode, subKode, itemId, updates) => set((state) => ({
        kategoriPembiayaan2: state.kategoriPembiayaan2.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? {
                                ...sub,
                                items: sub.items.map(item =>
                                    item.id === itemId ? { ...item, ...updates } : item
                                )
                            }
                            : sub
                    )
                }
                : kat
        )
    })),

    deleteItem: (kategoriKode, subKode, itemId) => set((state) => ({
        kategoriPembiayaan2: state.kategoriPembiayaan2.map(kat =>
            kat.kode === kategoriKode
                ? {
                    ...kat,
                    subKategori: kat.subKategori.map(sub =>
                        sub.kode === subKode
                            ? { ...sub, items: sub.items.filter(item => item.id !== itemId) }
                            : sub
                    )
                }
                : kat
        )
    })),

    addSubKategori: (kategoriKode, subKategori) => set((state) => ({
        kategoriPembiayaan2: state.kategoriPembiayaan2.map(kat =>
            kat.kode === kategoriKode
                ? { ...kat, subKategori: [...kat.subKategori, { ...subKategori, items: [] }] }
                : kat
        )
    })),

    getSubTotal: (kategoriKode, subKode) => {
        const kategori = get().kategoriPembiayaan2.find(k => k.kode === kategoriKode)
        const sub = kategori?.subKategori.find(s => s.kode === subKode)
        return sub?.items.reduce((acc, item) => acc + item.jumlah, 0) || 0
    },

    getKategoriTotal: (kategoriKode) => {
        const kategori = get().kategoriPembiayaan2.find(k => k.kode === kategoriKode)
        return kategori?.subKategori.reduce((acc, sub) =>
            acc + sub.items.reduce((a, item) => a + item.jumlah, 0), 0) || 0
    },

    getTotalPembiayaan2: () => get().kategoriPembiayaan2.reduce((acc, kat) =>
        acc + kat.subKategori.reduce((a, sub) =>
            a + sub.items.reduce((b, item) => b + item.jumlah, 0), 0), 0)
}))

// Kegiatan Store - Hierarchical: Bidang > Sub Bidang > Kegiatan > Paket
export const useKegiatanStore = create((set, get) => ({
    bidangKegiatan: [
        {
            kode: '04.2002.01',
            nama: 'BIDANG PENYELENGGARAN PEMERINTAHAN DESA',
            subBidang: [
                {
                    kode: '04.2002.01.01.',
                    nama: 'Penyelenggaran Belanja Siltap, Tunjangan dan Operasional Pemerintahan Desa',
                    kegiatan: [
                        {
                            kode: '04.2002.01.01.01.',
                            nama: 'Penyediaan Penghasilan Tetap dan Tunjangan Kepala Desa',
                            paket: [
                                { id: 1, nama: 'Penghasilan Tetap Kepala Desa', uraianOutput: 'Penghasilan Tetap Kepala Desa', volume: 1, satuan: 'OB (Orang/Bulan)' },
                                { id: 2, nama: 'Tunjangan Jabatan Kepala Desa', uraianOutput: 'Tunjangan Kepala Desa', volume: 1, satuan: 'OB (Orang/Bulan)' },
                                { id: 3, nama: 'Tunjangan Kinerja Kades', uraianOutput: 'Tunjangan Kepala Desa', volume: 1, satuan: 'OB (Orang/Bulan)' }
                            ]
                        },
                        {
                            kode: '04.2002.01.01.02.',
                            nama: 'Penyediaan Penghasilan Tetap dan Tunjangan Perangkat Desa',
                            paket: []
                        },
                        {
                            kode: '04.2002.01.01.03.',
                            nama: 'Penyediaan Jaminan Sosial bagi Kepala Desa dan Perangkat Desa',
                            paket: []
                        },
                        {
                            kode: '04.2002.01.01.04.',
                            nama: 'Penyediaan Operasional Pemerintah Desa (ATK, Honor PKPKD dan PPKD dll)',
                            paket: []
                        },
                        {
                            kode: '04.2002.01.01.05.',
                            nama: 'Penyediaan Tunjangan BPD',
                            paket: []
                        },
                        {
                            kode: '04.2002.01.01.06.',
                            nama: 'Penyediaan Operasional BPD (rapat, ATK, Makan Minum, Pakaian Seragam, Listrik dll)',
                            paket: []
                        },
                        {
                            kode: '04.2002.01.01.07.',
                            nama: 'Penyediaan Insentif/Operasional RT/RW',
                            paket: []
                        }
                    ]
                },
                {
                    kode: '04.2002.01.02.',
                    nama: 'Penyediaan Sarana Prasarana Pemerintahan Desa',
                    kegiatan: []
                },
                {
                    kode: '04.2002.01.03.',
                    nama: 'Pengelolaan Administrasi Kependudukan, Pencatatan Sipil, Statistik dan Kearsipan',
                    kegiatan: []
                },
                {
                    kode: '04.2002.01.04.',
                    nama: 'Penyelenggaraan Tata Praja Pemerintahan, Perencanaan, Keuangan dan Pelaporan',
                    kegiatan: []
                },
                {
                    kode: '04.2002.01.05.',
                    nama: 'Sub Bidang Pertanahan',
                    kegiatan: []
                }
            ]
        },
        {
            kode: '04.2002.02',
            nama: 'BIDANG PELAKSANAAN PEMBANGUNAN DESA',
            subBidang: []
        },
        {
            kode: '04.2002.03',
            nama: 'BIDANG PEMBINAAN KEMASYARAKATAN',
            subBidang: []
        },
        {
            kode: '04.2002.04',
            nama: 'BIDANG PEMBERDAYAAN MASYARAKAT',
            subBidang: []
        },
        {
            kode: '04.2002.05',
            nama: 'BIDANG PENANGGULANGAN BENCANA, DARURAT DAN MENDESAK DESA',
            subBidang: []
        }
    ],

    // CRUD for Sub Bidang
    addSubBidang: (bidangKode, subBidang) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? { ...b, subBidang: [...b.subBidang, { ...subBidang, kegiatan: [] }] }
                    : b
            )
        }))
    },

    updateSubBidang: (bidangKode, subKode, updates) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode ? { ...s, ...updates } : s
                        )
                    }
                    : b
            )
        }))
    },

    deleteSubBidang: (bidangKode, subKode) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? { ...b, subBidang: b.subBidang.filter(s => s.kode !== subKode) }
                    : b
            )
        }))
    },

    // CRUD for Kegiatan
    addKegiatan: (bidangKode, subKode, kegiatan) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? { ...s, kegiatan: [...s.kegiatan, { ...kegiatan, paket: [] }] }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    updateKegiatan: (bidangKode, subKode, kegKode, updates) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? {
                                    ...s,
                                    kegiatan: s.kegiatan.map(k =>
                                        k.kode === kegKode ? { ...k, ...updates } : k
                                    )
                                }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    deleteKegiatan: (bidangKode, subKode, kegKode) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? { ...s, kegiatan: s.kegiatan.filter(k => k.kode !== kegKode) }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    // CRUD for Paket Kegiatan
    addPaket: (bidangKode, subKode, kegKode, paket) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? {
                                    ...s,
                                    kegiatan: s.kegiatan.map(k =>
                                        k.kode === kegKode
                                            ? { ...k, paket: [...k.paket, { ...paket, id: Date.now() }] }
                                            : k
                                    )
                                }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    updatePaket: (bidangKode, subKode, kegKode, paketId, updates) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? {
                                    ...s,
                                    kegiatan: s.kegiatan.map(k =>
                                        k.kode === kegKode
                                            ? {
                                                ...k,
                                                paket: k.paket.map(p =>
                                                    p.id === paketId ? { ...p, ...updates } : p
                                                )
                                            }
                                            : k
                                    )
                                }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    deletePaket: (bidangKode, subKode, kegKode, paketId) => {
        set((state) => ({
            bidangKegiatan: state.bidangKegiatan.map(b =>
                b.kode === bidangKode
                    ? {
                        ...b,
                        subBidang: b.subBidang.map(s =>
                            s.kode === subKode
                                ? {
                                    ...s,
                                    kegiatan: s.kegiatan.map(k =>
                                        k.kode === kegKode
                                            ? { ...k, paket: k.paket.filter(p => p.id !== paketId) }
                                            : k
                                    )
                                }
                                : s
                        )
                    }
                    : b
            )
        }))
    },

    // Get counts
    getTotalPaket: () => {
        const data = get().bidangKegiatan
        let count = 0
        data.forEach(b => {
            b.subBidang.forEach(s => {
                s.kegiatan.forEach(k => {
                    count += k.paket.length
                })
            })
        })
        return count
    }
}))

