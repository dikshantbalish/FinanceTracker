import React from 'react'
import { formatCurrency } from '../utils';

function ExpenseDetails({ incomeAmt, expenseAmt, investmentValue, debtBalance, monthlyEmi }) {
    const balance = incomeAmt - expenseAmt;

    return (
        <section className='summary-band' data-reveal='up' style={{ '--delay': '80ms' }}>
            <div className='summary-intro'>
                <span className='section-tag'>Unified Financial View</span>
                <h2>{formatCurrency(balance)}</h2>
                <p>Available monthly position after income and expense activity.</p>
            </div>

            <div className="amounts-container">
                <article className='metric-card positive-card' data-reveal='up' style={{ '--delay': '40ms' }}>
                    <span className='metric-label'>Income</span>
                    <strong className="income-amount">{formatCurrency(incomeAmt)}</strong>
                    <span className='metric-note'>Current inflow tracked in the app</span>
                </article>
                <article className='metric-card negative-card' data-reveal='up' style={{ '--delay': '80ms' }}>
                    <span className='metric-label'>Expense</span>
                    <strong className="expense-amount">{formatCurrency(expenseAmt)}</strong>
                    <span className='metric-note'>Monthly outflow captured so far</span>
                </article>
                <article className='metric-card positive-card' data-reveal='up' style={{ '--delay': '120ms' }}>
                    <span className='metric-label'>Investments</span>
                    <strong className="income-amount">{formatCurrency(investmentValue)}</strong>
                    <span className='metric-note'>Portfolio value across tracked assets</span>
                </article>
                <article className='metric-card negative-card' data-reveal='up' style={{ '--delay': '160ms' }}>
                    <span className='metric-label'>Debt</span>
                    <strong className="expense-amount">{formatCurrency(debtBalance)}</strong>
                    <span className='metric-note'>Outstanding loans and credit load</span>
                </article>
                <article className='metric-card neutral-card' data-reveal='up' style={{ '--delay': '200ms' }}>
                    <span className='metric-label'>EMI / month</span>
                    <strong className="metric-value">{formatCurrency(monthlyEmi)}</strong>
                    <span className='metric-note'>Recurring debt commitment to watch</span>
                </article>
            </div>
        </section>
    )
}

export default ExpenseDetails
