import React from 'react';
import { NavLink } from 'react-router-dom';
import { primaryNavItems } from '../constants/navigation';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency, getInsightsModelLabel } from '../utils';

const footerBadges = [
    'AI-assisted expense capture',
    'Responsive dark dashboard',
    'Investment and debt planning',
    'Calculator-ready financial scenarios'
];

function AppFooter() {
    const year = new Date().getFullYear();
    const {
        currentBalance,
        trackedItems,
        savingsRate,
        upcomingPayments,
        financeData,
        insights
    } = useFinance();

    const footerMetrics = [
        {
            label: 'Net position',
            value: formatCurrency(currentBalance)
        },
        {
            label: 'Tracked records',
            value: trackedItems
        },
        {
            label: 'Savings rate',
            value: `${savingsRate}%`
        },
        {
            label: 'AI model',
            value: getInsightsModelLabel(insights, financeData)
        }
    ];

    return (
        <footer className='app-footer container panel-card' data-reveal='up'>
            <div className='footer-grid'>
                <div className='footer-brand'>
                    <span className='section-tag'>Smart Finance Tracker</span>
                    <h2 className='panel-title'>A production-ready finance workspace built for clarity.</h2>
                    <p className='panel-copy footer-copy'>
                        Centralize transactions, AI capture, planning, debt monitoring, and investment visibility in one polished financial experience.
                    </p>
                    <div className='footer-badges'>
                        {footerBadges.map((badge) => (
                            <span className='trust-badge' key={badge}>
                                {badge}
                            </span>
                        ))}
                    </div>
                </div>

                <div className='footer-column'>
                    <div className='card-top footer-heading'>
                        <div>
                            <span className='section-tag soft-tag'>Quick Access</span>
                            <h3 className='panel-title'>Navigate faster</h3>
                        </div>
                    </div>
                    <div className='footer-links'>
                        {primaryNavItems.map((item) => (
                            <NavLink key={item.to} to={item.to} className='footer-nav-link'>
                                <strong>{item.label}</strong>
                                <span>{item.description}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>

                <div className='footer-column'>
                    <div className='card-top footer-heading'>
                        <div>
                            <span className='section-tag soft-tag'>Platform Signals</span>
                            <h3 className='panel-title'>Live product context</h3>
                        </div>
                    </div>
                    <div className='footer-status-grid'>
                        {footerMetrics.map((metric) => (
                            <div className='footer-status-card' key={metric.label}>
                                <span>{metric.label}</span>
                                <strong>{metric.value}</strong>
                            </div>
                        ))}
                    </div>
                    <p className='helper-text footer-note'>
                        Upcoming alerts: {upcomingPayments.length}. Keep this workspace connected to your regular spending, debt, and investing flow for the best AI guidance.
                    </p>
                </div>
            </div>

            <div className='footer-legal'>
                <p>© {year} Smart Finance Tracker. Crafted by Dikshant Sharma.</p>
                <p>Secure sessions, scalable feature pages, and a finance-first UX ready for production polish.</p>
            </div>
        </footer>
    );
}

export default AppFooter;
