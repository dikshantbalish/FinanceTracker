import { toast } from 'react-toastify';

const LOCAL_API_URL = 'http://localhost:8080';
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

export const handleSuccess = (msg) => {
    toast.success(msg, {
        position: 'top-right'
    })
}

export const handleError = (msg) => {
    toast.error(msg, {
        position: 'top-right'
    })
}

export const resolveApiUrl = (
    configuredApiUrl = process.env.REACT_APP_API_URL,
    location = typeof window !== 'undefined' ? window.location : undefined
) => {
    const normalizedConfiguredApiUrl = configuredApiUrl?.trim();

    if (normalizedConfiguredApiUrl) {
        return trimTrailingSlash(normalizedConfiguredApiUrl);
    }

    const hostname = location?.hostname?.toLowerCase();
    const origin = location?.origin;

    if (hostname && origin && !LOCAL_HOSTNAMES.has(hostname)) {
        return trimTrailingSlash(origin);
    }

    return LOCAL_API_URL;
};

export const APIUrl = resolveApiUrl();

export const getRequestErrorMessage = (
    error,
    fallbackMessage = 'Unable to complete the request right now.'
) => {
    const message = error?.message?.trim();

    if (!message) {
        return fallbackMessage;
    }

    if (
        message === 'Load failed'
        || message === 'Failed to fetch'
        || message === 'NetworkError when attempting to fetch resource.'
    ) {
        return 'Unable to reach the server. Please check that the backend is running and the API URL is correct.';
    }

    return message;
};

export const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
}

export const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(Number(value || 0));
}

export const getInsightsModelLabel = (insights, financeData) => {
    if (insights?.source === 'fallback') {
        return 'Built-in fallback';
    }

    return insights?.recommendedModel || financeData?.recommendedModel || 'gpt-5-mini';
}
