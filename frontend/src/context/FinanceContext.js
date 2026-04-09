import React, {
    createContext,
    startTransition,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';
import { useNavigate } from 'react-router-dom';
import { APIUrl, getAuthToken, handleError, handleSuccess } from '../utils';

const FinanceContext = createContext(null);

function FinanceProvider({ children }) {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [debts, setDebts] = useState([]);
    const [financeData, setFinanceData] = useState(null);
    const [insights, setInsights] = useState(null);
    const [forwardingConfig, setForwardingConfig] = useState(null);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [forwardingConfigLoading, setForwardingConfigLoading] = useState(false);
    const [pageRefreshing, setPageRefreshing] = useState(false);

    const navigate = useNavigate();
    const isMountedRef = useRef(true);

    const updateIfMounted = useCallback((updater) => {
        if (isMountedRef.current) {
            updater();
        }
    }, []);

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser') || '');
    }, []);

    useEffect(() => {
        isMountedRef.current = true;

        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const getHeaders = useCallback((withJson = false) => {
        const headers = {
            Authorization: getAuthToken()
        };

        if (withJson) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        setLoggedInUser('');
        handleSuccess('User logged out');
        navigate('/login');
    }, [navigate]);

    const handleUnauthorized = useCallback((status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            setLoggedInUser('');
            navigate('/login');
            return true;
        }
        return false;
    }, [navigate]);

    const loadDashboard = useCallback(async () => {
        try {
            const response = await fetch(`${APIUrl}/finance/dashboard`, {
                headers: getHeaders()
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to load finance dashboard');
                return false;
            }

            const dashboard = result.data;
            updateIfMounted(() => {
                startTransition(() => {
                    setFinanceData(dashboard);
                    setExpenses(dashboard?.expenses || []);
                    setInvestments(dashboard?.investments || []);
                    setDebts(dashboard?.debts || []);
                });
            });
            return true;
        } catch (error) {
            handleError('Unable to load finance dashboard');
            return false;
        }
    }, [getHeaders, handleUnauthorized, updateIfMounted]);

    const loadInsights = useCallback(async () => {
        updateIfMounted(() => {
            setInsightsLoading(true);
        });

        try {
            const response = await fetch(`${APIUrl}/finance/insights`, {
                headers: getHeaders()
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to fetch AI insights');
                return false;
            }

            updateIfMounted(() => {
                startTransition(() => {
                    setInsights(result?.data || null);
                });
            });
            return true;
        } catch (error) {
            handleError('Unable to fetch AI insights');
            return false;
        } finally {
            updateIfMounted(() => {
                setInsightsLoading(false);
            });
        }
    }, [getHeaders, handleUnauthorized, updateIfMounted]);

    const loadForwardingConfig = useCallback(async ({ force = false, showLoading = true } = {}) => {
        if (!force && forwardingConfig) {
            return forwardingConfig;
        }

        if (showLoading) {
            updateIfMounted(() => {
                setForwardingConfigLoading(true);
            });
        }

        try {
            const response = await fetch(`${APIUrl}/finance/inbox/config`, {
                headers: getHeaders()
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to load forwarding inbox');
                return false;
            }

            updateIfMounted(() => {
                startTransition(() => {
                    setForwardingConfig(result?.data || null);
                });
            });
            return result?.data || null;
        } catch (error) {
            handleError('Unable to load forwarding inbox');
            return null;
        } finally {
            if (showLoading) {
                updateIfMounted(() => {
                    setForwardingConfigLoading(false);
                });
            }
        }
    }, [forwardingConfig, getHeaders, handleUnauthorized, updateIfMounted]);

    const refreshAll = useCallback(async ({
        withInsights = true,
        withForwardingConfig = false,
        silent = false
    } = {}) => {
        if (!silent) {
            updateIfMounted(() => {
                setPageRefreshing(true);
            });
        }

        const requests = [loadDashboard()];

        if (withInsights) {
            requests.push(loadInsights());
        }

        if (withForwardingConfig || !forwardingConfig) {
            requests.push(loadForwardingConfig({ showLoading: !silent }));
        }

        const results = await Promise.allSettled(requests);
        const dashboardResult = results[0]?.status === 'fulfilled' ? results[0].value : false;

        if (!silent) {
            updateIfMounted(() => {
                setPageRefreshing(false);
            });
        }

        return dashboardResult;
    }, [
        forwardingConfig,
        loadDashboard,
        loadForwardingConfig,
        loadInsights,
        updateIfMounted
    ]);

    const sendMutation = useCallback(async ({ url, body, successMessage, errorMessage }) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: getHeaders(true),
                body: JSON.stringify(body)
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || errorMessage);
                return false;
            }

            handleSuccess(result?.message || successMessage);
            await refreshAll({ withInsights: true });
            return true;
        } catch (error) {
            handleError(errorMessage);
            return false;
        }
    }, [getHeaders, handleUnauthorized, refreshAll]);

    const addTransaction = useCallback(async (data) => {
        return sendMutation({
            url: `${APIUrl}/expenses`,
            body: data,
            successMessage: 'Transaction saved successfully',
            errorMessage: 'Unable to save transaction'
        });
    }, [sendMutation]);

    const addAiTransaction = useCallback(async (text, source) => {
        return sendMutation({
            url: `${APIUrl}/finance/ai-entry`,
            body: { text, source },
            successMessage: 'Smart entry added successfully',
            errorMessage: 'Unable to process smart entry'
        });
    }, [sendMutation]);

    const scanBill = useCallback(async (imageDataUrl) => {
        return sendMutation({
            url: `${APIUrl}/finance/scan-bill`,
            body: { imageDataUrl },
            successMessage: 'Bill scanned successfully',
            errorMessage: 'Unable to scan bill'
        });
    }, [sendMutation]);

    const addInvestment = useCallback(async (data) => {
        return sendMutation({
            url: `${APIUrl}/finance/investments`,
            body: data,
            successMessage: 'Investment added successfully',
            errorMessage: 'Unable to add investment'
        });
    }, [sendMutation]);

    const addDebt = useCallback(async (data) => {
        return sendMutation({
            url: `${APIUrl}/finance/debts`,
            body: data,
            successMessage: 'Debt added successfully',
            errorMessage: 'Unable to add debt'
        });
    }, [sendMutation]);

    const deleteExpense = useCallback(async (id) => {
        try {
            const response = await fetch(`${APIUrl}/expenses/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to delete transaction');
                return false;
            }

            handleSuccess(result?.message || 'Transaction deleted successfully');
            await refreshAll({ withInsights: true });
            return true;
        } catch (error) {
            handleError('Unable to delete transaction');
            return false;
        }
    }, [getHeaders, handleUnauthorized, refreshAll]);

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            updateIfMounted(() => {
                setIsBootstrapping(true);
            });
            await refreshAll({ withInsights: true, withForwardingConfig: true, silent: true });
            if (mounted) {
                setIsBootstrapping(false);
            }
        };

        bootstrap();

        return () => {
            mounted = false;
        };
    }, [refreshAll, updateIfMounted]);

    const derivedState = useMemo(() => {
        const summary = financeData?.summary || {};
        const upcomingPayments = financeData?.alerts?.upcomingPayments || [];

        return {
            summary,
            currentBalance: summary.balance || 0,
            savingsRate: summary.savingsRate || 0,
            trackedItems: expenses.length + investments.length + debts.length,
            upcomingPayments
        };
    }, [financeData, expenses.length, investments.length, debts.length]);

    const value = useMemo(() => ({
        loggedInUser,
        expenses,
        investments,
        debts,
        financeData,
        insights,
        forwardingConfig,
        isBootstrapping,
        insightsLoading,
        forwardingConfigLoading,
        pageRefreshing,
        ...derivedState,
        logout,
        refreshAll,
        loadInsights,
        loadForwardingConfig,
        addTransaction,
        addAiTransaction,
        scanBill,
        addInvestment,
        addDebt,
        deleteExpense
    }), [
        loggedInUser,
        expenses,
        investments,
        debts,
        financeData,
        insights,
        forwardingConfig,
        isBootstrapping,
        insightsLoading,
        forwardingConfigLoading,
        pageRefreshing,
        derivedState,
        logout,
        refreshAll,
        loadInsights,
        loadForwardingConfig,
        addTransaction,
        addAiTransaction,
        scanBill,
        addInvestment,
        addDebt,
        deleteExpense
    ]);

    return (
        <FinanceContext.Provider value={value}>
            {children}
        </FinanceContext.Provider>
    );
}

function useFinance() {
    const context = useContext(FinanceContext);

    if (!context) {
        throw new Error('useFinance must be used within a FinanceProvider');
    }

    return context;
}

export {
    FinanceProvider,
    useFinance
};
