// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

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

    modals: {
        commit: false,
        pendapatan: false,
        belanja: false,
        export: false,
        newBranch: false,
        viewPaket: false,
        addBelanja: false,
        editBelanja: false,
        kegiatanForm: false,
        pembiayaan: false,
        compare: false,
        belanjaForm: false
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
            pendapatan: false,
            belanja: false,
            export: false,
            newBranch: false,
            viewPaket: false,
            addBelanja: false,
            editBelanja: false,
            kegiatanForm: false,
            pembiayaan: false,
            compare: false,
            belanjaForm: false
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
        {
            id: 1, kode: '4.1.1.', sumber: 'Hasil Usaha Desa',
            items: [
                {
                    id: 'd-101', uraian: 'Bagi Hasil BUMDesa', anggaran: 50000000, perubahan: 0,
                    volume: 1, satuan: 'Tahun', harga: 50000000, jumlah: 50000000,
                    sumberDana: 'Pendapatan Asli Desa'
                }
            ]
        },
        {
            id: 2, kode: '4.1.2.', sumber: 'Swadaya, Partisipasi dan Gotong Royong',
            items: [
                {
                    id: 'd-102', uraian: 'Swadaya Masyarakat Pembangunan Jalan', anggaran: 25000000, perubahan: 0,
                    volume: 1, satuan: 'Kegiatan', harga: 25000000, jumlah: 25000000,
                    sumberDana: 'Swadaya Masyarakat'
                }
            ]
        },
        {
            id: 3, kode: '4.2.1.', sumber: 'Dana Desa',
            items: [
                {
                    id: 'd-103', uraian: 'Dana Desa (Dropping APBN) Tahap I', anggaran: 400000000, perubahan: 0,
                    volume: 1, satuan: 'LS', harga: 400000000, jumlah: 400000000,
                    sumberDana: 'Dana Desa (Dropping APBN)'
                },
                {
                    id: 'd-104', uraian: 'Dana Desa (Dropping APBN) Tahap II', anggaran: 400000000, perubahan: 0,
                    volume: 1, satuan: 'LS', harga: 400000000, jumlah: 400000000,
                    sumberDana: 'Dana Desa (Dropping APBN)'
                }
            ]
        },
        {
            id: 4, kode: '4.2.2.', sumber: 'Alokasi Dana Desa (ADD)',
            items: [
                {
                    id: 'd-105', uraian: 'Alokasi Dana Desa (ADD) Reguler', anggaran: 350000000, perubahan: 0,
                    volume: 12, satuan: 'Bulan', harga: 29166666, jumlah: 350000000,
                    sumberDana: 'Alokasi Dana Desa'
                }
            ]
        },
        {
            id: 5, kode: '4.2.3.', sumber: 'Bagi Hasil Pajak dan Retribusi Daerah',
            items: [
                {
                    id: 'd-106', uraian: 'Bagi Hasil Pajak Daerah', anggaran: 15000000, perubahan: 0,
                    volume: 1, satuan: 'Tahun', harga: 15000000, jumlah: 15000000,
                    sumberDana: 'Penerimaan Bagi Hasil Pajak Retribusi'
                },
                {
                    id: 'd-107', uraian: 'Bagi Hasil Retribusi Daerah', anggaran: 5000000, perubahan: 0,
                    volume: 1, satuan: 'Tahun', harga: 5000000, jumlah: 5000000,
                    sumberDana: 'Penerimaan Bagi Hasil Pajak Retribusi'
                }
            ]
        },
        {
            id: 6, kode: '4.3.1.', sumber: 'Bunga Bank',
            items: [
                {
                    id: 'd-108', uraian: 'Bunga Rekening Kas Desa', anggaran: 5000000, perubahan: 0,
                    volume: 12, satuan: 'Bulan', harga: 416666, jumlah: 5000000,
                    sumberDana: 'Pendapatan Asli Desa'
                }
            ]
        }
    ],

    addPendapatanCategory: (category) => set((state) => ({
        pendapatan: [...state.pendapatan, { ...category, id: Date.now(), items: [] }]
    })),

    updatePendapatanCategory: (id, updates) => set((state) => ({
        pendapatan: state.pendapatan.map(p => p.id === id ? { ...p, ...updates } : p)
    })),

    deletePendapatanCategory: (id) => set((state) => ({
        pendapatan: state.pendapatan.filter(p => p.id !== id)
    })),

    addItem: (categoryId, item) => set((state) => ({
        pendapatan: state.pendapatan.map(p =>
            p.id === categoryId
                ? { ...p, items: [...p.items, { ...item, id: Date.now() }] }
                : p
        )
    })),

    updateItem: (categoryId, itemId, updates) => set((state) => ({
        pendapatan: state.pendapatan.map(p =>
            p.id === categoryId
                ? {
                    ...p,
                    items: p.items.map(it => it.id === itemId ? { ...it, ...updates } : it)
                }
                : p
        )
    })),

    deleteItem: (categoryId, itemId) => set((state) => ({
        pendapatan: state.pendapatan.map(p =>
            p.id === categoryId
                ? { ...p, items: p.items.filter(it => it.id !== itemId) }
                : p
        )
    })),

    getTotalPendapatan: () => {
        const data = get().pendapatan
        return data.reduce((acc, cat) =>
            acc + cat.items.reduce((a, it) => a + (parseFloat(it.jumlah) || 0), 0), 0)
    }
}))

// Belanja Store  
// Helper to generate dummy 6-level hierarchy
const generateDummyRABRinci = (parentId, count = 6) => {
    const sumberDanaList = [
        "Pendapatan Asli Desa",
        "Alokasi Dana Desa",
        "Dana Desa (Dropping APBN)",
        "Penerimaan Bagi Hasil Pajak Retribusi",
        "Penerimaan Bantuan Keuangan Kabupaten",
        "Penerimaan Bantuan Keuangan Propinsi",
        "Swadaya Masyarakat"
    ];
    return Array.from({ length: count }, (_, i) => ({
        id: `rinci-${parentId}-${i + 1}`,
        noUrut: `${i + 1}`,
        uraian: `Uraian Pekerjaan ${i + 1}`,
        anggaran: 1000000,
        perubahan: 0,
        jumlah: 1000000,
        jumlahSatuan: "1 Paket",
        hargaSatuan: 1000000,
        sumberDana: sumberDanaList[i % sumberDanaList.length]
    }));
};

const generateDummyRAB = (parentId, count = 6) => {
    return Array.from({ length: count }, (_, i) => {
        const id = `rab-${parentId}-${i + 1}`;
        const rinci = generateDummyRABRinci(id);
        const total = rinci.reduce((acc, it) => acc + it.jumlah, 0);
        return {
            id,
            kode: `5.2.1.0${i + 1}`,
            namaRekening: `Belanja Modal Peralatan ${i + 1}`,
            anggaran: total,
            perubahan: 0,
            jumlah: total,
            rabRinci: rinci
        };
    });
};

const generateDummyPaket = (parentId, count = 6) => {
    return Array.from({ length: count }, (_, i) => {
        const id = `paket-${parentId}-${i + 1}`;
        const rab = generateDummyRAB(id);
        const total = rab.reduce((acc, it) => acc + it.jumlah, 0);
        return {
            id,
            noUrut: `${i + 1}`,
            namaSubRincian: `Paket Pekerjaan Tahap ${i + 1}`,
            anggaran: total,
            perubahan: 0,
            jumlah: total,
            rab: rab
        };
    });
};

const generateDummyKegiatan = (parentId, count = 6) => {
    return Array.from({ length: count }, (_, i) => {
        const id = `keg-${parentId}-${i + 1}`;
        const paket = generateDummyPaket(id);
        const total = paket.reduce((acc, it) => acc + it.jumlah, 0);
        return {
            id,
            kode: `${parentId}.0${i + 1}`,
            nama: `Kegiatan Pembangunan Desa ${i + 1}`,
            total: total,
            paket: paket
        };
    });
};

// Belanja Store  
export const useBelanjaStore = create((set, get) => ({
    bidangData: [
        {
            kode: '01',
            nama: 'Penyelenggaraan Pemerintahan Desa',
            total: 216000000,
            subBidang: [
                {
                    kode: '01.01',
                    nama: 'Sub Bidang Siltap dan Operasional',
                    total: 216000000,
                    kegiatan: generateDummyKegiatan('01.01')
                }
            ]
        },
        { kode: '02', nama: 'Pelaksanaan Pembangunan Desa', total: 0, subBidang: [] },
        { kode: '03', nama: 'Pembinaan Kemasyarakatan Desa', total: 0, subBidang: [] },
        { kode: '04', nama: 'Pemberdayaan Masyarakat Desa', total: 0, subBidang: [] },
        { kode: '05', nama: 'Penanggulangan Bencana dan Keadaan Mendesak', total: 0, subBidang: [] }
    ],

    getTotalBelanja: () => get().bidangData.reduce((acc, b) => acc + b.total, 0),

    // Generic Recalculate Totals (Bottom-Up)
    recalculateTotals: (data) => {
        return data.map(bidang => {
            const updatedSub = (bidang.subBidang || []).map(sub => {
                const updatedKeg = (sub.kegiatan || []).map(keg => {
                    const updatedPaket = (keg.paket || []).map(pkt => {
                        const updatedRAB = (pkt.rab || []).map(r => {
                            const rabTotal = (r.rabRinci || []).reduce((acc, it) => acc + (it.jumlah || 0), 0);
                            return { ...r, jumlah: rabTotal, anggaran: rabTotal };
                        });
                        const pktTotal = updatedRAB.reduce((acc, r) => acc + (r.jumlah || 0), 0);
                        return { ...pkt, rab: updatedRAB, jumlah: pktTotal, anggaran: pktTotal };
                    });
                    const kegTotal = updatedPaket.reduce((acc, p) => acc + (p.jumlah || 0), 0);
                    return { ...keg, paket: updatedPaket, total: kegTotal };
                });
                const subTotal = updatedKeg.reduce((acc, k) => acc + (k.total || 0), 0);
                return { ...sub, kegiatan: updatedKeg, total: subTotal };
            });
            const bidangTotal = updatedSub.reduce((acc, s) => acc + (s.total || 0), 0);
            return { ...bidang, subBidang: updatedSub, total: bidangTotal };
        });
    },

    // 1. Sub Bidang CRUD
    addSubBidang: (bidangKode, data) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: [...b.subBidang, { ...data, total: 0, kegiatan: [] }] } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    updateSubBidang: (bidangKode, subKode, updates) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, ...updates } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    deleteSubBidang: (bidangKode, subKode) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.filter(s => s.kode !== subKode) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),

    // 2. Kegiatan CRUD
    addKegiatan: (bidangKode, subKode, data) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: [...s.kegiatan, { ...data, id: Date.now(), total: 0, paket: [] }] } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    updateKegiatan: (bidangKode, subKode, kegId, updates) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, ...updates } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    deleteKegiatan: (bidangKode, subKode, kegId) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.filter(k => k.id !== kegId) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),

    // 3. Paket CRUD
    addPaket: (bidangKode, subKode, kegId, data) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: [...k.paket, { ...data, id: Date.now(), anggaran: 0, jumlah: 0, rab: [] }] } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    updatePaket: (bidangKode, subKode, kegId, pktId, updates) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: k.paket.map(p => p.id === pktId ? { ...p, ...updates } : p) } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    deletePaket: (bidangKode, subKode, kegId, pktId) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: k.paket.filter(p => p.id !== pktId) } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),

    // 4. RAB CRUD
    addRAB: (bidangKode, subKode, kegId, pktId, data) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: k.paket.map(p => p.id === pktId ? { ...p, rab: [...p.rab, { ...data, id: Date.now(), anggaran: 0, jumlah: 0, rabRinci: [] }] } : p) } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    updateRAB: (bidangKode, subKode, kegId, pktId, rabId, updates) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: k.paket.map(p => p.id === pktId ? { ...p, rab: p.rab.map(r => r.id === rabId ? { ...r, ...updates } : r) } : p) } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    deleteRAB: (bidangKode, subKode, kegId, pktId, rabId) => set(state => {
        const newData = state.bidangData.map(b => b.kode === bidangKode ? { ...b, subBidang: b.subBidang.map(s => s.kode === subKode ? { ...s, kegiatan: s.kegiatan.map(k => k.id === kegId ? { ...k, paket: k.paket.map(p => p.id === pktId ? { ...p, rab: p.rab.filter(r => r.id !== rabId) } : p) } : k) } : s) } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),

    // 5. RAB Rinci CRUD (Leaf Items)
    addRABRinci: (path, data) => set(state => {
        const { bidang, sub, keg, pkt, rab } = path;
        const newData = state.bidangData.map(b => b.kode === bidang ? {
            ...b, subBidang: b.subBidang.map(s => s.kode === sub ? {
                ...s, kegiatan: s.kegiatan.map(k => k.id === keg ? {
                    ...k, paket: k.paket.map(p => p.id === pkt ? {
                        ...p, rab: p.rab.map(r => r.id === rab ? {
                            ...r, rabRinci: [...r.rabRinci, { ...data, id: Date.now(), total: data.jumlah || ((data.volume || 0) * (data.hargaSatuan || 0)) }]
                        } : r)
                    } : p)
                } : k)
            } : s)
        } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    updateRABRinci: (path, itemId, updates) => set(state => {
        const { bidang, sub, keg, pkt, rab } = path;
        const newData = state.bidangData.map(b => b.kode === bidang ? {
            ...b, subBidang: b.subBidang.map(s => s.kode === sub ? {
                ...s, kegiatan: s.kegiatan.map(k => k.id === keg ? {
                    ...k, paket: k.paket.map(p => p.id === pkt ? {
                        ...p, rab: p.rab.map(r => r.id === rab ? {
                            ...r, rabRinci: r.rabRinci.map(it => it.id === itemId ? { ...it, ...updates, jumlah: (updates.volume || it.volume) * (updates.hargaSatuan || it.hargaSatuan) } : it)
                        } : r)
                    } : p)
                } : k)
            } : s)
        } : b);
        return { bidangData: state.recalculateTotals(newData) };
    }),
    deleteRABRinci: (path, itemId) => set(state => {
        const { bidang, sub, keg, pkt, rab } = path;
        const newData = state.bidangData.map(b => b.kode === bidang ? {
            ...b, subBidang: b.subBidang.map(s => s.kode === sub ? {
                ...s, kegiatan: s.kegiatan.map(k => k.id === keg ? {
                    ...k, paket: k.paket.map(p => p.id === pkt ? {
                        ...p, rab: p.rab.map(r => r.id === rab ? {
                            ...r, rabRinci: r.rabRinci.filter(it => it.id !== itemId)
                        } : r)
                    } : p)
                } : k)
            } : s)
        } : b);
        return { bidangData: state.recalculateTotals(newData) };
    })
}))

// Version/Commit Store - With Real Snapshots
export const useVersionStore = create((set, get) => ({
    // Snapshots storage: { snapshotId: snapshotData }
    snapshots: {},

    // Commits with snapshotId reference
    commits: [
        {
            id: 'v1.0',
            version: '1.0',
            date: '2026-01-10 10:00',
            author: 'Admin',
            message: 'Initial Draft - APBDes 2026',
            status: 'current',
            branchName: 'main',
            snapshotId: null, // Initial commit has no snapshot yet
            changes: { added: 50, modified: 0, deleted: 0 }
        }
    ],

    // Branches with current snapshot reference
    branches: [
        { name: 'main', current: true, currentSnapshotId: null }
    ],

    selectedCommit: null,
    setSelectedCommit: (commit) => set({ selectedCommit: commit }),

    // Get current branch
    getCurrentBranch: () => {
        return get().branches.find(b => b.current) || { name: 'main', current: true }
    },

    // Add a new commit with snapshot
    addCommit: (message, snapshot = null) => {
        const state = get()
        const currentBranch = state.getCurrentBranch()
        const branchCommits = state.commits.filter(c => c.branchName === currentBranch.name)

        // Calculate new version
        const latestVersion = branchCommits.length > 0
            ? parseFloat(branchCommits[0]?.version || '1.0')
            : 1.0
        const newVersion = (latestVersion + 0.1).toFixed(1)

        // Get previous snapshot for diff calculation
        const previousSnapshotId = branchCommits.find(c => c.status === 'current')?.snapshotId
        const previousSnapshot = previousSnapshotId ? state.snapshots[previousSnapshotId] : null

        // Calculate real changes
        let changes = { added: 0, modified: 0, deleted: 0 }
        if (snapshot && previousSnapshot) {
            // Import dynamically to avoid circular dependency
            import('../services/snapshotService.js').then(({ calculateChanges }) => {
                changes = calculateChanges(previousSnapshot, snapshot)
            }).catch(() => {
                changes = { added: 0, modified: 1, deleted: 0 }
            })
        }

        // Mark old current as old
        const updatedCommits = state.commits.map(c =>
            c.branchName === currentBranch.name && c.status === 'current'
                ? { ...c, status: 'old' }
                : c
        )

        const newCommit = {
            id: `v${newVersion}-${Date.now()}`,
            version: newVersion,
            date: new Date().toLocaleString('sv-SE').replace('T', ' ').slice(0, 16),
            author: 'Admin',
            message,
            status: 'current',
            branchName: currentBranch.name,
            snapshotId: snapshot?.id || null,
            changes
        }

        // Update snapshots storage
        const newSnapshots = snapshot
            ? { ...state.snapshots, [snapshot.id]: snapshot }
            : state.snapshots

        // Update branch's current snapshot
        const updatedBranches = state.branches.map(b =>
            b.name === currentBranch.name
                ? { ...b, currentSnapshotId: snapshot?.id || b.currentSnapshotId }
                : b
        )

        set({
            commits: [newCommit, ...updatedCommits],
            snapshots: newSnapshots,
            branches: updatedBranches
        })

        return newCommit
    },

    // Revert to a specific commit
    revertToCommit: async (commitId) => {
        const state = get()
        const commit = state.commits.find(c => c.id === commitId)

        if (!commit || !commit.snapshotId) {
            console.error('Cannot revert: commit or snapshot not found')
            return false
        }

        const snapshot = state.snapshots[commit.snapshotId]
        if (!snapshot) {
            console.error('Snapshot not found:', commit.snapshotId)
            return false
        }

        try {
            const { restoreSnapshot } = await import('../services/snapshotService.js')
            const success = restoreSnapshot(snapshot)

            if (success) {
                // Mark this commit as current
                const updatedCommits = state.commits.map(c => ({
                    ...c,
                    status: c.id === commitId ? 'current' :
                        (c.branchName === commit.branchName && c.status === 'current') ? 'old' : c.status
                }))

                // Update branch's current snapshot
                const updatedBranches = state.branches.map(b =>
                    b.name === commit.branchName
                        ? { ...b, currentSnapshotId: commit.snapshotId }
                        : b
                )

                set({ commits: updatedCommits, branches: updatedBranches })
            }

            return success
        } catch (error) {
            console.error('Revert failed:', error)
            return false
        }
    },

    // Get snapshot for a commit
    getSnapshotForCommit: (commitId) => {
        const state = get()
        const commit = state.commits.find(c => c.id === commitId)
        if (!commit?.snapshotId) return null
        return state.snapshots[commit.snapshotId] || null
    },

    // Add a new branch (creates from current state)
    addBranch: (name, snapshot = null) => {
        const state = get()
        const snapshotId = snapshot?.id || null

        // Store snapshot if provided
        const newSnapshots = snapshot
            ? { ...state.snapshots, [snapshot.id]: snapshot }
            : state.snapshots

        set({
            branches: [...state.branches, { name, current: false, currentSnapshotId: snapshotId }],
            snapshots: newSnapshots
        })
    },

    // Switch to a different branch
    switchBranch: async (name) => {
        const state = get()
        const targetBranch = state.branches.find(b => b.name === name)

        if (!targetBranch) {
            console.error('Branch not found:', name)
            return false
        }

        // Restore snapshot if branch has one
        if (targetBranch.currentSnapshotId) {
            const snapshot = state.snapshots[targetBranch.currentSnapshotId]
            if (snapshot) {
                try {
                    const { restoreSnapshot } = await import('../services/snapshotService.js')
                    restoreSnapshot(snapshot)
                } catch (error) {
                    console.error('Failed to restore branch snapshot:', error)
                }
            }
        }

        // Update current branch
        set({
            branches: state.branches.map(b => ({ ...b, current: b.name === name }))
        })

        return true
    },

    // Get commits for current branch only
    getCommitsForCurrentBranch: () => {
        const state = get()
        const currentBranch = state.getCurrentBranch()
        return state.commits.filter(c => c.branchName === currentBranch.name)
    },

    // Initialize with initial snapshot (call once on first load)
    initializeWithSnapshot: (snapshot) => {
        const state = get()

        // Only initialize if we have no snapshots yet
        if (Object.keys(state.snapshots).length === 0 && snapshot) {
            const initialCommit = state.commits[0]
            if (initialCommit && !initialCommit.snapshotId) {
                set({
                    snapshots: { [snapshot.id]: snapshot },
                    commits: state.commits.map((c, i) =>
                        i === 0 ? { ...c, snapshotId: snapshot.id } : c
                    ),
                    branches: state.branches.map(b =>
                        b.name === 'main' ? { ...b, currentSnapshotId: snapshot.id } : b
                    )
                })
            }
        }
    },

    // Flag to track if data has been loaded from database
    isLoaded: false,

    // Load version data from SQLite database
    loadFromDatabase: async () => {
        try {
            const { loadVersionData } = await import('../services/persistenceService.js')
            const data = await loadVersionData()

            if (data && (data.commits?.length > 0 || data.branches?.length > 0)) {
                set({
                    commits: data.commits || [],
                    branches: data.branches || [],
                    snapshots: data.snapshots || {},
                    isLoaded: true
                })
                console.log('Version data loaded from database:', data.commits?.length, 'commits')
                return true
            } else {
                console.log('No existing version data in database, using defaults')
                set({ isLoaded: true })
                return false
            }
        } catch (error) {
            console.error('Failed to load from database:', error)
            set({ isLoaded: true })
            return false
        }
    },

    // Persist current state to database (call after major changes)
    persistToDatabase: async () => {
        try {
            const state = get()
            const { saveBranch, saveCommit, saveSnapshot } = await import('../services/persistenceService.js')

            // Save all branches
            for (const branch of state.branches) {
                await saveBranch(branch)
            }

            // Save all commits
            for (const commit of state.commits) {
                await saveCommit(commit)
            }

            // Save all snapshots
            for (const [id, snapshot] of Object.entries(state.snapshots)) {
                await saveSnapshot(snapshot)
            }

            console.log('Version data persisted to database')
            return true
        } catch (error) {
            console.error('Failed to persist to database:', error)
            return false
        }
    }
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
                                {
                                    id: 1,
                                    nama: 'Penghasilan Tetap Kepala Desa',
                                    uraianOutput: 'Penghasilan Tetap Kepala Desa',
                                    volume: 1,
                                    satuan: 'OB',
                                    nilai: 39204000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik-Lainnya',
                                    pktd: 'NON-PKTD'
                                },
                                {
                                    id: 2,
                                    nama: 'Tunjangan Jabatan Kepala Desa',
                                    uraianOutput: 'Tunjangan Kepala Desa',
                                    volume: 1,
                                    satuan: 'OB',
                                    nilai: 2400000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik-Lainnya',
                                    pktd: 'NON-PKTD'
                                },
                                {
                                    id: 3,
                                    nama: 'Tunjangan Kinerja Kades',
                                    uraianOutput: 'Tunjangan Kepala Desa',
                                    volume: 1,
                                    satuan: 'OB',
                                    nilai: 0,
                                    sumberDana: 'Pendapatan Asli Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik-Lainnya',
                                    pktd: 'NON-PKTD'
                                }
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
                    kode: '04.2002.01.06.',
                    nama: 'Pengelolaan dan Penyelenggaraan PAUD/TK/TPA/TKA',
                    kegiatan: []
                },
                {
                    kode: '04.2002.01.07.',
                    nama: 'Pembangunan/Rehabilitasi/Peningkatan Pelayanan Kesehatan',
                    kegiatan: []
                },
                {
                    kode: '04.2002.01.08.',
                    nama: 'Pengelolaan Administrasi Desa',
                    kegiatan: [
                        {
                            kode: '04.2002.01.08.01.',
                            nama: 'Penyediaan Operasional Kantor Desa',
                            paket: [
                                {
                                    id: 'p-101',
                                    nama: 'Paket ATK Kantor',
                                    uraianOutput: 'Tersedianya Alat Tulis Kantor',
                                    volume: 1,
                                    satuan: 'Paket',
                                    nilai: 5000000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'Kantor Desa'
                                }
                            ]
                        },
                        {
                            kode: '04.2002.01.08.02.',
                            nama: 'Pengadaan Sarana Prasarana Kantor',
                            paket: [
                                {
                                    id: 'p-102',
                                    nama: 'Komputer PC Administrator',
                                    uraianOutput: 'Tersedianya Unit Komputer PC',
                                    volume: 1,
                                    satuan: 'Unit',
                                    nilai: 15000000,
                                    sumberDana: 'Dana Desa (Dropping APBN)',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'Kantor Desa'
                                }
                            ]
                        }
                    ]
                },
                {
                    kode: '04.2002.01.09.',
                    nama: 'Pengembangan Sistem Informasi Desa',
                    kegiatan: [
                        {
                            kode: '04.2002.01.09.01.',
                            nama: 'Pemeliharaan Website Desa',
                            paket: [
                                {
                                    id: 'p-103',
                                    nama: 'Update Konten & Hosting Website',
                                    uraianOutput: 'Website Desa Aktif dan Terupdate',
                                    volume: 1,
                                    satuan: 'Tahun',
                                    nilai: 7000000,
                                    sumberDana: 'Pendapatan Asli Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'Balai Desa'
                                }
                            ]
                        }
                    ]
                },
                {
                    kode: '04.2002.01.10.',
                    nama: 'Penyelenggaraan Musyawarah Desa',
                    kegiatan: [
                        {
                            kode: '04.2002.01.10.01.',
                            nama: 'Musyawarah Perencanaan Desa',
                            paket: [
                                {
                                    id: 'p-104',
                                    nama: 'Konsumsi Musrenbangdes',
                                    uraianOutput: 'Terlaksananya Musyawarah Desa',
                                    volume: 1,
                                    satuan: 'Kegiatan',
                                    nilai: 10000000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'GOR Desa'
                                }
                            ]
                        }
                    ]
                },
                {
                    kode: '04.2002.01.11.',
                    nama: 'Penyusunan Dokumen Perencanaan Desa',
                    kegiatan: [
                        {
                            kode: '04.2002.01.11.01.',
                            nama: 'Penyusunan RKP Desa',
                            paket: [
                                {
                                    id: 'p-105',
                                    nama: 'Honorarium Tim Penyusun RKP',
                                    uraianOutput: 'Dokumen RKP Desa Terbit',
                                    volume: 1,
                                    satuan: 'Laporan',
                                    nilai: 5000000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'Kantor Desa'
                                }
                            ]
                        },
                        {
                            kode: '04.2002.01.11.02.',
                            nama: 'Penyusunan APBDes',
                            paket: [
                                {
                                    id: 'p-106',
                                    nama: 'Cetak Dokumen APBDes',
                                    uraianOutput: 'Buku APBDes Terdistribusi',
                                    volume: 1,
                                    satuan: 'Eksemplar',
                                    nilai: 3000000,
                                    sumberDana: 'Alokasi Dana Desa',
                                    polaKegiatan: 'Swakelola',
                                    sifatKegiatan: 'Non Fisik',
                                    pktd: 'NON-PKTD',
                                    lokasi: 'Kantor Desa'
                                }
                            ]
                        }
                    ]
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

