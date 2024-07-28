/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PinDetailsLoading from './loading';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const PinDetails = () => {
    const [pin, setPin] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPinComments, setCurrentPinComments] = useState([]);
    const [isCurrentUserFollowingPin, setIsCurrentUserFollowingPin] = useState(false);
    const [isCurrentUserLikingPin, setIsCurrentUserLikingPin] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [commentEditMode, setCommentEditMode] = useState(null);
    const [editedComment, setEditedComment] = useState('');
    const [commentsCount, setCommentsCount] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinSaved, setIsPinSaved] = useState(false);
    const [showEditbutton, setShowEditbutton] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    const router = useRouter();
    useEffect(() => {
        const fetchPinData = async (idFromUrl) => {
            const response = await fetch(`/api/pins/${idFromUrl}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        };

        const fetchUserData = async (userId) => {
            const response = await fetch(`/api/auth/users/${userId}`);
            if (!response.ok) {
                throw new Error('Error fetching user data');
            }
            return response.json();
        };

        const fetchCurrentUser = async () => {
            const response = await fetch('/api/auth/currentUser');
            if (!response.ok) {
                throw new Error('Error fetching current user');
            }
            return response.json();
        };

        const fetchComments = async (idFromUrl) => {
            const response = await fetch(`/api/comments?pinId=${idFromUrl}`);
            if (!response.ok) {
                throw new Error('Error fetching comments');
            }
            return response.json();
        };

        const fetchSavedPins = async (userId) => {
            const response = await fetch(`/api/save?userId=${userId}`);
            if (!response.ok) {
                throw new Error('Error fetching saved pins');
            }
            return response.json();
        };

        const fetchPin = async () => {
            const url = window.location.href;
            const idFromUrl = url.slice(url.lastIndexOf('/') + 1);

            try {
                const pinData = await fetchPinData(idFromUrl);
                const userData = await fetchUserData(pinData.user);
                const currentUserData = await fetchCurrentUser();
                const currentPinCommentsData = await fetchComments(idFromUrl);
                const savedPinsData = await fetchSavedPins(currentUserData._id);
                setCurrentUserId(currentUserData._id)

                setPin({ ...pinData, user: userData });
                setCurrentUser(currentUserData);
                setCurrentPinComments(currentPinCommentsData.comments);
                setCommentsCount(currentPinCommentsData.comments.length);

                setIsCurrentUserFollowingPin(userData.followers.includes(currentUserData._id));
                setIsCurrentUserLikingPin(pinData.likes.includes(currentUserData._id));
                setIsPinSaved(savedPinsData.pins.some(savedPin => savedPin._id === pinData._id));
            } catch (error) {
                setError("Error fetching pin: " + error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPin();
    }, []);

    const toggleFollow = async () => {
        if (!currentUser || !pin) return;

        const url = isCurrentUserFollowingPin ? '/api/unfollow' : '/api/follow';
        const body = isCurrentUserFollowingPin
            ? { userId: currentUser._id, unfollowId: pin.user._id }
            : { userId: currentUser._id, followId: pin.user._id };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const updatedUser = { ...pin.user };
                if (isCurrentUserFollowingPin) {
                    updatedUser.followers = updatedUser.followers.filter(id => id !== currentUser._id);
                } else {
                    updatedUser.followers.push(currentUser._id);
                }
                setPin({ ...pin, user: updatedUser });
                setIsCurrentUserFollowingPin(!isCurrentUserFollowingPin);
            } else {
                const result = await response.json();
                setError(`Error toggling follow: ${result.error}`);
            }
        } catch (error) {
            setError(`Error toggling follow: ${error.message}`);
        }
    };

    const toggleLike = async () => {
        if (!currentUser || !pin) return;

        const url = '/api/like';
        const method = isCurrentUserLikingPin ? 'DELETE' : 'POST';
        const body = { userId: currentUser._id, pinId: pin._id };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                const updatedLikes = isCurrentUserLikingPin
                    ? pin.likes.filter(id => id !== currentUser._id)
                    : [...pin.likes, currentUser._id];
                setPin({ ...pin, likes: updatedLikes });
                setIsCurrentUserLikingPin(!isCurrentUserLikingPin);
            } else {
                const result = await response.json();
                setError(`Error toggling like: ${result.error}`);
            }
        } catch (error) {
            setError(`Error toggling like: ${error.message}`);
        }
    };

    const handleSaveUnsave = async () => {
        if (!currentUser || !pin) return;

        const url = '/api/save';
        const method = isPinSaved ? 'DELETE' : 'POST';
        const body = { userId: currentUser._id, pinId: pin._id };

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });
            if (response.ok) {
                setIsPinSaved(!isPinSaved);
            } else {
                const result = await response.json();
                setError(`Error saving/un-saving pin: ${result.error}`);
            }
        } catch (error) {
            setError(`Error saving/un-saving pin: ${error.message}`);
        }
    };

    const handleCommentChange = (event) => {
        setNewComment(event.target.value);
    };

    const handleCommentSubmit = async () => {
        if (!newComment || !currentUser || !pin) return;

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: newComment, userId: currentUser._id, pinId: pin._id })
            });

            if (response.ok) {
                const newCommentData = await response.json();
                setCurrentPinComments([...currentPinComments, { ...newCommentData, user: currentUser }]);
                setCommentsCount(prevCount => prevCount + 1);
                setNewComment('');
            } else {
                const result = await response.json();
                setError(`Error adding comment: ${result.error}`);
            }
        } catch (error) {
            setError(`Error adding comment: ${error.message}`);
        }
    };

    const handleCommentEdit = async () => {
        if (!editedComment || !currentUser || !pin || !commentEditMode) return;

        try {
            const response = await fetch(`/api/comments`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ commentId: commentEditMode, text: editedComment })
            });

            if (response.ok) {
                const updatedComment = await response.json();
                setCurrentPinComments(currentPinComments.map(comment =>
                    comment._id === commentEditMode ? { ...updatedComment, user: currentUser } : comment
                ));
                setCommentEditMode(null);
                setEditedComment('');
            } else {
                const result = await response.json();
                setError(`Error editing comment: ${result.error}`);
            }
        } catch (error) {
            setError(`Error editing comment: ${error.message}`);
        }
    };

    const handleCommentDelete = async (commentId) => {
        try {
            const response = await fetch('/api/comments', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ commentId })
            });

            if (response.ok) {
                setCurrentPinComments(currentPinComments.filter(comment => comment._id !== commentId));
                setCommentsCount(prevCount => prevCount - 1);
            } else {
                const result = await response.json();
                setError(`Error deleting comment: ${result.error}`);
            }
        } catch (error) {
            setError(`Error deleting comment: ${error.message}`);
        }
    };

    const formatRelativeTime = (timestamp) => {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
        };

        let counter;

        if (seconds >= intervals.year) {
            counter = Math.floor(seconds / intervals.year);
            return `${counter}y`;
        } else if (seconds >= intervals.month) {
            counter = Math.floor(seconds / intervals.month);
            return `${counter}m`;
        } else if (seconds >= intervals.week) {
            counter = Math.floor(seconds / intervals.week);
            return `${counter}w`;
        } else if (seconds >= intervals.day) {
            counter = Math.floor(seconds / intervals.day);
            return `${counter}d`;
        } else if (seconds >= intervals.hour) {
            counter = Math.floor(seconds / intervals.hour);
            return `${counter}h`;
        } else if (seconds >= intervals.minute) {
            counter = Math.floor(seconds / intervals.minute);
            return `${counter}m`;
        } else {
            return 'just now';
        }
    };

    const handleShare = async (pin) => {
        const shareData = {
            title: pin.title,
            text: pin.title,
            url: `/pin/${pin._id}`,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                alert("Link copied to clipboard");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const handleDownload = (imageURL) => {
        const link = document.createElement("a");
        link.href = imageURL;
        link.download = imageURL.split("/").pop(); // Use the image file name from the URL
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    useEffect(() => {
        if (pin?.user._id === currentUserId) {
            setShowEditbutton(true);
        }
    }, [pin, currentUserId]);

    const handleEditPin = (pin) => {
        router.push(`/editpin/${pin._id}`);
    };


    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const destinationPath = pin?.user._id === currentUser?._id ? '/profile' : `/profile/${pin?.user._id}`;

    if (loading) return <PinDetailsLoading />;
    if (error) return <div>{error}</div>;
    if (!pin) return <div>No pin found</div>;

    return (
        <div className='flex items-end w-screen h-screen'>
            <div className='w-full h-[calc(100vh-72px)] '>
                <div className='flex items-center justify-center w-full h-full '>
                    <div className="container w-full h-full max-w-4xl p-4 mx-auto md:justify-center md:items-center md:flex">
                        <div className="flex flex-col my-10 overflow-hidden bg-white rounded-lg shadow-lg md:flex-row md:space-x-8">
                            <div className="flex flex-col items-center md:w-1/2">
                                <div className="relative w-full max-w-[600px]"> {/* Limit the width of the image container */}
                                    <Image
                                        src={pin.imageURL}
                                        alt={pin.title}
                                        layout="responsive"
                                        width={600} // Change these values to match the aspect ratio of your images
                                        height={800} // Change these values to match the aspect ratio of your images
                                        className="object-cover w-full h-full"
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col justify-between p-6 md:w-1/2">
                                <div>
                                    <div className='flex items-center justify-between w-full mb-6'>
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => handleShare(pin)} className="flex items-center justify-center w-10 h-10 transition duration-300 bg-gray-200 rounded-full shadow hover:bg-gray-300" aria-label="Share Pin">
                                                <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 7.66 8.81 8.84a2 2 0 0 1-2.84-2.82l6-6.02L18 6.01a2 2 0 0 1-2.82 2.83l-1.2-1.19v6.18a2 2 0 0 1-4 0zM19 16a2 2 0 0 1 4 0v6a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-6a2 2 0 0 1 4 0v4h14z" fill="currentColor" />
                                                </svg>
                                            </button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger>
                                                    <button
                                                        className="flex items-center justify-center w-10 h-10 transition duration-300 bg-gray-200 rounded-full shadow hover:bg-gray-300"
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
                                                    <DropdownMenuItem
                                                        onClick={() => handleDownload(pin.imageURL)}
                                                    >
                                                        Download Image
                                                    </DropdownMenuItem>
                                                    {showEditbutton && (
                                                        <DropdownMenuItem onClick={() => handleEditPin(pin)}>
                                                            Edit pin
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={handleSaveUnsave}
                                                className={`px-6 py-3 text-white transition duration-300 shadow rounded-3xl ${isPinSaved ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'}`}
                                            >
                                                {isPinSaved ? 'Saved' : 'Save'}
                                            </button>
                                        </div>
                                    </div>
                                    <h1 className="mb-4 text-3xl font-bold text-gray-800">{pin.title}</h1>
                                    <p className={` text-gray-600 text-sm ${isExpanded ? 'line-clamp-none' : 'line-clamp-2'}`}>{pin.description}</p>
                                    <button
                                        onClick={toggleExpand}
                                        className='mb-5 font-medium text-black hover:underline'
                                    >
                                        {isExpanded ? 'less' : 'more'}
                                    </button>

                                    <div className='flex items-center justify-between mb-5'>
                                        <Link href={destinationPath}>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-10 h-10 overflow-hidden rounded-full'>
                                                    <img src={pin.user.profilePicture} alt="" />
                                                </div>
                                                <div>
                                                    <h1 className='text-sm font-semibold'>{pin.user.username}</h1>
                                                    <h1 className='text-sm'>{pin.user.followers.length} followers</h1>
                                                </div>
                                            </div>
                                        </Link>

                                        {currentUser && pin.user._id !== currentUser._id && (
                                            <div>
                                                <button onClick={toggleFollow} className={`px-3 py-3 border rounded-full ${isCurrentUserFollowingPin ? 'bg-black text-white' : 'bg-transparent border-gray-300 text-gray-600'}`}>
                                                    {isCurrentUserFollowingPin ? 'Unfollow' : 'Follow'}
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <div className='mt-5'>
                                        <h1 className='font-medium'>Comments</h1>
                                        <div className='flex flex-col mt-2 space-y-2 overflow-y-scroll max-h-[150px] scrollbar-hide'>
                                            {currentPinComments.length > 0 ? (
                                                currentPinComments.map((comment) => (
                                                    <div key={comment._id} className='flex flex-col'>
                                                        <div className='flex items-center justify-between'>
                                                            <div className='flex items-center gap-1'>
                                                                <div className='overflow-hidden rounded-full w-7 h-7'>
                                                                    <Image src={comment?.user?.profilePicture} alt="" />
                                                                </div>
                                                                <div className='flex items-center gap-2'>
                                                                    <h1>{comment?.user?.username}</h1>
                                                                    <h1 className='text-sm'> {formatRelativeTime(comment.createdAt)}</h1>
                                                                </div>
                                                            </div>
                                                            {currentUser && comment?.user?._id === currentUser._id && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger>
                                                                        <div>
                                                                            <svg className="w-5 h-5 text-gray-800" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                                <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6M3 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6m18 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6" fill="currentColor" />
                                                                            </svg>
                                                                        </div>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent>
                                                                        <DropdownMenuItem onClick={() => {
                                                                            setCommentEditMode(comment._id);
                                                                            setEditedComment(comment.text);
                                                                        }}>
                                                                            Edit
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuItem onClick={() => handleCommentDelete(comment._id)}>
                                                                            Delete
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </div>
                                                        <div className='ml-8 text-gray-600'>
                                                            {commentEditMode === comment._id ? (
                                                                <div className='flex flex-col p-2 space-y-2 bg-gray-100 rounded-md'>
                                                                    <input
                                                                        value={editedComment}
                                                                        onChange={(e) => setEditedComment(e.target.value)}
                                                                        rows="3"
                                                                        className='px-3 py-2 border border-gray-300 rounded-lg resize-none'
                                                                        placeholder='Edit your comment...'
                                                                    />
                                                                    <div className='flex justify-end gap-2'>
                                                                        <button onClick={handleCommentEdit} className='px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700'>
                                                                            Update
                                                                        </button>
                                                                        <button onClick={() => setCommentEditMode(null)} className='px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700'>
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <p className='text-gray-800'>{comment.text}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p>No comments yet.</p>
                                            )}
                                        </div>

                                    </div>
                                </div>

                                <hr className='mt-5' />
                                <div>
                                    <div className='flex items-center justify-between w-full my-3'>
                                        <h1>{commentsCount} Comments</h1>
                                        <div className='flex items-center gap-2'>
                                            <div className='flex items-center gap-1'>
                                                <Image width={16} height={16} className='w-4 h-4' src="https://s.pinimg.com/webapp/loveStatic-31fc2a99.svg" alt="Like Count" />
                                                <h1>{pin.likes.length}</h1>
                                            </div>
                                            <button
                                                onClick={toggleLike}
                                                className={`px-3 py-3 border rounded-full ${isCurrentUserLikingPin ? 'border-gray-300' : 'bg-transparent border-gray-300 text-gray-600'}`}
                                            >
                                                <Image
                                                    width={24}
                                                    height={24}
                                                    src={isCurrentUserLikingPin ? "https://s.pinimg.com/webapp/loveStatic-31fc2a99.svg" : "https://s.pinimg.com/webapp/reactionHeartOutline-24ab75a6.svg"}
                                                    alt="Like/Unlike"
                                                    className="w-6 h-6" // Adjust size if necessary
                                                />
                                            </button>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-3 mt-2'>
                                        <Link href='/profile' className='flex-shrink-0 w-12 h-12 overflow-hidden bg-red-500 rounded-full'>
                                            <Image width={100} height={100} src={currentUser.profilePicture} alt="" className="object-cover w-full h-full" />
                                        </Link>
                                        <div className='flex items-center w-full p-1 border border-gray-300 rounded-md focus-within:border-blue-500'>
                                            <input
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                type="text"
                                                placeholder="Add a comment..."
                                                className='flex-grow px-4 py-2 outline-none'
                                            />
                                            <button onClick={handleCommentSubmit} className='flex items-center justify-center flex-shrink-0 w-12 h-10 bg-red-600 rounded-full'>
                                                <svg fill='white' aria-hidden="true" aria-label="" className="Hn_ AR6 gUZ U9O kVc" height="18" role="img" viewBox="0 0 24 24" width="18"><path d="m.46 2.43-.03.03c-.4.42-.58 1.06-.28 1.68L3 10.5 16 12 3 13.5.15 19.86c-.3.62-.13 1.26.27 1.67l.05.05c.4.38 1 .56 1.62.3l20.99-8.5q.28-.12.47-.3l.04-.04c.68-.71.51-2-.51-2.42L2.09 2.12Q1.79 2 1.49 2q-.61.01-1.03.43"></path></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PinDetails;
