import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods to renderer
contextBridge.exposeInMainWorld('electronAPI', {
    // Window controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),

    // Database operations (will be implemented)
    db: {
        // Tahun Anggaran
        getTahunList: () => ipcRenderer.invoke('db:tahun:list'),
        createTahun: (tahun) => ipcRenderer.invoke('db:tahun:create', tahun),
        archiveTahun: (tahun) => ipcRenderer.invoke('db:tahun:archive', tahun),

        // Proyek
        getProyek: (tahun) => ipcRenderer.invoke('db:proyek:get', tahun),
        createProyek: (data) => ipcRenderer.invoke('db:proyek:create', data),
        copyProyek: (fromTahun, toTahun) => ipcRenderer.invoke('db:proyek:copy', fromTahun, toTahun),

        // Versi (Commits)
        getVersiList: (proyekId) => ipcRenderer.invoke('db:versi:list', proyekId),
        createVersi: (data) => ipcRenderer.invoke('db:versi:create', data),
        revertToVersi: (versiId) => ipcRenderer.invoke('db:versi:revert', versiId),

        // Pendapatan
        getPendapatan: (versiId) => ipcRenderer.invoke('db:pendapatan:get', versiId),
        savePendapatan: (data) => ipcRenderer.invoke('db:pendapatan:save', data),

        // Belanja
        getBelanja: (versiId) => ipcRenderer.invoke('db:belanja:get', versiId),
        saveBelanja: (data) => ipcRenderer.invoke('db:belanja:save', data),
    },

    // Export operations
    export: {
        toPDF: (data) => ipcRenderer.invoke('export:pdf', data),
        toExcel: (data) => ipcRenderer.invoke('export:excel', data),
    }
})
