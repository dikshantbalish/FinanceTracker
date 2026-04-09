import React from 'react';
import DebtPanel from './DebtPanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import DebtInsightsBoard from '../components/DebtInsightsBoard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

function DebtPage() {
    const { debts, summary, isBootstrapping, addDebt, upcomingPayments } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Loading debt workspace...' />;
    }

    const avgInterestRate = debts.length
        ? Math.round(debts.reduce((sum, item) => sum + Number(item.interestRate || 0), 0) / debts.length)
        : 0;

    return (
        <>
            <PageIntro
                eyebrow='Debt Management'
                title='Keep loans, EMIs, and credit pressure visible.'
                description='Track outstanding balance, monthly EMI load, interest rates, due dates, and remaining months so debt stays manageable.'
                stats={[
                    { label: 'Debt balance', value: formatCurrency(summary.debtBalance || 0), note: 'Total outstanding liability' },
                    { label: 'Monthly EMI', value: formatCurrency(summary.monthlyEmi || 0), note: 'Recurring payment commitment' },
                    { label: 'Average interest', value: `${avgInterestRate}%`, note: `${upcomingPayments.length} payment reminder(s)` }
                ]}
            />

            <section className='feature-page-single'>
                <DebtPanel debts={debts} addDebt={addDebt} />
                <DebtInsightsBoard debts={debts} summary={summary} />
            </section>
        </>
    );
}

export default DebtPage;
