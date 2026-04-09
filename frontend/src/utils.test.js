import { resolveApiUrl } from './utils';

describe('resolveApiUrl', () => {
    test('uses the configured API URL when provided', () => {
        expect(resolveApiUrl('https://api.example.com/')).toBe('https://api.example.com');
    });

    test('falls back to the local backend during local development', () => {
        expect(
            resolveApiUrl('', {
                hostname: 'localhost',
                origin: 'http://localhost:3000'
            })
        ).toBe('http://localhost:8080');
    });

    test('uses the current origin for deployed builds when no API URL is configured', () => {
        expect(
            resolveApiUrl('', {
                hostname: 'finance-tracker.example.com',
                origin: 'https://finance-tracker.example.com'
            })
        ).toBe('https://finance-tracker.example.com');
    });
});
