import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { APIUrl, getRequestErrorMessage, handleError, handleSuccess } from '../utils';
import useRevealAnimation from '../hooks/useRevealAnimation';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate();
    useRevealAnimation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((previousState) => ({
            ...previousState,
            [name]: value
        }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { name, email, password } = signupInfo;
        if (!name || !email || !password) {
            return handleError('Name, email, and password are required.');
        }

        setIsSubmitting(true);

        try {
            const url = `${APIUrl}/auth/signup`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(signupInfo)
            });
            const result = await response.json();
            const { success, message, error } = result;
            if (success) {
                handleSuccess(message);
                setTimeout(() => {
                    navigate('/login');
                }, 800);
            } else if (error) {
                const details = error?.details?.[0]?.message;
                handleError(details);
            } else if (!success) {
                handleError(message);
            }
        } catch (err) {
            handleError(getRequestErrorMessage(err, 'Unable to create your account right now.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='auth-shell'>
            <div className='container auth-card' data-reveal='up'>
                <span className='section-tag'>Get Started</span>
                <h1>Signup</h1>
                <p className='panel-copy auth-copy'>Create your account to unlock AI capture, spending intelligence, and planning tools.</p>
                <form onSubmit={handleSignup}>
                    <div>
                        <label htmlFor='name'>Name</label>
                        <input
                            onChange={handleChange}
                            type='text'
                            name='name'
                            autoFocus
                            autoComplete='name'
                            placeholder='Enter your name...'
                            value={signupInfo.name}
                        />
                    </div>
                    <div>
                        <label htmlFor='email'>Email</label>
                        <input
                            onChange={handleChange}
                            type='email'
                            name='email'
                            autoComplete='email'
                            placeholder='Enter your email...'
                            value={signupInfo.email}
                        />
                    </div>
                    <div>
                        <label htmlFor='password'>Password</label>
                        <input
                            onChange={handleChange}
                            type='password'
                            name='password'
                            autoComplete='new-password'
                            placeholder='Enter your password...'
                            value={signupInfo.password}
                        />
                    </div>
                    <button type='submit' disabled={isSubmitting}>
                        {isSubmitting ? 'Creating account...' : 'Signup'}
                    </button>
                    <span className='auth-switch'>
                        Already have an account?
                        <Link to='/login'>Login</Link>
                    </span>
                </form>
            </div>
        </div>
    );
}

export default Signup;
