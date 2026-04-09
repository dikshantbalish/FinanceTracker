import React, { useEffect } from 'react';
import SmartCapturePanel from './SmartCapturePanel';
import LoadingPanel from '../components/LoadingPanel';
import PageIntro from '../components/PageIntro';
import { useFinance } from '../context/FinanceContext';

function CapturePage() {
    const {
        isBootstrapping,
        addAiTransaction,
        scanBill,
        forwardingConfig,
        forwardingConfigLoading,
        loadForwardingConfig
    } = useFinance();

    useEffect(() => {
        if (!forwardingConfig && !forwardingConfigLoading) {
            loadForwardingConfig();
        }
    }, [forwardingConfig, forwardingConfigLoading, loadForwardingConfig]);

    if (isBootstrapping) {
        return <LoadingPanel title='Preparing AI capture...' />;
    }

    return (
        <>
            <PageIntro
                eyebrow='AI Capture'
                title='Let the product do the logging for you.'
                description='Voice, bill scanning, and real-time receipt sync reduce friction so users stay consistent instead of abandoning the app.'
                stats={[
                    { label: 'Voice logging', value: 'NLP', note: 'Turn natural speech into transactions' },
                    { label: 'Bill scan', value: 'OCR + AI', note: 'Read amount, merchant, and category' },
                    {
                        label: 'Mail sync',
                        value: forwardingConfig?.emailAddressEnabled
                            ? 'Inbox live'
                            : forwardingConfig?.publicWebhookReady
                                ? 'Webhook live'
                                : 'Setup needed',
                        note: forwardingConfig?.emailAddressEnabled
                            ? 'Dedicated receipt inbox is configured'
                            : 'Connect Gmail or Outlook to a secure webhook'
                    }
                ]}
            />

            <section className='feature-page-single'>
                <SmartCapturePanel
                    addAiTransaction={addAiTransaction}
                    scanBill={scanBill}
                    forwardingConfig={forwardingConfig}
                    forwardingConfigLoading={forwardingConfigLoading}
                    loadForwardingConfig={loadForwardingConfig}
                />
            </section>
        </>
    );
}

export default CapturePage;
