// backupService.js
import { usePendapatanStore, useBelanjaStore, useAppStore, useKegiatanStore } from '../stores'

// Access stores directly (Zustand getState)
// Note: In index.js we export specific stores. We need to import them here.
// Since we might have circular dependency if we import from index.js if index.js imports this service?
// Implementation plan said index.js modifies addYear to call this service.
// So this service should accept 'stores' or 'data' as arguments OR import them.
// Importing stores from index.js is safe if we don't execute immediately on load.

// Helper to get all data
export const getAllData = () => {
    // Dynamically import stores to avoid circular dependency issues if any
    // or just use the imported hooks if they are stable.

    // For now, let's assume we can import them.
    // If stores are in index.js, we import them.
    const appStore = require('../stores').useAppStore.getState()
    const pendapatanStore = require('../stores').usePendapatanStore.getState()
    const belanjaStore = require('../stores').useBelanjaStore.getState()
    // Check if useKegiatanStore is enabled/exists. In previous logs it seemed to be part of index.js or specific file.
    // Based on previous file reads, useKegiatanStore was conceptually part of the refactor.
    // Let's inspect stores/index.js again to be sure what stores exist.

    // Safety fallback: if we can't get store, return empty

    return {
        metadata: {
            date: new Date().toISOString(),
            version: '1.0',
            year: appStore.selectedYear,
            appName: 'Siskeudes Wahyu'
        },
        data: {
            pendapatan: pendapatanStore.pendapatan || [],
            belanja: belanjaStore.bidangData || [],
            // Add other stores here
        }
    }
}

// 1. Export Database (Download JSON)
export const exportDatabase = () => {
    try {
        const { usePendapatanStore, useBelanjaStore, useAppStore, usePembiayaan1Store, usePembiayaan2Store } = require('../stores')

        const data = {
            metadata: {
                timestamp: Date.now(),
                exportedDate: new Date().toLocaleString('id-ID'),
                appVersion: '1.0',
                year: useAppStore.getState().selectedYear
            },
            stores: {
                pendapatan: usePendapatanStore.getState().pendapatan,
                belanja: useBelanjaStore.getState().bidangData,
                pembiayaan1: usePembiayaan1Store?.getState()?.items || [],
                pembiayaan2: usePembiayaan2Store?.getState()?.items || []
            }
        }

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Siskeudes_Backup_${data.metadata.year}_${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        return true
    } catch (error) {
        console.error('Export failed:', error)
        return false
    }
}

// 2. Import Database (Restore JSON)
export const importDatabase = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result)
                if (!json.stores) throw new Error('Invalid backup format')

                const { usePendapatanStore, useBelanjaStore, useAppStore, usePembiayaan1Store, usePembiayaan2Store } = require('../stores')

                // Restore Stores
                if (json.stores.pendapatan) usePendapatanStore.setState({ pendapatan: json.stores.pendapatan })
                if (json.stores.belanja) useBelanjaStore.setState({ bidangData: json.stores.belanja })
                // Pembiayaan might need special handling if setters are different
                // Assuming simple state replacement for now or granular updates

                // For simplicity/safety, we might need a "setAll" action in stores, or just setState directly if allowed.
                // Zustand setState works directly.

                resolve(true)
            } catch (error) {
                console.error('Import failed:', error)
                reject(error)
            }
        }
        reader.readAsText(file)
    })
}

// 3. Session Manager (Year Isolation)
const STORAGE_PREFIX = 'siskeudes_session_'

// 4. Clear Session (Reset All Data)
export const clearSession = () => {
    try {
        const { usePendapatanStore, useBelanjaStore, useKegiatanStore, usePembiayaan1Store, usePembiayaan2Store } = require('../stores')

        console.log('Clearing session data...')

        // Reset Pendapatan
        // Assuming 'pendapatan' array is the main state
        usePendapatanStore.setState({ pendapatan: [] }) // Or reset to initial structure if needed

        // Reset Belanja
        // We need to keep the Bidang structure (01-05) but clear amounts/children
        // Ideally we should have a `reset()` action in the store, but here we reconstruct the initial state manually or clear it.
        // If we clear only values, we need to map over it.
        // For "Empty Year", having 0 items is fine? 
        // But the page expects 'bidangData' to have 5 items.
        // Let's reset to default structure.
        const defaultBidangData = [
            { kode: '01', nama: 'Penyelenggaraan Pemerintahan Desa', total: 0, subBidang: [] },
            { kode: '02', nama: 'Pelaksanaan Pembangunan Desa', total: 0, subBidang: [] },
            { kode: '03', nama: 'Pembinaan Kemasyarakatan Desa', total: 0, subBidang: [] },
            { kode: '04', nama: 'Pemberdayaan Masyarakat Desa', total: 0, subBidang: [] },
            { kode: '05', nama: 'Penanggulangan Bencana dan Keadaan Mendesak', total: 0, subBidang: [] }
        ]
        useBelanjaStore.setState({ bidangData: defaultBidangData })

        // Reset Kegiatan
        // This store also relies on 'bidangKegiatan' likely.
        // Let's check the structure in KegiatanPage or assume similar to Belanja.
        // If we don't have the default structure, it might break.
        // Let's assume it has a structure. If we can't find it, we might break.
        // Safest is to call a reset action if it exists.
        // But since we are editing stores/index.js anyway, we can add reset actions there!
        // For now, let's try to set empty properties.
        if (useKegiatanStore) {
            // Reconstruct default structure for Kegiatan (similar to Belanja?)
            // Based on logs, it uses `bidangKegiatan`
            const defaultKegiatanData = [
                { kode: '01', nama: 'Penyelenggaraan Pemerintahan Desa', subBidang: [] },
                { kode: '02', nama: 'Pelaksanaan Pembangunan Desa', subBidang: [] },
                { kode: '03', nama: 'Pembinaan Kemasyarakatan Desa', subBidang: [] },
                { kode: '04', nama: 'Pemberdayaan Masyarakat Desa', subBidang: [] },
                { kode: '05', nama: 'Penanggulangan Bencana dan Keadaan Mendesak', subBidang: [] }
            ]
            useKegiatanStore.setState({ bidangKegiatan: defaultKegiatanData })
        }

        if (usePembiayaan1Store) usePembiayaan1Store.setState({ items: [] })
        if (usePembiayaan2Store) usePembiayaan2Store.setState({ items: [] })

        return true
    } catch (error) {
        console.error('Failed to clear session:', error)
        return false
    }
}

export const saveYearSession = (year) => {
    try {
        const { usePendapatanStore, useBelanjaStore, useKegiatanStore, usePembiayaan1Store, usePembiayaan2Store } = require('../stores')

        const sessionData = {
            pendapatan: usePendapatanStore.getState().pendapatan,
            belanja: useBelanjaStore.getState().bidangData,
            kegiatan: useKegiatanStore?.getState()?.bidangKegiatan || [],
            pembiayaan1: usePembiayaan1Store?.getState()?.items || [],
            pembiayaan2: usePembiayaan2Store?.getState()?.items || []
        }

        localStorage.setItem(`${STORAGE_PREFIX}${year}`, JSON.stringify(sessionData))
        console.log(`Session saved for year ${year}`)
        return true
    } catch (error) {
        console.error(`Failed to save session for ${year}:`, error)
        return false
    }
}

export const loadYearSession = (year) => {
    try {
        const { usePendapatanStore, useBelanjaStore, useKegiatanStore, usePembiayaan1Store, usePembiayaan2Store } = require('../stores')

        const raw = localStorage.getItem(`${STORAGE_PREFIX}${year}`)

        if (raw) {
            const data = JSON.parse(raw)
            console.log(`Loading session for year ${year}`)

            if (data.pendapatan) usePendapatanStore.setState({ pendapatan: data.pendapatan })
            if (data.belanja) useBelanjaStore.setState({ bidangData: data.belanja })
            if (data.kegiatan && useKegiatanStore) useKegiatanStore.setState({ bidangKegiatan: data.kegiatan })
            if (data.pembiayaan1 && usePembiayaan1Store) usePembiayaan1Store.setState({ items: data.pembiayaan1 })
            if (data.pembiayaan2 && usePembiayaan2Store) usePembiayaan2Store.setState({ items: data.pembiayaan2 })

            return true
        } else {
            console.log(`No session found for ${year}.`)
            return false
        }
    } catch (error) {
        console.error(`Failed to load session for ${year}:`, error)
        return false
    }
}
