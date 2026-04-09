import React from 'react';
import { NavLink } from 'react-router-dom';
import { primaryNavItems } from '../constants/navigation';
import { useFinance } from '../context/FinanceContext';
import { formatCurrency } from '../utils';

function AppHeader() {
    const { currentBalance, logout, pageRefreshing, trackedItems } = useFinance();

    return (
        <header className='app-header' data-reveal='up'>
            <div className='header-brand'>
                <span className='section-tag'>AI Finance</span>
                <div>
                    <h1>Smart Finance Tracker</h1>
                    <p>Modern personal finance workspace</p>
                </div>
            </div>

            <nav className='header-nav'>
                {primaryNavItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `header-link ${isActive ? 'header-link-active' : ''}`}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className='header-actions'>
                <div className='header-status'>
                    <span>{pageRefreshing ? 'Syncing data...' : 'Live net position'}</span>
                    <strong>{formatCurrency(currentBalance)}</strong>
                </div>
                <div className='header-status secondary-status'>
                    <span>Tracked records</span>
                    <strong>{trackedItems}</strong>
                </div>
                <button className='ghost-button' onClick={logout}>Logout</button>
            </div>
        </header>
    );
}

export default AppHeader;
