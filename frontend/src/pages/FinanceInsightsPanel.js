import React from 'react';
import { getInsightsModelLabel } from '../utils';

function FinanceInsightsPanel({ insights, financeData, refreshInsights, loading }) {
    const upcomingPayments = financeData?.alerts?.upcomingPayments || [];

    return (
        <div className='container panel-card insights-surface' data-reveal='up'>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>AI Insights</span>
                    <h2 className='panel-title'>Signals that actually matter</h2>
                </div>
                <button className='ghost-button' type='button' onClick={refreshInsights} disabled={loading}>
                    {loading ? 'Generating...' : 'Refresh'}
                </button>
            </div>

            <div className='insight-hero' data-reveal='up' style={{ '--delay': '60ms' }}>
                <p>{insights?.headline || 'Generate personalized insights from your transactions, investments, and debt.'}</p>
            </div>

            {insights?.notice && (
                <p className='helper-text' data-reveal='up' style={{ '--delay': '90ms' }}>
                    {insights.notice}
                </p>
            )}

            <div className='insight-list'>
                {(insights?.priorities || []).map((item, index) => (
                    <div className='mini-item insight-item' data-reveal='up' style={{ '--delay': `${120 + (index * 50)}ms` }} key={`${item}-${index}`}>
                        <strong>Priority {index + 1}</strong>
                        <span>{item}</span>
                    </div>
                ))}
            </div>

            <div className='mini-list insights-grid'>
                <div className='mini-item' data-reveal='up' style={{ '--delay': '240ms' }}>
                    <strong>Daily Financial Knowledge</strong>
                    <span>{insights?.knowledge || 'Your financial data will generate knowledge snippets here.'}</span>
                </div>
                <div className='mini-item' data-reveal='up' style={{ '--delay': '300ms' }}>
                    <strong>Upcoming Payment Alerts</strong>
                    {upcomingPayments.length === 0 && <span>No upcoming EMI reminders yet.</span>}
                    {upcomingPayments.map((payment, index) => (
                        <span key={`${payment.title}-${index}`}>
                            {payment.title} due on {new Date(payment.dueDate).toLocaleDateString()} for ₹{payment.emi}
                        </span>
                    ))}
                </div>
                <div className='mini-item' data-reveal='up' style={{ '--delay': '360ms' }}>
                    <strong>Model</strong>
                    <span>{getInsightsModelLabel(insights, financeData)}</span>
                </div>
            </div>
        </div>
    );
}

export default FinanceInsightsPanel;
