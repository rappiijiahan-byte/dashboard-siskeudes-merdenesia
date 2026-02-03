// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

/**
 * Snapshot Service
 * Manages deep cloning and restoration of all APBDes data stores
 */

import { usePendapatanStore, useBelanjaStore, usePembiayaan1Store, usePembiayaan2Store, useKegiatanStore } from '../stores'

/**
 * Create a deep clone snapshot of all APBDes data
 */
export function createSnapshot() {
    const snapshot = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        data: {
            pendapatan: structuredClone(usePendapatanStore.getState().pendapatan),
            belanja: structuredClone(useBelanjaStore.getState().bidangData),
            pembiayaan1: structuredClone(usePembiayaan1Store.getState().kategoriPembiayaan1),
            pembiayaan2: structuredClone(usePembiayaan2Store.getState().kategoriPembiayaan2),
            kegiatan: structuredClone(useKegiatanStore.getState().bidangKegiatan)
        }
    }
    return snapshot
}

/**
 * Restore all stores from a snapshot
 */
export function restoreSnapshot(snapshot) {
    if (!snapshot || !snapshot.data) {
        console.error('Invalid snapshot provided')
        return false
    }

    try {
        usePendapatanStore.setState({ pendapatan: snapshot.data.pendapatan })
        useBelanjaStore.setState({ bidangData: snapshot.data.belanja })
        usePembiayaan1Store.setState({ kategoriPembiayaan1: snapshot.data.pembiayaan1 })
        usePembiayaan2Store.setState({ kategoriPembiayaan2: snapshot.data.pembiayaan2 })
        useKegiatanStore.setState({ bidangKegiatan: snapshot.data.kegiatan })
        return true
    } catch (error) {
        console.error('Failed to restore snapshot:', error)
        return false
    }
}

/**
 * Flatten nested items for comparison
 */
function flattenItems(data, items = []) {
    if (!data) return items

    if (Array.isArray(data)) {
        data.forEach(item => {
            if (item.id) items.push({ id: item.id, data: item })
            // Recurse into nested arrays
            Object.values(item).forEach(val => {
                if (Array.isArray(val)) flattenItems(val, items)
            })
        })
    }
    return items
}

/**
 * Calculate changes between two snapshots
 */
export function calculateChanges(oldSnapshot, newSnapshot) {
    if (!oldSnapshot || !newSnapshot) {
        return { added: 0, modified: 0, deleted: 0 }
    }

    let added = 0
    let modified = 0
    let deleted = 0

    // Compare each data category
    const categories = ['pendapatan', 'belanja', 'pembiayaan1', 'pembiayaan2', 'kegiatan']

    categories.forEach(category => {
        const oldItems = flattenItems(oldSnapshot.data?.[category])
        const newItems = flattenItems(newSnapshot.data?.[category])

        const oldIds = new Set(oldItems.map(i => i.id))
        const newIds = new Set(newItems.map(i => i.id))

        // Count added items
        newItems.forEach(item => {
            if (!oldIds.has(item.id)) added++
        })

        // Count deleted items
        oldItems.forEach(item => {
            if (!newIds.has(item.id)) deleted++
        })

        // Count modified items
        newItems.forEach(newItem => {
            if (oldIds.has(newItem.id)) {
                const oldItem = oldItems.find(o => o.id === newItem.id)
                if (oldItem && JSON.stringify(oldItem.data) !== JSON.stringify(newItem.data)) {
                    modified++
                }
            }
        })
    })

    return { added, modified, deleted }
}

/**
 * Get detailed diff between two snapshots for compare modal
 */
export function getDetailedDiff(oldSnapshot, newSnapshot) {
    if (!oldSnapshot || !newSnapshot) {
        return []
    }

    const changes = []
    const categories = [
        { key: 'pendapatan', label: 'Pendapatan' },
        { key: 'belanja', label: 'Belanja' },
        { key: 'pembiayaan1', label: 'Pembiayaan Penerimaan' },
        { key: 'pembiayaan2', label: 'Pembiayaan Pengeluaran' },
        { key: 'kegiatan', label: 'Kegiatan' }
    ]

    categories.forEach(({ key, label }) => {
        const oldItems = flattenItems(oldSnapshot.data?.[key])
        const newItems = flattenItems(newSnapshot.data?.[key])

        const oldIds = new Set(oldItems.map(i => i.id))
        const newIds = new Set(newItems.map(i => i.id))

        // Added items
        newItems.forEach(item => {
            if (!oldIds.has(item.id)) {
                changes.push({
                    type: 'added',
                    category: label,
                    item: item.data.uraian || item.data.nama || item.data.sumber || `ID: ${item.id}`,
                    amount: item.data.jumlah || item.data.anggaran || item.data.total || 0
                })
            }
        })

        // Deleted items
        oldItems.forEach(item => {
            if (!newIds.has(item.id)) {
                changes.push({
                    type: 'deleted',
                    category: label,
                    item: item.data.uraian || item.data.nama || item.data.sumber || `ID: ${item.id}`,
                    amount: item.data.jumlah || item.data.anggaran || item.data.total || 0
                })
            }
        })

        // Modified items
        newItems.forEach(newItem => {
            if (oldIds.has(newItem.id)) {
                const oldItem = oldItems.find(o => o.id === newItem.id)
                if (oldItem && JSON.stringify(oldItem.data) !== JSON.stringify(newItem.data)) {
                    const oldValue = oldItem.data.jumlah || oldItem.data.anggaran || oldItem.data.total || 0
                    const newValue = newItem.data.jumlah || newItem.data.anggaran || newItem.data.total || 0
                    changes.push({
                        type: 'modified',
                        category: label,
                        item: newItem.data.uraian || newItem.data.nama || newItem.data.sumber || `ID: ${newItem.id}`,
                        oldValue,
                        newValue,
                        diff: newValue - oldValue
                    })
                }
            }
        })
    })

    return changes
}

export const snapshotService = {
    createSnapshot,
    restoreSnapshot,
    calculateChanges,
    getDetailedDiff
}

export default snapshotService
