import { Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ContentList = lazy(() => import('./pages/admin/ContentList'));
const ContentEditor = lazy(() => import('./pages/admin/ContentEditor'));
const DataImport = lazy(() => import('./pages/admin/DataImport'));
const Settings = lazy(() => import('./pages/admin/Settings'));
const DashboardHome = lazy(() => import('./pages/admin/DashboardHome'));
const AdminLayout = lazy(() => import('./components/layouts/AdminLayout'));

const LoadingFallback = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000', color: '#03c76c' }}>
        Loading...
    </div>
);

function App() {
    return (
        <div className="App">
            <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* Protected Admin Routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route index element={<DashboardHome />} />

                            {/* Content Management */}
                            <Route path="content" element={<ContentList />} />
                            <Route path="content/add" element={<ContentEditor />} />
                            <Route path="content/edit/:id" element={<ContentEditor />} />
                            <Route path="import" element={<DataImport />} />

                            {/* Settings */}
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Suspense>
        </div>
    )
}


export default App
