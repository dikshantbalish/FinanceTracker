import React from 'react';
import { formatCurrency } from '../utils';

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const getDaysUntil = (dateValue) => {
    if (!dateValue) {
        return null;
    }

    const targetDate = new Date(dateValue);
    if (Number.isNaN(targetDate.getTime())) {
        return null;
    }

    const today = new Date();
    const diff = targetDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getDebtPriority = (debt) => {
    const interestRate = Number(debt.interestRate || 0);
    const daysUntil = getDaysUntil(debt.dueDate);

    if (interestRate >= 18 || (daysUntil !== null && daysUntil <= 7)) {
        return 'High';
    }

    if (interestRate >= 10 || (daysUntil !== null && daysUntil <= 14)) {
        return 'Watch';
    }

    return 'Stable';
};

function DebtInsightsBoard({ debts, summary }) {
    const totalBalance = debts.reduce((sum, item) => sum + Number(item.balance || 0), 0);
    const monthlyEmi = debts.reduce((sum, item) => sum + Number(item.emi || 0), 0);
    const dueSoonCount = debts.filter((item) => {
        const daysUntil = getDaysUntil(item.dueDate);
        return daysUntil !== null && daysUntil <= 14;
    }).length;
    const averageMonthsLeft = debts.length
        ? debts.reduce((sum, item) => sum + Number(item.monthsLeft || 0), 0) / debts.length
        : 0;
    const emiPressure = Number(summary.income || 0) > 0
        ? (monthlyEmi / Number(summary.income || 0)) * 100
        : 0;
    const highestInterestDebt = debts.reduce((highest, item) => {
        const rate = Number(item.interestRate || 0);
        if (!highest || rate > highest.rate) {
            return {
                title: item.title,
                rate
            };
        }

        return highest;
    }, null);

    return (
        <section className='container panel-card' data-reveal='up' style={{ '--delay': '140ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Debt Insights</span>
                    <h2 className='panel-title'>Repayment dashboard and obligation table</h2>
                </div>
                <p className='panel-copy'>Understand repayment pressure, due dates, and which balances need the fastest attention.</p>
            </div>

            {debts.length === 0 ? (
                <p className='empty-state'>Add a loan, EMI, or card balance to unlock repayment pressure insights and due-date tracking.</p>
            ) : (
                <>
                    <div className='analysis-grid'>
                        <div className='analysis-card'>
                            <span>Total debt balance</span>
                            <strong>{formatCurrency(totalBalance)}</strong>
                            <small>Outstanding balance across loans, cards, and EMI obligations.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>EMI pressure</span>
                            <strong className={emiPressure > 30 ? 'text-negative' : 'text-positive'}>
                                {formatPercent(emiPressure)}
                            </strong>
                            <small>Share of tracked income currently going toward monthly repayment.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>Due soon</span>
                            <strong>{dueSoonCount}</strong>
                            <small>Payments due within the next 14 days that should stay reserved.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>Highest rate debt</span>
                            <strong>{highestInterestDebt?.title || 'Balanced load'}</strong>
                            <small>{highestInterestDebt ? `${formatPercent(highestInterestDebt.rate)} current rate` : `${Math.round(averageMonthsLeft)} months average runway`}</small>
                        </div>
                    </div>

                    <div className='insight-table'>
                        <div
                            className='insight-table-head'
                            style={{ '--columns': 'minmax(180px, 1.35fr) repeat(5, minmax(90px, 1fr))' }}
                        >
                            <span>Obligation</span>
                            <span>Balance</span>
                            <span>EMI</span>
                            <span>Interest</span>
                            <span>Remaining</span>
                            <span>Priority</span>
                        </div>

                        {debts.map((item) => {
                            const priority = getDebtPriority(item);
                            const priorityClass = priority === 'High'
                                ? 'priority-chip-high'
                                : priority === 'Watch'
                                    ? 'priority-chip-watch'
                                    : 'priority-chip-stable';
                            const daysUntil = getDaysUntil(item.dueDate);

                            return (
                                <div
                                    key={item._id || `${item.title}-${item.createdAt}`}
                                    className='insight-table-row'
                                    style={{ '--columns': 'minmax(180px, 1.35fr) repeat(5, minmax(90px, 1fr))' }}
                                >
                                    <div className='insight-cell insight-primary-cell'>
                                        <small className='mobile-cell-label'>Obligation</small>
                                        <strong>{item.title}</strong>
                                        <span>{item.type}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Balance</small>
                                        <strong>{formatCurrency(item.balance)}</strong>
                                        <span>Total {formatCurrency(item.totalAmount)}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>EMI</small>
                                        <strong>{formatCurrency(item.emi)}</strong>
                                        <span>Monthly obligation</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Interest</small>
                                        <strong>{formatPercent(item.interestRate)}</strong>
                                        <span>{item.dueDate ? `Due ${new Date(item.dueDate).toLocaleDateString()}` : 'No due date set'}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Remaining</small>
                                        <strong>{Number(item.monthsLeft || 0)} months</strong>
                                        <span>{daysUntil !== null ? `${Math.max(daysUntil, 0)} days to next due` : 'Timeline open'}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Priority</small>
                                        <strong className={`priority-chip ${priorityClass}`}>{priority}</strong>
                                        <span>{priority === 'High' ? 'Needs immediate attention' : priority === 'Watch' ? 'Keep in review' : 'Currently manageable'}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </section>
    );
}

export default DebtInsightsBoard;
