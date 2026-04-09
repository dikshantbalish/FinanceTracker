import React, { useState } from 'react';
import { formatCurrency, handleError } from '../utils';

function DebtPanel({ debts, addDebt }) {
    const [debtInfo, setDebtInfo] = useState({
        title: '',
        type: 'Loan',
        totalAmount: '',
        balance: '',
        interestRate: '10',
        emi: '',
        monthsLeft: '12',
        dueDate: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDebtInfo((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, totalAmount, balance, emi } = debtInfo;
        if (!title || !totalAmount || !balance || !emi) {
            handleError('Please add debt details');
            return;
        }

        const success = await addDebt(debtInfo);
        if (success) {
            setDebtInfo({
                title: '',
                type: 'Loan',
                totalAmount: '',
                balance: '',
                interestRate: '10',
                emi: '',
                monthsLeft: '12',
                dueDate: ''
            });
        }
    };

    return (
        <div className='container panel-card' data-reveal='up' style={{ '--delay': '80ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Loans & Debt</span>
                    <h2 className='panel-title'>Debt monitoring</h2>
                </div>
                <p className='panel-copy'>Track obligations, EMIs, and due dates before they become stress points.</p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className='form-grid'>
                    <div>
                        <label htmlFor='title'>Loan / Card Name</label>
                        <input name='title' value={debtInfo.title} onChange={handleChange} placeholder='Home Loan / Credit Card' />
                    </div>
                    <div>
                        <label htmlFor='type'>Type</label>
                        <input name='type' value={debtInfo.type} onChange={handleChange} placeholder='Loan / EMI / Credit Card' />
                    </div>
                    <div>
                        <label htmlFor='totalAmount'>Total Amount</label>
                        <input name='totalAmount' type='number' value={debtInfo.totalAmount} onChange={handleChange} placeholder='500000' />
                    </div>
                    <div>
                        <label htmlFor='balance'>Outstanding Balance</label>
                        <input name='balance' type='number' value={debtInfo.balance} onChange={handleChange} placeholder='375000' />
                    </div>
                    <div>
                        <label htmlFor='interestRate'>Interest Rate %</label>
                        <input name='interestRate' type='number' value={debtInfo.interestRate} onChange={handleChange} placeholder='10' />
                    </div>
                    <div>
                        <label htmlFor='emi'>Monthly EMI</label>
                        <input name='emi' type='number' value={debtInfo.emi} onChange={handleChange} placeholder='14500' />
                    </div>
                    <div>
                        <label htmlFor='monthsLeft'>Months Left</label>
                        <input name='monthsLeft' type='number' value={debtInfo.monthsLeft} onChange={handleChange} placeholder='12' />
                    </div>
                    <div>
                        <label htmlFor='dueDate'>Next Due Date</label>
                        <input name='dueDate' type='date' value={debtInfo.dueDate} onChange={handleChange} />
                    </div>
                </div>
                <button type='submit'>Add Debt</button>
            </form>

            <div className='mini-list'>
                {debts.length === 0 && <p className='empty-state'>No debts tracked yet.</p>}
                {debts.map((item, index) => (
                    <div className='mini-item' data-reveal='up' style={{ '--delay': `${120 + (Math.min(index, 4) * 40)}ms` }} key={item._id || `${item.title}-${item.createdAt}`}>
                        <strong>{item.title}</strong>
                        <span>{item.type}</span>
                        <span>Balance {formatCurrency(item.balance)}</span>
                        <span>EMI {formatCurrency(item.emi)}</span>
                        <span>Interest {item.interestRate || 0}%</span>
                        <span>{item.monthsLeft || 0} months left</span>
                        {item.dueDate && <span>Due {new Date(item.dueDate).toLocaleDateString()}</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default DebtPanel;
