// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Database module initialization
let database = null
async function initDatabaseModule() {
    try {
        const dbModule = await import('./database.js')
        database = dbModule.default || dbModule
        if (database) {
            database.initDatabase()
            setupDatabaseHandlers()
        }
    } catch (error) {
        console.warn('Failed to load database module:', error.message)
        console.warn('Version control persistence will be disabled')
    }
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1200,
        minHeight: 700,
        show: false,
        autoHideMenuBar: true,
        frame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#0a0a0f',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    // Load the renderer
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    // Window controls IPC handlers
    ipcMain.on('window:minimize', () => mainWindow.minimize())
    ipcMain.on('window:maximize', () => {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize()
        } else {
            mainWindow.maximize()
        }
    })
    ipcMain.on('window:close', () => mainWindow.close())
    ipcMain.handle('window:isMaximized', () => mainWindow.isMaximized())
}

// Setup database IPC handlers
function setupDatabaseHandlers() {
    // Branches
    ipcMain.handle('db:getBranches', async () => {
        return await database.getBranches()
    })

    ipcMain.handle('db:saveBranch', async (_, branch) => {
        await database.saveBranch(branch)
        return { success: true }
    })

    ipcMain.handle('db:switchBranch', async (_, branchName) => {
        await database.switchBranch(branchName)
        return { success: true }
    })

    ipcMain.handle('db:updateBranchSnapshot', async (_, branchName, snapshotId) => {
        await database.updateBranchSnapshot(branchName, snapshotId)
        return { success: true }
    })

    // Commits
    ipcMain.handle('db:getCommits', async (_, branchName) => {
        return await database.getCommits(branchName)
    })

    ipcMain.handle('db:saveCommit', async (_, commit) => {
        await database.saveCommit(commit)
        return { success: true }
    })

    ipcMain.handle('db:updateCommitStatus', async (_, commitId, status) => {
        await database.updateCommitStatus(commitId, status)
        return { success: true }
    })

    // Snapshots
    ipcMain.handle('db:saveSnapshot', async (_, snapshot) => {
        await database.saveSnapshot(snapshot)
        return { success: true }
    })

    ipcMain.handle('db:getSnapshot', async (_, snapshotId) => {
        return await database.getSnapshot(snapshotId)
    })

    ipcMain.handle('db:getAllSnapshots', async () => {
        return await database.getAllSnapshots()
    })

    // Load all version data at once (for initial load)
    ipcMain.handle('db:loadVersionData', async () => {
        const [branches, commits, snapshots] = await Promise.all([
            database.getBranches(),
            database.getCommits(),
            database.getAllSnapshots()
        ])
        return { branches, commits, snapshots }
    })
}

app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.apbdes.versioncontrol')

    // Initialize database
    await initDatabaseModule()

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (database) {
            try {
                database.closeDatabase()
            } catch (error) {
                console.warn('Database close failed:', error.message)
            }
        }
        app.quit()
    }
})

