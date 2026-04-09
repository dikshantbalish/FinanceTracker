import React from 'react';
import InvestmentsPanel from './InvestmentsPanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import InvestmentInsightsBoard from '../components/InvestmentInsightsBoard';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

function InvestmentsPage() {
    const { investments, summary, isBootstrapping, addInvestment } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Loading investment portfolio...' />;
    }

    const avgExpectedRate = investments.length
        ? Math.round(investments.reduce((sum, item) => sum + Number(item.expectedRate || 0), 0) / investments.length)
        : 0;

    return (
        <>
            <PageIntro
                eyebrow='Investments'
                title='Track growth assets with realistic time horizons.'
                description='Monitor invested amount, current value, expected rate, and years-to-go so long-term decisions stay grounded in numbers.'
                stats={[
                    { label: 'Portfolio value', value: formatCurrency(summary.investmentValue || 0), note: 'Current tracked market value' },
                    { label: 'Invested capital', value: formatCurrency(summary.investedAmount || 0), note: 'Total money committed so far' },
                    { label: 'Average return', value: `${avgExpectedRate}%`, note: 'Blended expected annual growth' }
                ]}
            />

            <section className='feature-page-single'>
                <InvestmentsPanel investments={investments} addInvestment={addInvestment} />
                <InvestmentInsightsBoard investments={investments} />
            </section>
        </>
    );
}

export default InvestmentsPage;
