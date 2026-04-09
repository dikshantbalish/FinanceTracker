import React from 'react';
import CalculatorsPanel from './CalculatorsPanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

function CalculatorsPage() {
    const { summary, isBootstrapping } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Preparing calculators...' />;
    }

    return (
        <>
            <PageIntro
                eyebrow='Calculators'
                title='Run real-world financial scenarios before making commitments.'
                description='Use amounts, interest rates, months, and years to estimate loan burden, SIP outcomes, fixed-deposit growth, and retirement needs.'
                stats={[
                    { label: 'Current expenses', value: formatCurrency(summary.expense || 0), note: 'Used to inform retirement assumptions' },
                    { label: 'Debt pressure', value: formatCurrency(summary.monthlyEmi || 0), note: 'Useful benchmark for EMI planning' },
                    { label: 'Planning mode', value: 'Monthly + yearly', note: 'Scenarios across time horizons' }
                ]}
            />

            <section className='feature-page-single'>
                <CalculatorsPanel monthlyExpense={summary.expense || 0} />
            </section>
        </>
    );
}

export default CalculatorsPage;
