import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { ToastContainer } from 'react-toastify';
import { FinanceProvider } from './context/FinanceContext';
import AppShell from './components/AppShell';
import AppErrorBoundary from './components/AppErrorBoundary';
import LoadingPanel from './components/LoadingPanel';

const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const CapturePage = lazy(() => import('./pages/CapturePage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const InvestmentsPage = lazy(() => import('./pages/InvestmentsPage'));
const DebtPage = lazy(() => import('./pages/DebtPage'));
const CalculatorsPage = lazy(() => import('./pages/CalculatorsPage'));

function RouteLoader() {
    return (
        <div className='shell-frame'>
            <LoadingPanel title='Loading your finance workspace...' />
        </div>
    );
}

function ProtectedLayout() {
    const isAuthenticated = Boolean(localStorage.getItem('token'));

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />;
    }

    return (
        <FinanceProvider>
            <AppShell />
        </FinanceProvider>
    );
}

function PublicRoute({ children }) {
    if (Boolean(localStorage.getItem('token'))) {
        return <Navigate to='/dashboard' replace />;
    }

    return children;
}

function App() {
    const isAuthenticated = Boolean(localStorage.getItem('token'));

    return (
        <div className='App'>
            <AppErrorBoundary>
                <Suspense fallback={<RouteLoader />}>
                    <Routes>
                        <Route
                            path='/'
                            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
                        />
                        <Route
                            path='/login'
                            element={(
                                <PublicRoute>
                                    <Login />
                                </PublicRoute>
                            )}
                        />
                        <Route
                            path='/signup'
                            element={(
                                <PublicRoute>
                                    <Signup />
                                </PublicRoute>
                            )}
                        />
                        <Route element={<ProtectedLayout />}>
                            <Route path='home' element={<Navigate to='/dashboard' replace />} />
                            <Route path='dashboard' element={<DashboardPage />} />
                            <Route path='transactions' element={<TransactionsPage />} />
                            <Route path='capture' element={<CapturePage />} />
                            <Route path='insights' element={<InsightsPage />} />
                            <Route path='investments' element={<InvestmentsPage />} />
                            <Route path='debt' element={<DebtPage />} />
                            <Route path='calculators' element={<CalculatorsPage />} />
                        </Route>
                        <Route
                            path='*'
                            element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
                        />
                    </Routes>
                </Suspense>
            </AppErrorBoundary>
            <ToastContainer theme='dark' position='top-right' />
        </div>
    );
}

export default App;
