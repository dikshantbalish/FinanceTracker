import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';
import useRevealAnimation from '../hooks/useRevealAnimation';

function AppShell() {
    const location = useLocation();

    useRevealAnimation();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const prefersReducedMotion = typeof window.matchMedia === 'function'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        window.scrollTo({
            top: 0,
            left: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    }, [location.pathname]);

    return (
        <div className='shell-frame'>
            <AppHeader />
            <main className='page-stack'>
                <Outlet />
            </main>
            <AppFooter />
        </div>
    );
}

export default AppShell;
