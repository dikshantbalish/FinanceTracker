import React from 'react';
import FinanceInsightsPanel from './FinanceInsightsPanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import { useFinance } from '../context/FinanceContext';
import { getInsightsModelLabel } from '../utils';

function InsightsPage() {
    const {
        financeData,
        insights,
        insightsLoading,
        isBootstrapping,
        loadInsights,
        savingsRate,
        upcomingPayments
    } = useFinance();

    if (isBootstrapping) {
        return <LoadingPanel title='Generating insight workspace...' />;
    }

    return (
        <>
            <PageIntro
                eyebrow='AI Insights'
                title='Actions, alerts, and explanations built from your financial data.'
                description='This page highlights overspending signals, payment risks, and useful financial context so decisions feel proactive instead of reactive.'
                action={<button className='ghost-button' onClick={loadInsights}>Refresh AI Output</button>}
                stats={[
                    { label: 'Current savings rate', value: `${savingsRate}%`, note: 'Useful signal for budget pressure' },
                    { label: 'Upcoming alerts', value: upcomingPayments.length, note: 'Scheduled debt or EMI reminders' },
                    { label: 'Model', value: getInsightsModelLabel(insights, financeData), note: 'Current insight engine in use' }
                ]}
            />

            <section className='feature-page-single'>
                <FinanceInsightsPanel
                    insights={insights}
                    financeData={financeData}
                    refreshInsights={loadInsights}
                    loading={insightsLoading}
                />
            </section>
        </>
    );
}

export default InsightsPage;
