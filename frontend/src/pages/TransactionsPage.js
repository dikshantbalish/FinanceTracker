import React from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseTable from './ExpenseTable';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

function TransactionsPage() {
    const {
        expenses,
        summary,
        isBootstrapping,
        addTransaction,
        deleteExpense
    } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Loading transactions...' />;
    }

    return (
        <>
            <PageIntro
                eyebrow='Transactions'
                title='Track every inflow and outflow with clarity.'
                description='Add new transactions quickly, keep categories tidy, and maintain a clean financial history for better analysis.'
                stats={[
                    { label: 'Income', value: formatCurrency(summary.income || 0), note: 'Total positive cash flow tracked' },
                    { label: 'Expenses', value: formatCurrency(summary.expense || 0), note: 'Total spending tracked so far' },
                    { label: 'Entries', value: expenses.length, note: 'All manual and AI-captured records' }
                ]}
            />

            <section className='feature-grid feature-grid-stack'>
                <ExpenseForm addTransaction={addTransaction} />
                <ExpenseTable expenses={expenses} deleteExpens={deleteExpense} />
            </section>
        </>
    );
}

export default TransactionsPage;
