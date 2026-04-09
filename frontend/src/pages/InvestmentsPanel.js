import React, { useState } from 'react';
import { formatCurrency, handleError } from '../utils';

function InvestmentsPanel({ investments, addInvestment }) {
    const [investmentInfo, setInvestmentInfo] = useState({
        name: '',
        type: 'Mutual Fund',
        amountInvested: '',
        currentValue: '',
        expectedRate: '12',
        years: '5',
        monthlyContribution: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInvestmentInfo((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { name, amountInvested, currentValue } = investmentInfo;
        if (!name || !amountInvested || !currentValue) {
            handleError('Please add investment details');
            return;
        }

        const success = await addInvestment(investmentInfo);
        if (success) {
            setInvestmentInfo({
                name: '',
                type: 'Mutual Fund',
                amountInvested: '',
                currentValue: '',
                expectedRate: '12',
                years: '5',
                monthlyContribution: ''
            });
        }
    };

    const getProjectedValue = (currentValue, expectedRate, years) => {
        const base = Number(currentValue || 0);
        const rate = Number(expectedRate || 0);
        const duration = Number(years || 0);
        return base * Math.pow(1 + (rate / 100), duration);
    };

    return (
        <div className='container panel-card' data-reveal='up'>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Investments</span>
                    <h2 className='panel-title'>Portfolio tracking</h2>
                </div>
                <p className='panel-copy'>Monitor funds, stocks, and deposits in one place.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='form-grid'>
                    <div>
                        <label htmlFor='name'>Asset Name</label>
                        <input name='name' value={investmentInfo.name} onChange={handleChange} placeholder='Nifty Index Fund' />
                    </div>
                    <div>
                        <label htmlFor='type'>Asset Type</label>
                        <input name='type' value={investmentInfo.type} onChange={handleChange} placeholder='Mutual Fund / Stock / FD' />
                    </div>
                    <div>
                        <label htmlFor='amountInvested'>Amount Invested</label>
                        <input name='amountInvested' type='number' value={investmentInfo.amountInvested} onChange={handleChange} placeholder='20000' />
                    </div>
                    <div>
                        <label htmlFor='currentValue'>Current Value</label>
                        <input name='currentValue' type='number' value={investmentInfo.currentValue} onChange={handleChange} placeholder='22500' />
                    </div>
                    <div>
                        <label htmlFor='expectedRate'>Expected Return %</label>
                        <input name='expectedRate' type='number' value={investmentInfo.expectedRate} onChange={handleChange} placeholder='12' />
                    </div>
                    <div>
                        <label htmlFor='years'>Investment Horizon (Years)</label>
                        <input name='years' type='number' value={investmentInfo.years} onChange={handleChange} placeholder='5' />
                    </div>
                    <div>
                        <label htmlFor='monthlyContribution'>Monthly Contribution</label>
                        <input name='monthlyContribution' type='number' value={investmentInfo.monthlyContribution} onChange={handleChange} placeholder='5000' />
                    </div>
                </div>
                <button type='submit'>Add Investment</button>
            </form>

            <div className='mini-list'>
                {investments.length === 0 && <p className='empty-state'>No investments added yet.</p>}
                {investments.map((item, index) => (
                    <div className='mini-item' data-reveal='up' style={{ '--delay': `${80 + (Math.min(index, 4) * 40)}ms` }} key={item._id || `${item.name}-${item.createdAt}`}>
                        <strong>{item.name}</strong>
                        <span>{item.type}</span>
                        <span>Invested {formatCurrency(item.amountInvested)}</span>
                        <span>Current {formatCurrency(item.currentValue)}</span>
                        <span>Rate {item.expectedRate || 0}% for {item.years || 0} years</span>
                        <span>Projected {formatCurrency(getProjectedValue(item.currentValue, item.expectedRate, item.years))}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default InvestmentsPanel;
