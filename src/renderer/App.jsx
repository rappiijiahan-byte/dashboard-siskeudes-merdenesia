// Copyright (c) 2026 Wahyu Hidayatulloh. All rights reserved.

import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import KegiatanPage from './pages/KegiatanPage'
import PendapatanPage from './pages/PendapatanPage'
import BelanjaPage from './pages/BelanjaPage'
import Pembiayaan1Page from './pages/Pembiayaan1Page'
import Pembiayaan2Page from './pages/Pembiayaan2Page'
import HistoryPage from './pages/HistoryPage'
import { CommitModal, PendapatanModal, BelanjaModal, ExportModal, NewBranchModal, Notifications, PaketDetailModal, KegiatanFormsModal, PembiayaanModal, BelanjaFormsModal, CompareModal } from './components/Modal'
import { useVersionStore } from './stores'

function App() {
    const { initializeWithSnapshot, isLoaded } = useVersionStore()

    // Initialize version control with snapshot on first load
    useEffect(() => {
        const initVersionControl = async () => {
            try {
                const { createSnapshot } = await import('./services/snapshotService.js')
                const snapshot = createSnapshot()
                initializeWithSnapshot(snapshot)
                console.log('Version control initialized with snapshot')
            } catch (error) {
                console.error('Failed to initialize version control:', error)
            }
        }

        // Only initialize if not already loaded
        if (!isLoaded) {
            initVersionControl()
        }
    }, [initializeWithSnapshot, isLoaded])

    return (
        <>
            <Layout>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/kegiatan" element={<KegiatanPage />} />
                    <Route path="/pendapatan" element={<PendapatanPage />} />
                    <Route path="/belanja" element={<BelanjaPage />} />
                    <Route path="/pembiayaan-1" element={<Pembiayaan1Page />} />
                    <Route path="/pembiayaan-2" element={<Pembiayaan2Page />} />
                    <Route path="/history" element={<HistoryPage />} />
                </Routes>
            </Layout>

            {/* Global Modals */}
            {/* Global Modals */}
            <CommitModal />
            <PendapatanModal />
            <BelanjaModal />
            <ExportModal />
            <NewBranchModal />
            <Notifications />
            <PaketDetailModal />
            <KegiatanFormsModal />
            <PembiayaanModal />
            <BelanjaFormsModal />
            <CompareModal />
        </>
    )
}

export default App

