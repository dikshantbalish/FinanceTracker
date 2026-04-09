import React from 'react';

class AppErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            errorMessage: ''
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            errorMessage: error?.message || 'Something went wrong while loading the finance workspace.'
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Smart Finance Tracker render error', error, errorInfo);
    }

    handleReload = () => {
        window.location.reload();
    };

    handleResetSession = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('loggedInUser');
        window.location.assign('/login');
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className='auth-shell error-shell'>
                    <div className='container panel-card error-card'>
                        <span className='section-tag'>Application Recovery</span>
                        <h1>We hit a loading issue.</h1>
                        <p className='panel-copy error-copy'>
                            {this.state.errorMessage}
                        </p>
                        <p className='helper-text'>
                            The dashboard is protected from silent failures now, so you can reload safely or reset the session and sign in again.
                        </p>
                        <div className='button-row error-actions'>
                            <button type='button' onClick={this.handleReload}>
                                Reload App
                            </button>
                            <button className='ghost-button' type='button' onClick={this.handleResetSession}>
                                Go To Login
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default AppErrorBoundary;
