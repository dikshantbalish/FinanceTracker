import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APIUrl, getRequestErrorMessage, handleError, handleSuccess } from '../utils';
import useRevealAnimation from '../hooks/useRevealAnimation';

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    useRevealAnimation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((previousState) => ({
            ...previousState,
            [name]: value
        }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError('Email and password are required.');
        }

        setIsSubmitting(true);

        try {
            const url = `${APIUrl}/auth/login`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginInfo)
            });
            const result = await response.json();
            const { success, message, jwtToken, name, error } = result;
            if (success) {
                handleSuccess(message);
                localStorage.setItem('token', jwtToken);
                localStorage.setItem('loggedInUser', name);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 800);
            } else if (error) {
                const details = error?.details?.[0]?.message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(getRequestErrorMessage(err, 'Unable to log in right now.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='auth-shell'>
            <div className='container auth-card' data-reveal='up'>
                <span className='section-tag'>Welcome Back</span>
                <h1>Login</h1>
                <p className='panel-copy auth-copy'>Access your smart finance dashboard and continue tracking everything in one place.</p>
                <form onSubmit={handleLogin}>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            autoComplete='email'
                            placeholder='Enter your email...'
                            value={loginInfo.email}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            autoComplete='current-password'
                            placeholder='Enter your password...'
                            value={loginInfo.password}
                        />
                    </div>
                    <button type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                    <span className='auth-switch'>
                        Don&apos;t have an account?
                        <Link to='/signup'>Signup</Link>
                    </span>
                </form>
            </div>
        </div>
    );
}

export default Login;
