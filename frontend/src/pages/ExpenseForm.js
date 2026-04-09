import React, { useState } from 'react'
import { handleError } from '../utils';

function ExpenseForm({ addTransaction }) {

    const [expenseInfo, setExpenseInfo] = useState({
        amount: '',
        text: '',
        category: 'General',
        type: 'expense'
    })

    const handleChange = (e) => {
        const { name, value } = e.target;
        const copyExpenseInfo = { ...expenseInfo };
        copyExpenseInfo[name] = value;
        setExpenseInfo(copyExpenseInfo);
    }

    const addExpenses = (e) => {
        e.preventDefault();
        const { amount, text, category, type } = expenseInfo;
        if (!amount || !text) {
            handleError('Please add transaction details');
            return;
        }
        const normalizedAmount = type === 'income'
            ? Math.abs(Number(amount))
            : -Math.abs(Number(amount));

        addTransaction({
            text,
            category,
            amount: normalizedAmount,
            source: 'manual'
        });
        setExpenseInfo({ amount: '', text: '', category: 'General', type: 'expense' })
    }

    return (
        <div className='container panel-card' data-reveal='right'>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Manual Entry</span>
                    <h2 className='panel-title'>Log a transaction quickly</h2>
                </div>
                <p className='panel-copy'>Ideal for cash payments, salary credits, and quick corrections.</p>
            </div>
            <form onSubmit={addExpenses}>
                <div className='form-grid'>
                    <div>
                        <label htmlFor='text'>Detail</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='text'
                            placeholder='Salary, Rent, Groceries...'
                            value={expenseInfo.text}
                        />
                    </div>
                    <div>
                        <label htmlFor='category'>Category</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='category'
                            placeholder='Food, Bills, Transport...'
                            value={expenseInfo.category}
                        />
                    </div>
                    <div>
                        <label htmlFor='type'>Type</label>
                        <select
                            onChange={handleChange}
                            name='type'
                            value={expenseInfo.type}
                        >
                            <option value='expense'>Expense</option>
                            <option value='income'>Income</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor='amount'>Amount</label>
                        <input
                            onChange={handleChange}
                            type='number'
                            name='amount'
                            placeholder='Enter amount...'
                            value={expenseInfo.amount}
                        />
                    </div>
                </div>
                <button type='submit'>Save Transaction</button>
            </form>
        </div>
    )
}

export default ExpenseForm
