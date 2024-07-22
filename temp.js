/* eslint-disable @next/next/no-img-element */
"use client";
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import {
  User,
  CreditCard,
  Settings,
  Keyboard,
  Users,
  UserPlus,
  Mail,
  MessageSquare,
  PlusCircle,
  Plus,
  Github,
  LifeBuoy,
  Cloud,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PinDetail = () => {
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
    const [popupVisible, setPopupVisible] = useState({});

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
            return response.json();
        };

        const fetchComments = async (idFromUrl) => {
            const response = await fetch(`/api/comments?pinId=${idFromUrl}`);
            return response.json();
        };

        const fetchPin = async () => {
            const url = window.location.href;
            const idFromUrl = url.slice(url.lastIndexOf('/') + 1);

            try {
                const pinData = await fetchPinData(idFromUrl);
                const userData = await fetchUserData(pinData.user);
                setPin({ ...pinData, user: userData });

                const currentUserData = await fetchCurrentUser();
                setCurrentUser(currentUserData);

                const currentPinCommentsData = await fetchComments(idFromUrl);
                setCurrentPinComments(currentPinCommentsData.comments);

                setIsCurrentUserFollowingPin(userData.followers.includes(currentUserData._id));
                setIsCurrentUserLikingPin(pinData.likes.includes(currentUserData._id));
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
                setNewComment('');
            } else {
                const result = await response.json();
                setError(`Error adding comment: ${result.error}`);
            }
        } catch (error) {
            setError(`Error adding comment: ${error.message}`);
        }
    };

    const handleCommentEdit = async (commentId) => {
        if (!editedComment || !currentUser || !pin) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text: editedComment, userId: currentUser._id })
            });

            if (response.ok) {
                const updatedComment = await response.json();
                setCurrentPinComments(currentPinComments.map(comment =>
                    comment._id === commentId ? { ...updatedComment, user: currentUser } : comment
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!pin) return <div>No pin data available</div>;

    return (
        <div className="pin-detail">
            <img src={pin.imageUrl} alt={pin.title} />
            <h1>{pin.title}</h1>
            <p>{pin.description}</p>

            <Button onClick={toggleFollow}>
                {isCurrentUserFollowingPin ? 'Unfollow' : 'Follow'}
            </Button>
            <Button onClick={toggleLike}>
                {isCurrentUserLikingPin ? 'Unlike' : 'Like'}
            </Button>

            <div className="comments-section">
                {currentPinComments.map(comment => (
                    <div key={comment._id} className="comment">
                        <p>{comment.text}</p>
                        <p>{formatRelativeTime(comment.timestamp)}</p>
                        {comment.user._id === currentUser?._id && (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Button>Options</Button>
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
                        {commentEditMode === comment._id && (
                            <div>
                                <textarea
                                    value={editedComment}
                                    onChange={(e) => setEditedComment(e.target.value)}
                                />
                                <Button onClick={() => handleCommentEdit(comment._id)}>Save</Button>
                                <Button onClick={() => setCommentEditMode(null)}>Cancel</Button>
                            </div>
                        )}
                    </div>
                ))}
                <textarea
                    value={newComment}
                    onChange={handleCommentChange}
                    placeholder="Add a comment"
                />
                <Button onClick={handleCommentSubmit}>Submit</Button>
            </div>
        </div>
    );
};

export default PinDetail;
