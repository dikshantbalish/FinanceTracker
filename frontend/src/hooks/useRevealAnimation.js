import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function useRevealAnimation() {
    const location = useLocation();

    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return undefined;
        }

        const prefersReducedMotion = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const supportsObserver = typeof window.IntersectionObserver === 'function';
        const supportsMutationObserver = typeof window.MutationObserver === 'function';
        const observed = new WeakSet();

        const isInViewport = (element) => {
            const rect = element.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        };

        const revealElement = (element) => {
            element.classList.remove('reveal-ready');
            element.classList.add('reveal-visible');
        };

        const observer = prefersReducedMotion || !supportsObserver ? null : new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    revealElement(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -8% 0px'
        });

        const registerElements = () => {
            const elements = Array.from(document.querySelectorAll('[data-reveal]'));
            elements.forEach((element) => {
                if (observed.has(element)) {
                    return;
                }

                observed.add(element);

                if (prefersReducedMotion || !observer || isInViewport(element)) {
                    revealElement(element);
                    return;
                }

                element.classList.add('reveal-ready');
                observer.observe(element);
            });
        };

        registerElements();

        const mutationObserver = supportsMutationObserver
            ? new MutationObserver(() => {
                registerElements();
            })
            : null;

        if (mutationObserver) {
            mutationObserver.observe(document.body || document.documentElement, {
                childList: true,
                subtree: true
            });
        }

        return () => {
            if (mutationObserver) {
                mutationObserver.disconnect();
            }
            if (observer) {
                observer.disconnect();
            }
        };
    }, [location.pathname]);
}

export default useRevealAnimation;
