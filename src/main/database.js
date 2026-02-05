// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

/**
 * SQLite Database Module for Version Control Persistence
 * Refactored to use 'sql.js' (WASM) to avoid native build issues on Windows
 */

import initSqlJs from 'sql.js'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

let db = null
let dbPath = null

/**
 * Save the database to disk
 */
function persist() {
    if (db && dbPath) {
        const data = db.export()
        const buffer = Buffer.from(data)
        fs.writeFileSync(dbPath, buffer)
    }
}

/**
 * Initialize the database connection and create tables
 */
export async function initDatabase() {
    dbPath = path.join(app.getPath('userData'), 'apbdes-versions.db')

    const SQL = await initSqlJs()

    if (fs.existsSync(dbPath)) {
        const fileBuffer = fs.readFileSync(dbPath)
        db = new SQL.Database(fileBuffer)
    } else {
        db = new SQL.Database()
    }

    // Create tables
    db.run(`
        CREATE TABLE IF NOT EXISTS branches (
            name TEXT PRIMARY KEY,
            is_current INTEGER DEFAULT 0,
            current_snapshot_id TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS commits (
            id TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            message TEXT NOT NULL,
            author TEXT NOT NULL,
            branch_name TEXT NOT NULL,
            snapshot_id TEXT,
            status TEXT DEFAULT 'old',
            changes_added INTEGER DEFAULT 0,
            changes_modified INTEGER DEFAULT 0,
            changes_deleted INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            FOREIGN KEY (branch_name) REFERENCES branches(name)
        );
        
        CREATE TABLE IF NOT EXISTS snapshots (
            id TEXT PRIMARY KEY,
            commit_id TEXT,
            data TEXT NOT NULL,
            timestamp INTEGER NOT NULL
        );
        
        CREATE INDEX IF NOT EXISTS idx_commits_branch ON commits(branch_name);
        CREATE INDEX IF NOT EXISTS idx_commits_status ON commits(status);
    `)

    // Insert default 'main' branch if not exists
    db.run('INSERT OR IGNORE INTO branches (name, is_current) VALUES (?, ?)', ['main', 1])

    persist()
    console.log('Database initialized at:', dbPath)
    return db
}

/**
 * Get all branches
 */
export async function getBranches() {
    const res = db.exec('SELECT name, is_current, current_snapshot_id FROM branches')
    if (res.length === 0) return []

    const { columns, values } = res[0]
    return values.map(v => {
        const row = {}
        columns.forEach((col, i) => row[col] = v[i])
        return {
            name: row.name,
            current: row.is_current === 1,
            currentSnapshotId: row.current_snapshot_id
        }
    })
}

/**
 * Save a new branch
 */
export async function saveBranch(branch) {
    db.run(`
        INSERT OR REPLACE INTO branches (name, is_current, current_snapshot_id) 
        VALUES (?, ?, ?)
    `, [branch.name, branch.current ? 1 : 0, branch.currentSnapshotId || null])
    persist()
}

/**
 * Switch to a branch
 */
export async function switchBranch(branchName) {
    db.run('UPDATE branches SET is_current = 0')
    db.run('UPDATE branches SET is_current = 1 WHERE name = ?', [branchName])
    persist()
}

/**
 * Get all commits for a branch
 */
export async function getCommits(branchName = null) {
    let res
    if (branchName) {
        res = db.exec('SELECT * FROM commits WHERE branch_name = ? ORDER BY created_at DESC', [branchName])
    } else {
        res = db.exec('SELECT * FROM commits ORDER BY created_at DESC')
    }

    if (res.length === 0) return []

    const { columns, values } = res[0]
    return values.map(v => {
        const row = {}
        columns.forEach((col, i) => row[col] = v[i])
        return mapCommitFromDb(row)
    })
}

/**
 * Save a new commit
 */
export async function saveCommit(commit) {
    db.run(`
        INSERT OR REPLACE INTO commits 
        (id, version, message, author, branch_name, snapshot_id, status, changes_added, changes_modified, changes_deleted, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        commit.id,
        commit.version,
        commit.message,
        commit.author,
        commit.branchName,
        commit.snapshotId || null,
        commit.status,
        commit.changes?.added || 0,
        commit.changes?.modified || 0,
        commit.changes?.deleted || 0,
        commit.date
    ])
    persist()
}

/**
 * Update commit status
 */
export async function updateCommitStatus(commitId, status) {
    db.run('UPDATE commits SET status = ? WHERE id = ?', [status, commitId])
    persist()
}

/**
 * Save a snapshot
 */
export async function saveSnapshot(snapshot) {
    db.run(`
        INSERT OR REPLACE INTO snapshots (id, commit_id, data, timestamp)
        VALUES (?, ?, ?, ?)
    `, [
        snapshot.id,
        snapshot.commitId || null,
        JSON.stringify(snapshot.data),
        snapshot.timestamp
    ])
    persist()
}

/**
 * Get a snapshot by ID
 */
export async function getSnapshot(snapshotId) {
    const res = db.exec('SELECT * FROM snapshots WHERE id = ?', [snapshotId])
    if (res.length === 0) return null

    const { columns, values } = res[0]
    const row = {}
    columns.forEach((col, i) => row[col] = values[0][i])

    let parsedData = {}
    try {
        parsedData = JSON.parse(row.data)
    } catch (error) {
        console.error(`Failed to parse snapshot data for ID ${row.id}:`, error)
    }

    return {
        id: row.id,
        commitId: row.commit_id,
        data: parsedData,
        timestamp: row.timestamp
    }
}

/**
 * Get all snapshots
 */
export async function getAllSnapshots() {
    const res = db.exec('SELECT * FROM snapshots')
    const snapshots = {}

    if (res.length === 0) return snapshots

    const { columns, values } = res[0]
    values.forEach(v => {
        const row = {}
        columns.forEach((col, i) => row[col] = v[i])
        let parsedData = {}
        try {
            parsedData = JSON.parse(row.data)
        } catch (error) {
            console.error(`Failed to parse snapshot data for ID ${row.id}:`, error)
        }

        snapshots[row.id] = {
            id: row.id,
            commitId: row.commit_id,
            data: parsedData,
            timestamp: row.timestamp
        }
    })

    return snapshots
}

/**
 * Update branch's current snapshot
 */
export async function updateBranchSnapshot(branchName, snapshotId) {
    db.run('UPDATE branches SET current_snapshot_id = ? WHERE name = ?', [snapshotId, branchName])
    persist()
}

/**
 * Helper: Map database row to commit object
 */
function mapCommitFromDb(row) {
    return {
        id: row.id,
        version: row.version,
        message: row.message,
        author: row.author,
        branchName: row.branch_name,
        snapshotId: row.snapshot_id,
        status: row.status,
        date: row.created_at,
        changes: {
            added: row.changes_added,
            modified: row.changes_modified,
            deleted: row.changes_deleted
        }
    }
}

/**
 * Close the database connection
 */
export function closeDatabase() {
    if (db) {
        persist()
        db.close()
        db = null
    }
}

export default {
    initDatabase,
    closeDatabase,
    getBranches,
    saveBranch,
    switchBranch,
    getCommits,
    saveCommit,
    updateCommitStatus,
    saveSnapshot,
    getSnapshot,
    getAllSnapshots,
    updateBranchSnapshot
}
