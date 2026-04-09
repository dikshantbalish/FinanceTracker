import React from 'react';

function PageIntro({ eyebrow, title, description, stats = [], action = null }) {
    return (
        <section className='feature-hero' data-reveal='up'>
            <div className='feature-hero-copy'>
                <span className='section-tag'>{eyebrow}</span>
                <h2>{title}</h2>
                <p>{description}</p>
            </div>

            <div className='feature-hero-side'>
                {action && (
                    <div className='feature-hero-action'>
                        {action}
                    </div>
                )}

                {!!stats.length && (
                    <div className='feature-stat-grid'>
                        {stats.map((item, index) => (
                            <div
                                className='feature-stat-card'
                                key={`${item.label}-${index}`}
                                data-reveal='up'
                                style={{ '--delay': `${50 + (index * 50)}ms` }}
                            >
                                <span>{item.label}</span>
                                <strong>{item.value}</strong>
                                {item.note && <small>{item.note}</small>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default PageIntro;
