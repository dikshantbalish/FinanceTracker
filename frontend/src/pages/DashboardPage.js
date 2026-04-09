import React from 'react';
import { NavLink } from 'react-router-dom';
import ExpenseDetails from './ExpenseDetails';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';
import FinanceInsightsPanel from './FinanceInsightsPanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

const quickLinks = [
    { to: '/transactions', title: 'Transactions', description: 'Review every entry and clean up your spending history.' },
    { to: '/capture', title: 'AI Capture', description: 'Log finance data using voice, bills, and receipt emails.' },
    { to: '/investments', title: 'Investments', description: 'Track assets with return assumptions and long-term view.' },
    { to: '/debt', title: 'Debt', description: 'Monitor EMIs, interest rates, and payoff timelines.' },
    { to: '/insights', title: 'Insights', description: 'Turn your data into actions, alerts, and smarter decisions.' },
    { to: '/calculators', title: 'Calculators', description: 'Run EMI, SIP, FD, and retirement scenarios quickly.' }
];

function DashboardPage() {
    const {
        expenses,
        financeData,
        insights,
        insightsLoading,
        isBootstrapping,
        currentBalance,
        savingsRate,
        trackedItems,
        upcomingPayments,
        summary,
        loadInsights,
        addTransaction,
        deleteExpense,
        refreshAll
    } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Building your dashboard...' />;
    }

    return (
        <>
            <PageIntro
                eyebrow='Dashboard'
                title='A professional view of your finances, all in one place.'
                description='See your net position, balance risk, investment momentum, and upcoming obligations in a single production-style overview.'
                action={<button className='ghost-button' onClick={() => refreshAll({ withInsights: true })}>Refresh Dashboard</button>}
                stats={[
                    { label: 'Net position', value: formatCurrency(currentBalance), note: 'Income minus expense activity' },
                    { label: 'Savings rate', value: `${savingsRate}%`, note: 'How much cash flow you are retaining' },
                    { label: 'Tracked records', value: trackedItems, note: 'Transactions, investments, and debts' },
                    { label: 'Payment alerts', value: upcomingPayments.length, note: 'Upcoming dues requiring attention' }
                ]}
            />

            <ExpenseDetails
                incomeAmt={summary.income || 0}
                expenseAmt={summary.expense || 0}
                investmentValue={summary.investmentValue || 0}
                debtBalance={summary.debtBalance || 0}
                monthlyEmi={summary.monthlyEmi || 0}
            />

            <section className='feature-grid'>
                <FinanceInsightsPanel
                    insights={insights}
                    financeData={financeData}
                    refreshInsights={loadInsights}
                    loading={insightsLoading}
                />
                <ExpenseForm addTransaction={addTransaction} />
            </section>

            <section className='feature-grid'>
                <div className='container panel-card quick-links-panel' data-reveal='up' style={{ '--delay': '100ms' }}>
                    <div className='card-top'>
                        <div>
                            <span className='section-tag'>Explore Features</span>
                            <h2 className='panel-title'>One option, one full page</h2>
                        </div>
                        <p className='panel-copy'>Use the header or jump directly into the finance area you want to manage.</p>
                    </div>
                    <div className='quick-links-grid'>
                        {quickLinks.map((item, index) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className='quick-link-card'
                                data-reveal='up'
                                style={{ '--delay': `${120 + (index * 35)}ms` }}
                            >
                                <strong>{item.title}</strong>
                                <span>{item.description}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>

                <ExpenseTable expenses={expenses.slice(0, 6)} deleteExpens={deleteExpense} />
            </section>
        </>
    );
}

export default DashboardPage;
