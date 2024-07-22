"use client"
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

const Login = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                router.push('/profile'); // Replace with the appropriate route
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Invalid email or password.');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="flex flex-col justify-center h-screen py-12 bg-gray-50 sm:px-6 lg:px-8"> {/* Corrected height calculation */}
            <div className="bg-white shadow sm:mx-auto sm:w-full sm:max-w-md rounded-xl">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <img
                        className="w-auto h-12 mx-auto"
                        src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png"
                        alt="Pinterest"
                    />
                    <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                        Log in to Pinterest
                    </h2>
                </div>
                <div className="pt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="px-4 py-8 bg-white sm:rounded-lg sm:px-10">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="text-red-600">
                                    {error}
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Log in
                                </button>
                            </div>
                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account? <a href="/signup" className="font-medium text-red-600 hover:text-red-500">Sign Up</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;