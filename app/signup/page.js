"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const SignUp = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        age: "",
        profilePicture: "https://flowbite.com/docs/images/examples/image-2@2x.jpg",
        coverPicture: "https://flowbite.com/docs/images/examples/image-1@2x.jpg",
        name: "",
        bio: "",
        website: "",
        followers: [],
        following: [],
        savedPins: [],
        posts: [],
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { username, email, password, age } = formData;
        let validationErrors = {};

        if (!username) validationErrors.username = "Username is required.";
        if (!email) validationErrors.email = "Email is required.";
        if (!password) validationErrors.password = "Password is required.";
        if (!age) validationErrors.age = "Age is required.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            try {
                // Convert date to age
                const ageDate = new Date(age);
                const currentYear = new Date().getFullYear();
                const ageNumber = currentYear - ageDate.getFullYear();

                const formDataWithAge = { ...formData, age: ageNumber };

                const response = await fetch('/api/auth/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formDataWithAge)
                });

                if (!response.ok) {
                    const errorData = await response.json();

                    if (errorData.message.includes("duplicate key error")) {
                        setGeneralError("Username already taken. Please choose another.");
                    } else {
                        throw new Error(errorData.message || 'Something went wrong');
                    }
                } else {
                    router.push('/login');
                }
            } catch (error) {
                setGeneralError(error.message);
            }
        }
    };



    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setErrors({ ...errors, [name]: "" });
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div>
            <div className="flex flex-col justify-center h-[calc(100vh-80px)] py-12 bg-gray-50 sm:px-6 lg:px-8 ">
                <div className="pt-8 bg-white shadow sm:mx-auto sm:w-full sm:max-w-md rounded-xl">
                    <div className="sm:mx-auto sm:w-full sm:max-w-md">
                        <img
                            className="w-auto h-12 mx-auto"
                            src="https://upload.wikimedia.org/wikipedia/commons/0/08/Pinterest-logo.png"
                            alt="Pinterest"
                        />
                        <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                            Sign up to Pinterest
                        </h2>
                    </div>
                    <div className="pt-8 sm:mx-auto sm:w-full sm:max-w-md">
                        <div className="px-4 py-8 bg-white sm:rounded-lg sm:px-10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {generalError && (
                                    <div className="text-red-600">{generalError}</div>
                                )}
                                <div>
                                    <label
                                        htmlFor="username"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Username
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            value={formData.username}
                                            onChange={handleInputChange}
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            required
                                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.username && (
                                            <p className="text-red-600">{errors.username}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Email address
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.email && (
                                            <p className="text-red-600">{errors.email}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="password"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.password && (
                                            <p className="text-red-600">{errors.password}</p>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label
                                        htmlFor="age"
                                        className="block text-sm font-medium text-gray-700"
                                    >
                                        Age
                                    </label>
                                    <div className="mt-1">
                                        <input
                                            value={formData.age}
                                            onChange={handleInputChange}
                                            id="age"
                                            name="age"
                                            type="date"
                                            required
                                            className="block w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        />
                                        {errors.age && <p className="text-red-600">{errors.age}</p>}
                                    </div>
                                </div>
                                <div>
                                    <button
                                        type="submit"
                                        className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Sign up
                                    </button>
                                </div>
                            </form>
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Already have an account?{" "}
                                    <a
                                        href="/login"
                                        className="font-medium text-red-600 hover:text-red-500"
                                    >
                                        Login
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
