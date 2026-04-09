import React from 'react';

function LoadingPanel({ title = 'Loading your finance workspace...' }) {
    return (
        <div className='container panel-card loading-panel'>
            <div className='loading-shimmer' />
            <h2 className='panel-title'>{title}</h2>
            <p className='panel-copy'>Syncing transactions, insights, investments, and debt modules.</p>
        </div>
    );
}

export default LoadingPanel;
