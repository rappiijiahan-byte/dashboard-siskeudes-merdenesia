// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

/**
 * Persistence Service
 * Handles communication with the main process for database operations
 */

// Helper to check if running in Electron
const isElectron = () => typeof window !== 'undefined' && window.electronAPI?.versionControl

/**
 * Load all version control data from database
 */
export async function loadVersionData() {
    if (!isElectron()) {
        console.log('Not running in Electron, skipping database load')
        return null
    }

    try {
        const data = await window.electronAPI.versionControl.loadVersionData()
        return data
    } catch (error) {
        console.error('Failed to load version data:', error)
        return null
    }
}

/**
 * Save a commit to the database
 */
export async function saveCommit(commit) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.saveCommit(commit)
        return true
    } catch (error) {
        console.error('Failed to save commit:', error)
        return false
    }
}

/**
 * Save a snapshot to the database
 */
export async function saveSnapshot(snapshot) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.saveSnapshot(snapshot)
        return true
    } catch (error) {
        console.error('Failed to save snapshot:', error)
        return false
    }
}

/**
 * Get a snapshot by ID
 */
export async function getSnapshot(snapshotId) {
    if (!isElectron()) return null

    try {
        return await window.electronAPI.versionControl.getSnapshot(snapshotId)
    } catch (error) {
        console.error('Failed to get snapshot:', error)
        return null
    }
}

/**
 * Get all snapshots
 */
export async function getAllSnapshots() {
    if (!isElectron()) return {}

    try {
        return await window.electronAPI.versionControl.getAllSnapshots()
    } catch (error) {
        console.error('Failed to get all snapshots:', error)
        return {}
    }
}

/**
 * Get commits, optionally filtered by branch
 */
export async function getCommits(branchName = null) {
    if (!isElectron()) return []

    try {
        return await window.electronAPI.versionControl.getCommits(branchName)
    } catch (error) {
        console.error('Failed to get commits:', error)
        return []
    }
}

/**
 * Save a branch to the database
 */
export async function saveBranch(branch) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.saveBranch(branch)
        return true
    } catch (error) {
        console.error('Failed to save branch:', error)
        return false
    }
}

/**
 * Switch to a branch (updates is_current in database)
 */
export async function switchBranchDb(branchName) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.switchBranch(branchName)
        return true
    } catch (error) {
        console.error('Failed to switch branch:', error)
        return false
    }
}

/**
 * Update branch's current snapshot
 */
export async function updateBranchSnapshot(branchName, snapshotId) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.updateBranchSnapshot(branchName, snapshotId)
        return true
    } catch (error) {
        console.error('Failed to update branch snapshot:', error)
        return false
    }
}

/**
 * Update commit status
 */
export async function updateCommitStatus(commitId, status) {
    if (!isElectron()) return true

    try {
        await window.electronAPI.versionControl.updateCommitStatus(commitId, status)
        return true
    } catch (error) {
        console.error('Failed to update commit status:', error)
        return false
    }
}

/**
 * Get all branches
 */
export async function getBranches() {
    if (!isElectron()) return []

    try {
        return await window.electronAPI.versionControl.getBranches()
    } catch (error) {
        console.error('Failed to get branches:', error)
        return []
    }
}

export const persistenceService = {
    loadVersionData,
    saveCommit,
    saveSnapshot,
    getSnapshot,
    getAllSnapshots,
    getCommits,
    saveBranch,
    switchBranchDb,
    updateBranchSnapshot,
    updateCommitStatus,
    getBranches
}

export default persistenceService
