import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import KegiatanPage from './pages/KegiatanPage'
import PendapatanPage from './pages/PendapatanPage'
import BelanjaPage from './pages/BelanjaPage'
import Pembiayaan1Page from './pages/Pembiayaan1Page'
import Pembiayaan2Page from './pages/Pembiayaan2Page'
import HistoryPage from './pages/HistoryPage'
import { CommitModal, PendapatanModal, BelanjaModal, ExportModal, NewBranchModal, Notifications } from './components/Modal'

function App() {
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
            <CommitModal />
            <PendapatanModal />
            <BelanjaModal />
            <ExportModal />
            <NewBranchModal />
            <Notifications />
        </>
    )
}

export default App
