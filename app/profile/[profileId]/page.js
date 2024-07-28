"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Spinner from '@/components/spinner';
import LazyLoad from 'react-lazyload';
import { useRouter } from 'next/navigation';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [savedPins, setSavedPins] = useState([]);
    const [currentUserSavedPins, setCurrentUserSavedPins] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [idFromUrl, setIdFromUrl] = useState('');
    const [isCurrentUserFollowing, setIsCurrentUserFollowing] = useState(false);
    const [activeTab, setActiveTab] = useState('created');
    const [messageBox, setMessageBox] = useState(false);
    const [message, setMessage] = useState('');
    const [selectedSender, setSelectedSender] = useState(null); // Define selectedSender
    const [messageText, setMessageText] = useState(''); // Define messageText

    const router = useRouter()

    const getRandomHeight = () => `${Math.floor(Math.random() * (400 - 200 + 1)) + 200}px`;
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const url = window.location.href;
            setIdFromUrl(url.slice(url.lastIndexOf('/') + 1));
        }
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`/api/auth/users/${idFromUrl}`);
                if (!response.ok) throw new Error('Failed to fetch user data');
                const userData = await response.json();
                userData.posts = userData.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setUser(userData);

                const currentUserResponse = await fetch('/api/auth/currentUser');
                if (!currentUserResponse.ok) throw new Error('Error fetching current user');
                const currentUserData = await currentUserResponse.json();
                setCurrentUser(currentUserData);

                setIsCurrentUserFollowing(userData.followers.includes(currentUserData._id));
            } catch (error) {
                setError('Error fetching data');
            } finally {
                setLoading(false);
                setSelectedSender(idFromUrl)
            }
        };

        if (idFromUrl) fetchUserData();
    }, [idFromUrl]);

    useEffect(() => {
        const fetchSavedPins = async () => {
            try {
                const response = await fetch(`/api/save?userId=${idFromUrl}`);
                if (!response.ok) throw new Error('Error fetching saved pins');
                const data = await response.json();
                setSavedPins(data.pins);
            } catch (error) {
                setError("Error fetching saved pins: " + error.message);
            }
        };

        if (idFromUrl) fetchSavedPins();
    }, [idFromUrl]);

    useEffect(() => {
        const fetchCurrentUserSavedPins = async () => {
            try {
                const response = await fetch(`/api/save?userId=${currentUser?._id}`);
                if (!response.ok) throw new Error('Error fetching current user\'s saved pins');
                const data = await response.json();
                setCurrentUserSavedPins(data.pins);
            } catch (error) {
                setError("Error fetching current user's saved pins: " + error.message);
            }
        };

        if (currentUser) fetchCurrentUserSavedPins();
    }, [currentUser]);

    const handleSaveUnsave = async (pin) => {
        if (!currentUser) return;

        try {
            const isSaved = currentUserSavedPins.some(savedPin => savedPin._id === pin._id);
            const url = "/api/save";
            const method = isSaved ? "DELETE" : "POST";
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: currentUser._id, pinId: pin._id }),
            });
            if (response.ok) {
                setCurrentUserSavedPins(isSaved
                    ? currentUserSavedPins.filter(savedPin => savedPin._id !== pin._id)
                    : [...currentUserSavedPins, pin]);
            } else {
                const data = await response.json();
                setError(data.error);
            }
        } catch (error) {
            setError("Error saving/un-saving pin: " + error.message);
        }
    };

    const handleTabChange = (tab) => setActiveTab(tab);

    const handleShare = (pin) => {
        if (navigator.share) {
            navigator.share({
                title: pin.title || 'Check out this pin!',
                url: pin.imageURL || '',
            }).catch((error) => console.error('Error sharing:', error));
        } else {
            alert('Share feature is not supported in this browser.');
        }
    };

    const handleDownload = (imageURL) => {
        const link = document.createElement('a');
        link.href = imageURL;
        link.download = imageURL.split('/').pop();
        link.click();
    };

    const toggleFollow = async () => {
        if (!currentUser || !user) return;

        const url = isCurrentUserFollowing ? '/api/unfollow' : '/api/follow';
        const body = isCurrentUserFollowing
            ? { userId: currentUser._id, unfollowId: user._id }
            : { userId: currentUser._id, followId: user._id };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const updatedUser = { ...user };
                updatedUser.followers = isCurrentUserFollowing
                    ? updatedUser.followers.filter(id => id !== currentUser._id)
                    : [...updatedUser.followers, currentUser._id];
                setUser(updatedUser);
                setIsCurrentUserFollowing(!isCurrentUserFollowing);
            } else {
                const result = await response.json();
                setError(`Error toggling follow: ${result.error}`);
            }
        } catch (error) {
            setError(`Error toggling follow: ${error.message}`);
        }
    };

    const handleSendMessage = async () => {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sender: currentUser._id,
                    receiver: user._id,  // Use the correct receiver
                    text: messageText,
                }),
            });
            if (response.ok) {
                setMessageBox(false);
                setMessage('');
                setMessageText('');
                setMessage(`Message sent to ${user.name}`);
            } else {
                const data = await response.json();
                setError(data.error);
            }
        } catch (error) {
            setError("Error sending message: " + error.message);
        }
    };

    const handleEditPin = (pin) => {
        router.push(`/editpin/${pin}`);
    };

    if (loading) return <Spinner />;
    if (error) return <p className='text-red-500'>{error}</p>;

    const displayedPins = activeTab === 'saved' ? savedPins : user?.posts || [];
    return (
        <div className='w-full h-[calc(100vh-80px)] mt-20'>
            <div className='flex flex-col items-center justify-center w-full px-4'>
                <div className='max-w-[670px] max-h-[370px] rounded-2xl relative shadow-lg'>
                    <img
                        className='object-cover w-full h-full rounded-2xl'
                        src={user?.coverPicture || '/default-cover.jpg'}
                        alt="Cover Picture"
                    />
                    <div className='w-[120px] h-[120px] absolute -bottom-14 left-1/2 transform -translate-x-1/2 border-4 border-gray-300 rounded-full shadow-lg '>
                        <img
                            className='object-cover w-full h-full rounded-full'
                            src={user?.profilePicture || '/default-profile.jpg'}
                            alt="Profile Picture"
                        />
                    </div>
                </div>

                <div className='max-w-[670px] text-center'>
                    <h1 className='text-3xl font-bold mt-14'>{user?.name || 'Username'}</h1>
                    <a
                        href={user?.website || '#'}
                        target='_blank'
                        rel="noopener noreferrer"
                        className='flex items-center justify-center gap-1 mt-2 font-medium text-black hover:underline'
                    >
                        <svg aria-label="Claimed website" className="Uvi gUZ" height="16" role="img" viewBox="0 0 24 24" width="16">
                            <path d="m21.3 16.96-4.36 4.35-2.47-2.47a.75.75 0 0 1 1.06-1.07l1.41 1.42 3.3-3.3a.75.75 0 1 1 1.06 1.07M18 12a6 6 0 1 0 0 12 6 6 0 0 0 0-12M7.03 10.75H2.59a9.5 9.5 0 0 1 5.93-7.58 22 22 0 0 0-1.5 7.58m-4.44 2.5h4.44c.11 2.83.61 5.57 1.49 7.58a9.5 9.5 0 0 1-5.93-7.58M12 2.5c.68.06 2.25 3 2.47 8.25H9.53C9.76 5.43 11.4 2.55 12 2.5M10 18l.04-.71a24 24 0 0 1-.51-4.04h2.05a8 8 0 0 1 5.35-3.17 22 22 0 0 0-1.44-6.9 9.5 9.5 0 0 1 5.92 7.57h-.05a8 8 0 0 1 2.6 1.94q.04-.35.04-.69a12.01 12.01 0 1 0-12 12q.35 0 .69-.04A8 8 0 0 1 10 18"></path>
                        </svg>
                        {user?.website || 'Website URL'}
                    </a>
                    <p className='mt-2 line-clamp-2'>{user?.bio || 'User bio goes here.'}</p>
                    <button className='mt-2 font-medium text-black hover:underline'>more</button>
                </div>

                <div className='my-2 text-center'>
                    <h1 className='flex items-center justify-center w-full gap-1 text-gray-600'>
                        <svg aria-label="pinterest" className="BNH gUZ U9O kVc" height="16" role="img" viewBox="0 0 24 24" width="16"><path d="M7.55 23.12c-.15-1.36-.04-2.67.25-3.93L9 14.02a7 7 0 0 1-.34-2.07c0-1.68.8-2.88 2.08-2.88.88 0 1.53.62 1.53 1.8q0 .57-.22 1.28l-.53 1.73q-.15.5-.15.91c0 1.2.92 1.88 2.09 1.88 2.08 0 3.57-2.16 3.57-4.96 0-3.12-2.04-5.11-5.06-5.11-3.36 0-5.49 2.19-5.49 5.23 0 1.23.38 2.37 1.11 3.15-.24.4-.5.48-.88.48-1.2 0-2.34-1.7-2.34-4 0-3.99 3.2-7.16 7.68-7.16 4.7 0 7.66 3.28 7.66 7.33 0 4.07-2.88 7.13-5.98 7.13a3.8 3.8 0 0 1-3.07-1.47l-.61 2.5c-.33 1.28-.83 2.5-1.62 3.67A12 12 0 0 0 24 11.99 12 12 0 1 0 7.55 23.12"></path></svg>
                        {user?.username || 'Username'}
                    </h1>
                    <h1 className='flex items-center justify-center w-full font-medium text-gray-600'>
                        <a href='' className='hover:underline'>{user?.followers.length || 0} followers</a> ·
                        <a href='' className='hover:underline'>{user?.following.length || 0} following</a>
                    </h1>
                </div>

                <div className='flex items-center justify-center gap-2'>
                    <button onClick={() => setMessageBox(true)} className='px-4 py-2 text-white bg-gray-600 rounded-full hover:bg-gray-700'>Message</button>
                    <button
                        onClick={toggleFollow}
                        className='px-4 py-2 text-white bg-gray-600 rounded-full hover:bg-gray-700'>
                        {isCurrentUserFollowing ? 'Unfollow' : 'Follow'}
                    </button>
                </div>

                <div className='flex items-center justify-center gap-10 mt-10 mb-10 font-semibold text-gray-600'>
                    <button
                        className={`focus:underline ${activeTab === 'created' ? 'text-black underline' : ''}`}
                        onClick={() => handleTabChange('created')}
                    >
                        Created
                    </button>
                    <button
                        className={`focus:underline ${activeTab === 'saved' ? 'text-black underline' : ''}`}
                        onClick={() => handleTabChange('saved')}
                    >
                        Saved
                    </button>
                </div>

                <div className='w-full px-4'>
                    {activeTab === 'created' && (
                        <div className='p-4 mt-20 xl:mx-16 md:mx-0'>
                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 5, 1600: 7 }}>
                                <Masonry gutter="16px">
                                    {user?.posts?.map(pin => (
                                        <div key={pin._id}>
                                            <div className="relative overflow-hidden bg-black rounded-lg shadow-md group">
                                                <Link href={`/pin/${pin._id}`}>
                                                    <LazyLoad height={getRandomHeight()} offset={100}>
                                                        <img
                                                            src={pin.imageURL || '/default-pin.jpg'}
                                                            alt="Pin"
                                                            className="object-cover w-full h-auto transition duration-300 ease-in-out group-hover:brightness-50"
                                                        />
                                                    </LazyLoad>
                                                </Link>
                                                <button
                                                    onClick={() => handleSaveUnsave(pin)}
                                                    className={`absolute hidden px-4 py-2 text-lg font-semibold text-white rounded-full top-4 right-4 group-hover:block ${currentUserSavedPins.some((savedPin) => savedPin._id === pin._id)
                                                        ? "bg-gray-700"
                                                        : "bg-red-700"
                                                        }`}
                                                    aria-label="Save Pin"
                                                >
                                                    {currentUserSavedPins.some(savedPin => savedPin._id === pin._id) ? 'Saved' : 'Save'}
                                                </button>
                                                <div className="absolute flex items-center justify-between w-full gap-3 px-4 transition-opacity duration-300 opacity-0 bottom-4 group-hover:opacity-100">
                                                    <a
                                                        href={pin.link}
                                                        className="flex items-center px-2 py-1 space-x-1 text-sm font-semibold text-black bg-white cursor-pointer rounded-2xl"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <svg
                                                            className="flex-shrink-0 w-4 h-4"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M4.93 1a2.36 2.36 0 1 0 0 4.71h10.02L1.7 18.98a2.36 2.36 0 0 0 3.33 3.33L18.3 9.05v10.02a2.36 2.36 0 1 0 4.71 0V1z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                        <span className="line-clamp-1">{pin.title}</span>
                                                    </a>
                                                    <div className='flex gap-2'>
                                                        <button
                                                            onClick={() => handleShare(pin)}
                                                            className="flex items-center justify-center w-8 h-8 bg-white rounded-full"
                                                            aria-label="Share Pin"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-black"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M10 7.66 8.81 8.84a2 2 0 0 1-2.84-2.82l6-6.02L18 6.01a2 2 0 0 1-2.82 2.83l-1.2-1.19v6.18a2 2 0 0 1-4 0zM19 16a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-6a2 2 0 0 1 4 0v4h14z"
                                                                    fill="currentColor"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <button
                                                                    className="flex items-center justify-center w-8 h-8 bg-white rounded-full"
                                                                    aria-label="Comment on Pin"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 text-black"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M3 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6m18 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
                                                                            fill="currentColor"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleDownload(pin.imageURL)}>
                                                                    Download Image
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry>
                        </div>
                    )}
                    {activeTab === 'saved' && (
                        <div className='p-4 mt-20 xl:mx-16 md:mx-0'>
                            <ResponsiveMasonry columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 5, 1600: 7 }}>
                                <Masonry gutter="16px">
                                    {savedPins.map((pin) => (
                                        <div key={pin._id}>
                                            <div className="relative overflow-hidden bg-black rounded-lg shadow-md group">
                                                <Link href={`/pin/${pin._id}`}>
                                                    <LazyLoad height={getRandomHeight()} offset={100}>
                                                        <img
                                                            src={pin.imageURL}
                                                            alt={pin.title}
                                                            className="object-cover w-full h-auto transition duration-300 ease-in-out group-hover:brightness-50 lazy-load"
                                                        />
                                                    </LazyLoad>
                                                </Link>
                                                <button
                                                    onClick={() => handleSaveUnsave(pin)}
                                                    className={`absolute hidden px-4 py-2 text-lg font-semibold text-white rounded-full top-4 right-4 group-hover:block ${currentUserSavedPins.some((savedPin) => savedPin._id === pin._id)
                                                        ? "bg-gray-700"
                                                        : "bg-red-700"
                                                        }`}
                                                    aria-label="Save Pin"
                                                >
                                                    {currentUserSavedPins.some(savedPin => savedPin._id === pin._id) ? 'Saved' : 'Save'}
                                                </button>
                                                <div className="absolute flex items-center justify-between w-full gap-3 px-4 transition-opacity duration-300 opacity-0 bottom-4 group-hover:opacity-100">
                                                    <a
                                                        href={pin.link}
                                                        className="flex items-center px-2 py-1 space-x-1 text-sm font-semibold text-black bg-white cursor-pointer rounded-2xl"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <svg
                                                            className="flex-shrink-0 w-4 h-4"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <path
                                                                d="M4.93 1a2.36 2.36 0 1 0 0 4.71h10.02L1.7 18.98a2.36 2.36 0 0 0 3.33 3.33L18.3 9.05v10.02a2.36 2.36 0 1 0 4.71 0V1z"
                                                                fill="currentColor"
                                                            />
                                                        </svg>
                                                        <span className="line-clamp-1">{pin.title}</span>
                                                    </a>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleShare(pin)}
                                                            className="flex items-center justify-center w-8 h-8 bg-white rounded-full"
                                                            aria-label="Share Pin"
                                                        >
                                                            <svg
                                                                className="w-4 h-4 text-black"
                                                                viewBox="0 0 24 24"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path
                                                                    d="M10 7.66 8.81 8.84a2 2 0 0 1-2.84-2.82l6-6.02L18 6.01a2 2 0 0 1-2.82 2.83l-1.2-1.19v6.18a2 2 0 0 1-4 0zM19 16a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-6a2 2 0 0 1 4 0v4h14z"
                                                                    fill="currentColor"
                                                                />
                                                            </svg>
                                                        </button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger>
                                                                <button
                                                                    className="flex items-center justify-center w-8 h-8 bg-white rounded-full"
                                                                    aria-label="Comment on Pin"
                                                                >
                                                                    <svg
                                                                        className="w-4 h-4 text-black"
                                                                        viewBox="0 0 24 24"
                                                                        fill="none"
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                    >
                                                                        <path
                                                                            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M3 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6m18 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
                                                                            fill="currentColor"
                                                                        />
                                                                    </svg>
                                                                </button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent>
                                                                <DropdownMenuItem onClick={() => handleDownload(pin.imageURL)}>
                                                                    Download Image
                                                                </DropdownMenuItem>
                                                                {pin.user === currentUser._id && (
                                                                    <DropdownMenuItem onClick={() => handleEditPin(pin._id)}>
                                                                        Edit Pin
                                                                    </DropdownMenuItem>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </Masonry>
                            </ResponsiveMasonry>
                        </div>
                    )}
                </div>
            </div>

            {messageBox && (
                <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="relative w-full max-w-md p-8 bg-white rounded shadow-lg">
                        <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">Message Box</h2>
                        <input
                            type="text"
                            placeholder="Enter a message"
                            className="w-full px-3 py-2 mb-4 border rounded"
                            value={messageText} // Use messageText here
                            onChange={(e) => setMessageText(e.target.value)} // Update messageText
                        />
                        <div className="flex justify-between">
                            <button
                                onClick={handleSendMessage}
                                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
                            >
                                Send
                            </button>
                            <button
                                onClick={() => setMessageBox(false)}
                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
