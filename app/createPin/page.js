/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const CreatePin = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [imageURL, setImageURL] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const router = useRouter();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        try {
            const response = await fetch('/api/pins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, description, imageURL, link }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            setSuccess('Pin created successfully');
            setTitle('');
            setDescription('');
            setImageURL('');
            setLink('');

            // Delay redirect by 3 seconds
            setTimeout(() => {
                router.push(`/pin/${result.pin._id}`);
            }, 1000);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container max-w-4xl p-4 mx-auto mt-20">
            <h1 className="mb-6 text-3xl font-extrabold text-center text-gray-800">Create a New Pin</h1>
            <div className="flex flex-col-reverse md:flex-row">
                <div className="md:w-1/2">
                    {imageURL && (
                        <div className="mt-2">
                            <img
                                src={imageURL}
                                alt="Preview"
                                className="h-auto max-w-full border border-gray-300 rounded-md"
                            />
                        </div>
                    )}
                </div>
                <div className="md:w-1/2 md:pl-8">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
                        {error && <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded">{error}</div>}
                        {success && <div className="p-4 mb-4 text-green-800 bg-green-100 border border-green-200 rounded">{success}</div>}
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="imageURL" className="block text-sm font-medium text-gray-700">
                                Image URL
                            </label>
                            <input
                                type="text"
                                id="imageURL"
                                value={imageURL}
                                onChange={(e) => setImageURL(e.target.value)}
                                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                                Link
                            </label>
                            <input
                                type="url"
                                id="link"
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                disabled={loading}
                            >
                                {loading ? 'Creating...' : 'Create Pin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePin;
