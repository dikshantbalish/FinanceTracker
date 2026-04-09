import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { APIUrl, formatCurrency, getAuthToken, getInsightsModelLabel, handleError, handleSuccess } from '../utils';
import { ToastContainer } from 'react-toastify';
import ExpenseTable from './ExpenseTable';
import ExpenseDetails from './ExpenseDetails';
import ExpenseForm from './ExpenseForm';
import SmartCapturePanel from './SmartCapturePanel';
import InvestmentsPanel from './InvestmentsPanel';
import DebtPanel from './DebtPanel';
import FinanceInsightsPanel from './FinanceInsightsPanel';
import CalculatorsPanel from './CalculatorsPanel';
import useRevealAnimation from '../hooks/useRevealAnimation';

function Home() {
    const [loggedInUser, setLoggedInUser] = useState('');
    const [expenses, setExpenses] = useState([]);
    const [investments, setInvestments] = useState([]);
    const [debts, setDebts] = useState([]);
    const [financeData, setFinanceData] = useState(null);
    const [insights, setInsights] = useState(null);
    const [incomeAmt, setIncomeAmt] = useState(0);
    const [expenseAmt, setExpenseAmt] = useState(0);
    const [investmentValue, setInvestmentValue] = useState(0);
    const [debtBalance, setDebtBalance] = useState(0);
    const [monthlyEmi, setMonthlyEmi] = useState(0);
    const [insightsLoading, setInsightsLoading] = useState(false);

    const navigate = useNavigate();
    useRevealAnimation();

    useEffect(() => {
        setLoggedInUser(localStorage.getItem('loggedInUser'))
    }, [])

    const getHeaders = (withJson = false) => {
        const headers = {
            'Authorization': getAuthToken()
        };

        if (withJson) {
            headers['Content-Type'] = 'application/json';
        }

        return headers;
    };

    const handleUnauthorized = (status) => {
        if (status === 401 || status === 403) {
            localStorage.removeItem('token');
            localStorage.removeItem('loggedInUser');
            navigate('/login');
            return true;
        }
        return false;
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        handleSuccess('User Loggedout');
        setTimeout(() => {
            navigate('/login');
        }, 1000)
    }

    const loadDashboard = async () => {
        try {
            const url = `${APIUrl}/finance/dashboard`;
            const response = await fetch(url, {
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
            const dashboard = result?.data;
            setFinanceData(dashboard);
            setExpenses(dashboard?.expenses || []);
            setInvestments(dashboard?.investments || []);
            setDebts(dashboard?.debts || []);
            setIncomeAmt(dashboard?.summary?.income || 0);
            setExpenseAmt(dashboard?.summary?.expense || 0);
            setInvestmentValue(dashboard?.summary?.investmentValue || 0);
            setDebtBalance(dashboard?.summary?.debtBalance || 0);
            setMonthlyEmi(dashboard?.summary?.monthlyEmi || 0);
            return true;
        } catch (err) {
            handleError('Unable to load finance dashboard');
            return false;
        }
    };

    const loadInsights = async () => {
        setInsightsLoading(true);
        try {
            const url = `${APIUrl}/finance/insights`;
            const response = await fetch(url, {
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
            setInsights(result?.data || null);
            return true;
        } catch (err) {
            handleError('Unable to fetch AI insights');
            return false;
        } finally {
            setInsightsLoading(false);
        }
    };

    const refreshAll = async ({ withInsights = true } = {}) => {
        const success = await loadDashboard();
        if (success && withInsights) {
            await loadInsights();
        }
    };

    const deleteExpens = async (id) => {
        try {
            const url = `${APIUrl}/expenses/${id}`;
            const response = await fetch(url, {
                headers: getHeaders(),
                method: "DELETE"
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to delete transaction');
                return false;
            }
            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to delete transaction');
            return false;
        }
    }

    const addTransaction = async (data) => {
        try {
            const url = `${APIUrl}/expenses`;
            const response = await fetch(url, {
                headers: getHeaders(true),
                method: "POST",
                body: JSON.stringify(data)
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to save transaction');
                return false;
            }
            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to save transaction');
            return false;
        }
    }

    const addAiTransaction = async (text, source) => {
        try {
            const url = `${APIUrl}/finance/ai-entry`;
            const response = await fetch(url, {
                headers: getHeaders(true),
                method: 'POST',
                body: JSON.stringify({ text, source })
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to parse transaction');
                return false;
            }

            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to process smart entry');
            return false;
        }
    };

    const scanBill = async (imageDataUrl) => {
        try {
            const url = `${APIUrl}/finance/scan-bill`;
            const response = await fetch(url, {
                headers: getHeaders(true),
                method: 'POST',
                body: JSON.stringify({ imageDataUrl })
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to scan bill');
                return false;
            }

            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to scan bill');
            return false;
        }
    };

    const addInvestment = async (data) => {
        try {
            const url = `${APIUrl}/finance/investments`;
            const response = await fetch(url, {
                headers: getHeaders(true),
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to add investment');
                return false;
            }

            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to add investment');
            return false;
        }
    };

    const addDebt = async (data) => {
        try {
            const url = `${APIUrl}/finance/debts`;
            const response = await fetch(url, {
                headers: getHeaders(true),
                method: 'POST',
                body: JSON.stringify(data)
            });

            if (handleUnauthorized(response.status)) {
                return false;
            }

            const result = await response.json();
            if (!result?.success) {
                handleError(result?.message || 'Unable to add debt');
                return false;
            }

            handleSuccess(result?.message);
            await refreshAll({ withInsights: true });
            return true;
        } catch (err) {
            handleError('Unable to add debt');
            return false;
        }
    };

    useEffect(() => {
        refreshAll({ withInsights: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const currentBalance = incomeAmt - expenseAmt;
    const savingsRate = incomeAmt > 0 ? Math.round((currentBalance / incomeAmt) * 100) : 0;
    const upcomingPayments = financeData?.alerts?.upcomingPayments?.length || 0;
    const trackedItems = expenses.length + investments.length + debts.length;

    return (
        <div className='home-shell'>
            <section className='page-hero' data-reveal='up'>
                <div className='hero-copy'>
                    <span className='section-tag'>Smart Finance Tracker</span>
                    <h1>AI-powered money management that feels effortless.</h1>
                    <p>
                        Welcome back{loggedInUser ? `, ${loggedInUser}` : ''}. Track income, capture bills,
                        monitor investments, manage debt, and get practical insights from one modern dashboard.
                    </p>

                    <div className='hero-pills'>
                        <div className='status-pill' data-reveal='up' style={{ '--delay': '60ms' }}>
                            <span>Net monthly position</span>
                            <strong>{formatCurrency(currentBalance)}</strong>
                        </div>
                        <div className='status-pill' data-reveal='up' style={{ '--delay': '120ms' }}>
                            <span>Savings rate</span>
                            <strong>{savingsRate}%</strong>
                        </div>
                        <div className='status-pill' data-reveal='up' style={{ '--delay': '180ms' }}>
                            <span>Tracked records</span>
                            <strong>{trackedItems}</strong>
                        </div>
                    </div>
                </div>

                <div className='hero-side' data-reveal='left' style={{ '--delay': '120ms' }}>
                    <div className='hero-focus'>
                        <span className='section-tag soft-tag'>Today&apos;s focus</span>
                        <h2>
                            {upcomingPayments > 0
                                ? `${upcomingPayments} payment alert${upcomingPayments > 1 ? 's' : ''} need attention`
                                : 'Your dashboard is fully synced'}
                        </h2>
                        <p>
                            {insights?.headline || 'Generate fresh AI guidance to spot overspending, debt pressure, and growth opportunities.'}
                        </p>
                    </div>

                    <div className='hero-actions'>
                        <div className='hero-chip'>
                            Model: {getInsightsModelLabel(insights, financeData)}
                        </div>
                        <button className='ghost-button' onClick={handleLogout}>Logout</button>
                    </div>
                </div>
            </section>

            <ExpenseDetails
                incomeAmt={incomeAmt}
                expenseAmt={expenseAmt}
                investmentValue={investmentValue}
                debtBalance={debtBalance}
                monthlyEmi={monthlyEmi}
            />

            <section className='content-layout'>
                <div className='dashboard-main'>
                    <FinanceInsightsPanel
                        insights={insights}
                        financeData={financeData}
                        refreshInsights={loadInsights}
                        loading={insightsLoading}
                    />

                    <ExpenseTable expenses={expenses} deleteExpens={deleteExpens} />
                    <CalculatorsPanel monthlyExpense={expenseAmt} />
                </div>

                <div className='dashboard-side'>
                    <ExpenseForm addTransaction={addTransaction} />
                    <SmartCapturePanel addAiTransaction={addAiTransaction} scanBill={scanBill} />
                </div>
            </section>

            <section className='section-grid section-grid-lower'>
                <InvestmentsPanel investments={investments} addInvestment={addInvestment} />
                <DebtPanel debts={debts} addDebt={addDebt} />
            </section>
            <ToastContainer />
        </div>
    )
}

export default Home
