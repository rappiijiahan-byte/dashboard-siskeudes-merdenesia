import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("electronAPI", {
  // Window controls
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
  isMaximized: () => ipcRenderer.invoke("window:isMaximized"),
  // Database operations (will be implemented)
  db: {
    // Tahun Anggaran
    getTahunList: () => ipcRenderer.invoke("db:tahun:list"),
    createTahun: (tahun) => ipcRenderer.invoke("db:tahun:create", tahun),
    archiveTahun: (tahun) => ipcRenderer.invoke("db:tahun:archive", tahun),
    // Proyek
    getProyek: (tahun) => ipcRenderer.invoke("db:proyek:get", tahun),
    createProyek: (data) => ipcRenderer.invoke("db:proyek:create", data),
    copyProyek: (fromTahun, toTahun) => ipcRenderer.invoke("db:proyek:copy", fromTahun, toTahun),
    // Versi (Commits)
    getVersiList: (proyekId) => ipcRenderer.invoke("db:versi:list", proyekId),
    createVersi: (data) => ipcRenderer.invoke("db:versi:create", data),
    revertToVersi: (versiId) => ipcRenderer.invoke("db:versi:revert", versiId),
    // Pendapatan
    getPendapatan: (versiId) => ipcRenderer.invoke("db:pendapatan:get", versiId),
    savePendapatan: (data) => ipcRenderer.invoke("db:pendapatan:save", data),
    // Belanja
    getBelanja: (versiId) => ipcRenderer.invoke("db:belanja:get", versiId),
    saveBelanja: (data) => ipcRenderer.invoke("db:belanja:save", data)
  },
  // Version Control - SQLite persistence
  versionControl: {
    // Load all version data at once
    loadVersionData: () => ipcRenderer.invoke("db:loadVersionData"),
    // Branches
    getBranches: () => ipcRenderer.invoke("db:getBranches"),
    saveBranch: (branch) => ipcRenderer.invoke("db:saveBranch", branch),
    switchBranch: (branchName) => ipcRenderer.invoke("db:switchBranch", branchName),
    updateBranchSnapshot: (branchName, snapshotId) => ipcRenderer.invoke("db:updateBranchSnapshot", branchName, snapshotId),
    // Commits
    getCommits: (branchName) => ipcRenderer.invoke("db:getCommits", branchName),
    saveCommit: (commit) => ipcRenderer.invoke("db:saveCommit", commit),
    updateCommitStatus: (commitId, status) => ipcRenderer.invoke("db:updateCommitStatus", commitId, status),
    // Snapshots
    saveSnapshot: (snapshot) => ipcRenderer.invoke("db:saveSnapshot", snapshot),
    getSnapshot: (snapshotId) => ipcRenderer.invoke("db:getSnapshot", snapshotId),
    getAllSnapshots: () => ipcRenderer.invoke("db:getAllSnapshots")
  },
  // Export operations
  export: {
    toPDF: (data) => ipcRenderer.invoke("export:pdf", data),
    toExcel: (data) => ipcRenderer.invoke("export:excel", data)
  }
});
