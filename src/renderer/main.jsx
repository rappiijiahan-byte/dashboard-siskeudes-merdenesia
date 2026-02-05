import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
// import App from './App' // Converted to lazy
import './styles/index.css'

import ErrorBoundary from './components/ErrorBoundary'

const App = React.lazy(() => import('./App'))

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <HashRouter>
                <Suspense fallback={<div className="text-white p-4">Loading Application...</div>}>
                    <App />
                </Suspense>
            </HashRouter>
        </ErrorBoundary>
    </React.StrictMode>
)
