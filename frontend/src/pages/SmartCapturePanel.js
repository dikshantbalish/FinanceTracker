import React, { useRef, useState } from 'react';
import { handleError } from '../utils';

function SmartCapturePanel({
    addAiTransaction,
    scanBill,
    forwardingConfig,
    forwardingConfigLoading,
    loadForwardingConfig
}) {
    const [voiceText, setVoiceText] = useState('');
    const [billFile, setBillFile] = useState(null);
    const [copiedTarget, setCopiedTarget] = useState('');
    const [loading, setLoading] = useState('');
    const recognitionRef = useRef(null);

    const handleVoiceCapture = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            handleError('Voice recognition is not supported in this browser');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event) => {
            const transcript = event.results?.[0]?.[0]?.transcript || '';
            setVoiceText(transcript);
        };

        recognition.onerror = () => {
            handleError('Unable to capture voice input right now');
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const submitTextEntry = async (text, source, reset) => {
        if (!text.trim()) {
            handleError('Please provide some text to parse');
            return;
        }

        setLoading(source);
        const success = await addAiTransaction(text, source);
        if (success && reset) {
            reset();
        }
        setLoading('');
    };

    const submitBill = async () => {
        const latestForwardingConfig = forwardingConfig?.billScanningEnabled
            ? forwardingConfig
            : await loadForwardingConfig({ force: true, showLoading: false });

        if (!latestForwardingConfig || !latestForwardingConfig.billScanningEnabled) {
            handleError('Bill scanning is not enabled yet. Add OPENAI_API_KEY in backend/.env and restart the backend server.');
            return;
        }

        if (!billFile) {
            handleError('Please choose a bill image first');
            return;
        }

        const reader = new FileReader();
        setLoading('bill');

        reader.onload = async () => {
            const success = await scanBill(reader.result);
            if (success) {
                setBillFile(null);
            }
            setLoading('');
        };

        reader.onerror = () => {
            setLoading('');
            handleError('Unable to read the selected file');
        };

        reader.readAsDataURL(billFile);
    };

    const copyValue = async (value, target, emptyMessage) => {
        if (!value) {
            handleError(emptyMessage);
            return;
        }

        try {
            await navigator.clipboard.writeText(value);
            setCopiedTarget(target);
            setTimeout(() => {
                setCopiedTarget('');
            }, 1800);
        } catch (error) {
            handleError('Unable to copy right now');
        }
    };

    const hasWebhookUrl = Boolean(forwardingConfig?.webhookUrl);
    const hasInboxAddress = Boolean(forwardingConfig?.forwardingAddress);
    const mailStatusLabel = forwardingConfigLoading
        ? 'Checking mail setup...'
        : hasInboxAddress
            ? 'Dedicated inbox ready'
            : forwardingConfig?.publicWebhookReady
                ? 'Realtime webhook ready'
                : 'Public mail setup required';

    return (
        <div className='container panel-card' data-reveal='right' style={{ '--delay': '120ms' }}>
            <div className='card-top'>
                <div>
                    <span className='section-tag'>Smart Capture</span>
                    <h2 className='panel-title'>AI-powered expense entry</h2>
                </div>
                <p className='panel-copy'>Capture bills, emails, and spoken notes without repetitive manual logging.</p>
            </div>

            <div className='capture-grid'>
                <div className='capture-block' data-reveal='up' style={{ '--delay': '40ms' }}>
                    <label>Voice Logging</label>
                    <textarea
                        className='text-input'
                        value={voiceText}
                        onChange={(e) => setVoiceText(e.target.value)}
                        placeholder='Example: I spent 500 rupees on groceries today'
                    />
                    <div className='button-row'>
                        <button type='button' onClick={handleVoiceCapture}>Start Voice Capture</button>
                        <button
                            type='button'
                            onClick={() => submitTextEntry(voiceText, 'voice', () => setVoiceText(''))}
                            disabled={loading === 'voice'}
                        >
                            {loading === 'voice' ? 'Logging...' : 'Log Voice Entry'}
                        </button>
                    </div>
                </div>

                <div className='capture-block' data-reveal='up' style={{ '--delay': '100ms' }}>
                    <label>Real-time Mail Capture</label>
                    <div className='status-row'>
                        <span className={`status-badge ${(hasInboxAddress || forwardingConfig?.publicWebhookReady) ? 'status-badge-live' : ''}`}>
                            {mailStatusLabel}
                        </span>
                    </div>
                    <div className='inbox-address-card'>
                        <span className='helper-text'>Secure webhook URL</span>
                        <strong className='inbox-address'>
                            {forwardingConfigLoading
                                ? 'Preparing your secure mail webhook...'
                                : forwardingConfig?.webhookUrl || 'Add a public backend URL to activate mail sync'}
                        </strong>
                    </div>
                    {hasInboxAddress && (
                        <div className='inbox-address-card'>
                            <span className='helper-text'>Dedicated receipt inbox</span>
                            <strong className='inbox-address'>{forwardingConfig.forwardingAddress}</strong>
                        </div>
                    )}
                    <p className='helper-text'>
                        {hasInboxAddress
                            ? 'Use the dedicated inbox only when you have a real inbound mail route configured. Otherwise connect Gmail or Outlook to the secure webhook below.'
                            : 'Connect Gmail, Outlook, or another mailbox automation to the secure webhook below for real-time receipt capture.'}
                    </p>
                    <div className='button-row'>
                        <button
                            type='button'
                            onClick={() => copyValue(
                                forwardingConfig?.webhookUrl,
                                'webhook',
                                'Secure webhook URL is not ready yet'
                            )}
                            disabled={!hasWebhookUrl}
                        >
                            {copiedTarget === 'webhook' ? 'Webhook Copied' : 'Copy Webhook URL'}
                        </button>
                        {hasInboxAddress && (
                            <button
                                className='ghost-button'
                                type='button'
                                onClick={() => copyValue(
                                    forwardingConfig?.forwardingAddress,
                                    'inbox',
                                    'Dedicated inbox is not ready yet'
                                )}
                            >
                                {copiedTarget === 'inbox' ? 'Address Copied' : 'Copy Inbox Address'}
                            </button>
                        )}
                        <button
                            className='ghost-button'
                            type='button'
                            onClick={() => loadForwardingConfig({ force: true })}
                            disabled={forwardingConfigLoading}
                        >
                            {forwardingConfigLoading ? 'Refreshing...' : 'Refresh Mail Setup'}
                        </button>
                    </div>
                    <div className='capture-step-list'>
                        {(forwardingConfig?.instructions || []).map((step, index) => (
                            <div className='capture-step' key={`${step}-${index}`}>
                                <strong>Step {index + 1}</strong>
                                <span>{step}</span>
                            </div>
                        ))}
                    </div>
                    {!forwardingConfig?.publicWebhookReady && (
                        <p className='helper-text'>
                            Real-time mail sync needs a public HTTPS backend URL. Set `FINANCE_INBOX_PUBLIC_BASE_URL` after deployment or when using a tunnel.
                        </p>
                    )}
                    {forwardingConfig?.automationProviders?.length > 0 && (
                        <p className='helper-text'>
                            Easy connectors: {forwardingConfig.automationProviders.join(', ')}.
                        </p>
                    )}
                    {forwardingConfig?.supportedSenders?.length > 0 && (
                        <p className='helper-text'>
                            Works well with receipts from {forwardingConfig.supportedSenders.join(', ')}.
                        </p>
                    )}
                </div>

                <div className='capture-block' data-reveal='up' style={{ '--delay': '160ms' }}>
                    <label>AI Bill Scanning</label>
                    <input
                        type='file'
                        accept='image/*'
                        onChange={(e) => setBillFile(e.target.files?.[0] || null)}
                    />
                    <p className='helper-text'>
                        Upload a receipt image to extract merchant, amount, and category automatically.
                    </p>
                    <div className='status-row'>
                        <span className={`status-badge ${forwardingConfig?.billScanningEnabled ? 'status-badge-live' : ''}`}>
                            {forwardingConfig?.billScanningEnabled
                                ? 'Bill scanning ready'
                                : 'Vision setup required'}
                        </span>
                    </div>
                    {!forwardingConfig?.billScanningEnabled && (
                        <p className='helper-text'>
                            Add `OPENAI_API_KEY` in the backend environment, restart the backend server, then try bill scanning again.
                        </p>
                    )}
                    <button
                        type='button'
                        onClick={submitBill}
                        disabled={loading === 'bill' || !forwardingConfig?.billScanningEnabled}
                    >
                        {loading === 'bill'
                            ? 'Scanning...'
                            : forwardingConfig?.billScanningEnabled
                                ? 'Scan Bill'
                                : 'Bill Scan Unavailable'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SmartCapturePanel;
