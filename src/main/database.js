// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

/**
 * SQLite Database Module for Version Control Persistence
 * This module handles all database operations in the Electron main process
 */

import Database from 'better-sqlite3'
import path from 'path'
import { app } from 'electron'

let db = null

/**
 * Initialize the database connection and create tables
 */
export function initDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'apbdes-versions.db')
    db = new Database(dbPath)

    // Enable foreign keys
    db.pragma('foreign_keys = ON')

    // Create tables
    db.exec(`
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
    const insertBranch = db.prepare(`
        INSERT OR IGNORE INTO branches (name, is_current) VALUES (?, ?)
    `)
    insertBranch.run('main', 1)

    console.log('Database initialized at:', dbPath)
    return db
}

/**
 * Get all branches
 */
export function getBranches() {
    const stmt = db.prepare('SELECT name, is_current, current_snapshot_id FROM branches')
    return stmt.all().map(b => ({
        name: b.name,
        current: b.is_current === 1,
        currentSnapshotId: b.current_snapshot_id
    }))
}

/**
 * Save a new branch
 */
export function saveBranch(branch) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO branches (name, is_current, current_snapshot_id) 
        VALUES (?, ?, ?)
    `)
    stmt.run(branch.name, branch.current ? 1 : 0, branch.currentSnapshotId || null)
}

/**
 * Switch to a branch (update is_current flags)
 */
export function switchBranch(branchName) {
    const updateAll = db.prepare('UPDATE branches SET is_current = 0')
    const updateOne = db.prepare('UPDATE branches SET is_current = 1 WHERE name = ?')

    db.transaction(() => {
        updateAll.run()
        updateOne.run(branchName)
    })()
}

/**
 * Get all commits for a branch
 */
export function getCommits(branchName = null) {
    let stmt
    if (branchName) {
        stmt = db.prepare('SELECT * FROM commits WHERE branch_name = ? ORDER BY created_at DESC')
        return stmt.all(branchName).map(mapCommitFromDb)
    } else {
        stmt = db.prepare('SELECT * FROM commits ORDER BY created_at DESC')
        return stmt.all().map(mapCommitFromDb)
    }
}

/**
 * Save a new commit
 */
export function saveCommit(commit) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO commits 
        (id, version, message, author, branch_name, snapshot_id, status, changes_added, changes_modified, changes_deleted, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
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
    )
}

/**
 * Update commit status
 */
export function updateCommitStatus(commitId, status) {
    const stmt = db.prepare('UPDATE commits SET status = ? WHERE id = ?')
    stmt.run(status, commitId)
}

/**
 * Save a snapshot
 */
export function saveSnapshot(snapshot) {
    const stmt = db.prepare(`
        INSERT OR REPLACE INTO snapshots (id, commit_id, data, timestamp)
        VALUES (?, ?, ?, ?)
    `)
    stmt.run(
        snapshot.id,
        snapshot.commitId || null,
        JSON.stringify(snapshot.data),
        snapshot.timestamp
    )
}

/**
 * Get a snapshot by ID
 */
export function getSnapshot(snapshotId) {
    const stmt = db.prepare('SELECT * FROM snapshots WHERE id = ?')
    const row = stmt.get(snapshotId)
    if (!row) return null

    return {
        id: row.id,
        commitId: row.commit_id,
        data: JSON.parse(row.data),
        timestamp: row.timestamp
    }
}

/**
 * Get all snapshots (as a map for efficiency)
 */
export function getAllSnapshots() {
    const stmt = db.prepare('SELECT * FROM snapshots')
    const rows = stmt.all()
    const snapshots = {}

    for (const row of rows) {
        snapshots[row.id] = {
            id: row.id,
            commitId: row.commit_id,
            data: JSON.parse(row.data),
            timestamp: row.timestamp
        }
    }

    return snapshots
}

/**
 * Update branch's current snapshot
 */
export function updateBranchSnapshot(branchName, snapshotId) {
    const stmt = db.prepare('UPDATE branches SET current_snapshot_id = ? WHERE name = ?')
    stmt.run(snapshotId, branchName)
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
