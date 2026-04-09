import React from 'react';
import { formatCurrency } from '../utils';

const ExpenseTable = ({ expenses, deleteExpens }) => {

    return (
        <div className="container panel-card" data-reveal='up' style={{ '--delay': '120ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Activity Feed</span>
                    <h2 className='panel-title'>Recent transactions</h2>
                </div>
                <p className='panel-copy'>Every manual or AI-captured entry appears here in one timeline.</p>
            </div>
            <div className="expense-list">
                {expenses.length === 0 && (
                    <p className='empty-state'>No transactions yet. Start with manual, voice, bill, or email capture.</p>
                )}
                {expenses.map((expense, index) => (
                    <div key={index} className="expense-item" data-reveal='up' style={{ '--delay': `${Math.min(index, 5) * 40}ms` }}>
                        <div className='expense-main'>
                            <div className="expense-description">{expense.text}</div>
                            <div className='transaction-meta'>
                                <span>{expense.category || 'General'}</span>
                                <span>{expense.source || 'manual'}</span>
                                <span>{new Date(expense.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        <div className='expense-actions'>
                            <div
                                className={`amount-badge ${expense.amount > 0 ? 'amount-positive' : 'amount-negative'}`}
                            >
                                {formatCurrency(expense.amount)}
                            </div>
                            <button className="delete-button" onClick={() =>
                                deleteExpens(expense._id)}>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpenseTable;
