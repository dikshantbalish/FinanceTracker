import React from 'react';
import { formatCurrency } from '../utils';

const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

const getProjectedValue = (currentValue, expectedRate, years) => {
    const base = Number(currentValue || 0);
    const rate = Number(expectedRate || 0);
    const duration = Number(years || 0);

    return base * Math.pow(1 + (rate / 100), duration);
};

function InvestmentInsightsBoard({ investments }) {
    const portfolioProjection = investments.reduce((sum, item) => {
        return sum + getProjectedValue(item.currentValue, item.expectedRate, item.years);
    }, 0);

    const unrealizedGain = investments.reduce((sum, item) => {
        return sum + (Number(item.currentValue || 0) - Number(item.amountInvested || 0));
    }, 0);

    const monthlyContribution = investments.reduce((sum, item) => {
        return sum + Number(item.monthlyContribution || 0);
    }, 0);

    const averageHorizon = investments.length
        ? investments.reduce((sum, item) => sum + Number(item.years || 0), 0) / investments.length
        : 0;

    const bestPerformer = investments.reduce((best, item) => {
        const invested = Number(item.amountInvested || 0);
        const current = Number(item.currentValue || 0);
        const returnPercent = invested > 0
            ? ((current - invested) / invested) * 100
            : 0;

        if (!best || returnPercent > best.returnPercent) {
            return {
                name: item.name,
                returnPercent
            };
        }

        return best;
    }, null);

    return (
        <section className='container panel-card' data-reveal='up' style={{ '--delay': '120ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Investment Insights</span>
                    <h2 className='panel-title'>Portfolio dashboard and asset table</h2>
                </div>
                <p className='panel-copy'>See how each asset contributes to growth, monthly commitment, and long-term portfolio direction.</p>
            </div>

            {investments.length === 0 ? (
                <p className='empty-state'>Add an investment to unlock portfolio projections, asset comparison, and performance insights.</p>
            ) : (
                <>
                    <div className='analysis-grid'>
                        <div className='analysis-card'>
                            <span>Projected portfolio</span>
                            <strong>{formatCurrency(portfolioProjection)}</strong>
                            <small>Estimated future value using current value, expected rate, and horizon.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>Unrealized gain</span>
                            <strong className={unrealizedGain >= 0 ? 'text-positive' : 'text-negative'}>
                                {formatCurrency(unrealizedGain)}
                            </strong>
                            <small>Difference between invested capital and current portfolio value.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>Monthly contribution</span>
                            <strong>{formatCurrency(monthlyContribution)}</strong>
                            <small>Total recurring amount committed across all tracked assets.</small>
                        </div>
                        <div className='analysis-card'>
                            <span>Best performer</span>
                            <strong>{bestPerformer?.name || 'Balanced mix'}</strong>
                            <small>{bestPerformer ? `${formatPercent(bestPerformer.returnPercent)} current return` : `${formatPercent(averageHorizon)} average horizon`}</small>
                        </div>
                    </div>

                    <div className='insight-table'>
                        <div
                            className='insight-table-head'
                            style={{ '--columns': 'minmax(180px, 1.4fr) repeat(4, minmax(110px, 1fr))' }}
                        >
                            <span>Asset</span>
                            <span>Capital</span>
                            <span>Current Return</span>
                            <span>Horizon</span>
                            <span>Projection</span>
                        </div>

                        {investments.map((item) => {
                            const invested = Number(item.amountInvested || 0);
                            const current = Number(item.currentValue || 0);
                            const returnPercent = invested > 0
                                ? ((current - invested) / invested) * 100
                                : 0;
                            const projectedValue = getProjectedValue(current, item.expectedRate, item.years);

                            return (
                                <div
                                    key={item._id || `${item.name}-${item.createdAt}`}
                                    className='insight-table-row'
                                    style={{ '--columns': 'minmax(180px, 1.4fr) repeat(4, minmax(110px, 1fr))' }}
                                >
                                    <div className='insight-cell insight-primary-cell'>
                                        <small className='mobile-cell-label'>Asset</small>
                                        <strong>{item.name}</strong>
                                        <span>{item.type}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Capital</small>
                                        <strong>{formatCurrency(invested)}</strong>
                                        <span>Now {formatCurrency(current)}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Current Return</small>
                                        <strong className={returnPercent >= 0 ? 'text-positive' : 'text-negative'}>
                                            {formatPercent(returnPercent)}
                                        </strong>
                                        <span>{current >= invested ? 'Performing ahead' : 'Below invested value'}</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Horizon</small>
                                        <strong>{Number(item.years || 0)} years</strong>
                                        <span>{Number(item.expectedRate || 0)}% expected rate</span>
                                    </div>
                                    <div className='insight-cell'>
                                        <small className='mobile-cell-label'>Projection</small>
                                        <strong>{formatCurrency(projectedValue)}</strong>
                                        <span>Monthly add {formatCurrency(item.monthlyContribution || 0)}</span>
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

export default InvestmentInsightsBoard;
