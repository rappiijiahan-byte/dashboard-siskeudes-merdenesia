import { useState } from 'react'
import { useAppStore, useVersionStore } from '../stores'

function HistoryPage() {
    const { openModal, addNotification } = useAppStore()
    const { commits, branches, selectedCommit, setSelectedCommit, switchBranch, revertToCommit, getCommitsForCurrentBranch, getCurrentBranch } = useVersionStore()
    const [isReverting, setIsReverting] = useState(false)
    const [isSwitching, setIsSwitching] = useState(false)

    // Get commits for current branch
    const currentBranch = getCurrentBranch()
    const branchCommits = getCommitsForCurrentBranch()

    const handleCompare = () => {
        openModal('compare')
    }

    const handleNewBranch = () => {
        openModal('newBranch')
    }

    const handleRevert = async (commit) => {
        if (!commit.snapshotId) {
            addNotification({
                type: 'error',
                message: 'Tidak dapat revert: versi ini belum memiliki snapshot data'
            })
            return
        }

        if (confirm(`Revert ke versi ${commit.version}? Data saat ini akan diganti dengan data dari versi tersebut.`)) {
            setIsReverting(true)
            try {
                const success = await revertToCommit(commit.id)
                if (success) {
                    addNotification({
                        type: 'success',
                        message: `Berhasil revert ke versi ${commit.version}`
                    })
                } else {
                    addNotification({
                        type: 'error',
                        message: 'Gagal melakukan revert'
                    })
                }
            } catch (error) {
                console.error('Revert error:', error)
                addNotification({
                    type: 'error',
                    message: 'Terjadi kesalahan saat revert'
                })
            } finally {
                setIsReverting(false)
            }
        }
    }

    const handleExport = (commit) => {
        openModal('export')
    }

    const handleBranchClick = async (branch) => {
        if (branch.current) return // Already on this branch

        setIsSwitching(true)
        try {
            await switchBranch(branch.name)
            addNotification({
                type: 'success',
                message: `Beralih ke branch "${branch.name}"`
            })
        } catch (error) {
            console.error('Switch branch error:', error)
            addNotification({
                type: 'error',
                message: 'Gagal beralih branch'
            })
        } finally {
            setIsSwitching(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Riwayat Versi</h1>
                    <p className="text-gray-400 mt-1">Commit history dan version control APBDes 2026</p>
                </div>
                <div className="flex gap-3">
                    <button className="btn-ghost" onClick={handleCompare}>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                            Compare
                        </span>
                    </button>
                    <button className="btn-cyber" onClick={handleNewBranch}>
                        <span className="flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            New Branch
                        </span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Branches */}
                <div className="glass-card p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Branches</h3>
                    <div className="space-y-2">
                        {branches.map((branch) => (
                            <button
                                key={branch.name}
                                onClick={() => handleBranchClick(branch)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${branch.current
                                    ? 'bg-cyan-500/10 border border-cyan-500/30'
                                    : 'hover:bg-dark-600/30'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <svg className={`w-5 h-5 ${branch.current ? 'text-cyan-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    <span className={branch.current ? 'text-cyan-400 font-medium' : 'text-gray-300'}>
                                        {branch.name}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{commits.filter(c => c.branchName === branch.name).length} commits</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Commit Timeline */}
                <div className="lg:col-span-2 glass-card p-4">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Commit History</h3>

                    <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-magenta-500 to-dark-600" />

                        <div className="space-y-4">
                            {branchCommits.map((commit, index) => (
                                <div
                                    key={commit.id}
                                    onClick={() => setSelectedCommit(commit)}
                                    className={`relative pl-10 cursor-pointer group`}
                                >
                                    {/* Timeline Dot */}
                                    <div className={`absolute left-2 top-3 w-4 h-4 rounded-full border-2 transition-all ${commit.status === 'current'
                                        ? 'bg-cyan-500 border-cyan-400 shadow-cyan'
                                        : commit.status === 'initial'
                                            ? 'bg-magenta-500 border-magenta-400 shadow-magenta'
                                            : 'bg-dark-500 border-gray-500 group-hover:border-cyan-400'
                                        }`} />

                                    {/* Commit Card */}
                                    <div className={`p-4 rounded-lg transition-all ${selectedCommit?.id === commit.id
                                        ? 'bg-dark-600/50 border border-cyan-500/50'
                                        : 'bg-dark-700/30 hover:bg-dark-600/30'
                                        }`}>
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <span className={`font-mono text-sm font-bold ${commit.status === 'current' ? 'text-cyan-400' : 'text-gray-400'
                                                    }`}>
                                                    v{commit.version}
                                                </span>
                                                {commit.status === 'current' && (
                                                    <span className="ml-2 px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
                                                        HEAD
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-500">{commit.date}</span>
                                        </div>

                                        <p className="text-white font-medium mb-2">{commit.message}</p>

                                        <div className="flex items-center gap-4 text-xs">
                                            <span className="text-gray-500">by {commit.author}</span>
                                            <div className="flex gap-2">
                                                <span className="text-green-400">+{commit.changes.added}</span>
                                                <span className="text-yellow-400">~{commit.changes.modified}</span>
                                                <span className="text-red-400">-{commit.changes.deleted}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Selected Commit Details */}
            {selectedCommit && (
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Detail Commit: v{selectedCommit.version}</h3>
                        <div className="flex gap-2">
                            {selectedCommit.status !== 'current' && (
                                <button
                                    onClick={() => handleRevert(selectedCommit)}
                                    className="btn-ghost text-sm"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    Revert
                                </button>
                            )}
                            <button
                                onClick={() => handleExport(selectedCommit)}
                                className="btn-ghost text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                    <p className="text-gray-400">
                        {selectedCommit.message} - Dibuat oleh {selectedCommit.author} pada {selectedCommit.date}
                    </p>
                    <div className="mt-4 flex gap-4 text-sm">
                        <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-400">
                            +{selectedCommit.changes.added} ditambah
                        </span>
                        <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400">
                            ~{selectedCommit.changes.modified} diubah
                        </span>
                        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400">
                            -{selectedCommit.changes.deleted} dihapus
                        </span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default HistoryPage
