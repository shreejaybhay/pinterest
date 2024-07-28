/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

const EditPin = () => {
  const router = useRouter();
  const [pinId, setPinId] = useState(null);
  const [pin, setPin] = useState(null);
  const [pinData, setPinData] = useState({
    title: "",
    description: "",
    imageURL: "",
    link: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const url = window.location.href;
    const id = url.split('/').pop();
    setPinId(id);
  }, []);

  useEffect(() => {
    if (!pinId) return;

    const getPinById = async (pinId) => {
      try {
        const MainURL = process.env.NEXT_PUBLIC_BASEURL || 'http://localhost:3000';
        const res = await fetch(`${MainURL}/api/pins/${pinId}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Failed to fetch pin');
        }
        const pinData = await res.json();
        setPin(pinData);
        setPinData({
          title: pinData.title,
          description: pinData.description,
          imageURL: pinData.imageURL,
          link: pinData.link,
        });
      } catch (error) {
        console.error('Error fetching pin:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    getPinById(pinId);
  }, [pinId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPinData({ ...pinData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/pins/${pin._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pinData),
      });
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const updatedPin = await response.json();
      setPin(updatedPin);
      setErrorMessage(null);
      router.push(`/pin/${pin._id}`); // Redirect to the pin's page after update
    } catch (error) {
      console.error("Error updating pin:", error);
      setErrorMessage("Error updating pin: " + error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className="container max-w-4xl p-4 mx-auto mt-20">
      <h1 className="mb-6 text-3xl font-extrabold text-center text-gray-800">Edit Pin</h1>
      <div className="flex flex-col-reverse md:flex-row">
        <div className="md:w-1/2">
          {pinData.imageURL && (
            <div className="mt-2">
              <img
                src={pinData.imageURL}
                alt="Preview"
                className="h-auto max-w-full border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
        <div className="md:w-1/2 md:pl-8">
          <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-white rounded-lg shadow-md">
            {errorMessage && <div className="p-4 mb-4 text-red-800 bg-red-100 border border-red-200 rounded">{errorMessage}</div>}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={pinData.title}
                onChange={handleInputChange}
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
                name="description"
                value={pinData.description}
                onChange={handleInputChange}
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
                name="imageURL"
                value={pinData.imageURL}
                onChange={handleInputChange}
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="link" className="block text-sm font-medium text-gray-700">
                Link
              </label>
              <input
                type="text"
                id="link"
                name="link"
                value={pinData.link}
                onChange={handleInputChange}
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Pin'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPin;
