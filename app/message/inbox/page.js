"use client";
import Link from 'next/link';
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef, useCallback } from 'react';

const MessageInbox = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [senders, setSenders] = useState([]);
  const [selectedSender, setSelectedSender] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchSenders();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedSender) {
      fetchMessages(selectedSender._id);
      const intervalId = setInterval(() => {
        fetchMessages(selectedSender._id);
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [selectedSender]);

  useEffect(() => {
    if (isUserAtBottom) {
      scrollToBottom();
    }
  }, [messages, isUserAtBottom]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/currentUser');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch current user');
      setCurrentUser(data);
    } catch (error) {
      setError("Error fetching current user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSenders = useCallback(async () => {
    try {
      const response = await fetch(`/api/messages?userId=${currentUser._id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch senders');

      const uniqueSenders = [];
      const senderIds = new Set();
      const senderMessages = {};

      data.messages.forEach(message => {
        const sender = message.sender._id !== currentUser._id ? message.sender : message.receiver;
        if (!senderIds.has(sender._id)) {
          uniqueSenders.push(sender);
          senderIds.add(sender._id);
        }

        if (!senderMessages[sender._id] || new Date(senderMessages[sender._id].createdAt) < new Date(message.createdAt)) {
          senderMessages[sender._id] = message;
        }
      });

      // Sort senders based on the latest message timestamp
      uniqueSenders.sort((a, b) => {
        const aTimestamp = new Date(senderMessages[a._id].createdAt);
        const bTimestamp = new Date(senderMessages[b._id].createdAt);
        return bTimestamp - aTimestamp;
      });

      setSenders(uniqueSenders);
    } catch (error) {
      setError("Error fetching senders: " + error.message);
    }
  }, [currentUser]);


  const fetchMessages = useCallback(async (senderId) => {
    try {
      const response = await fetch(`/api/messages?userId=${currentUser._id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to fetch messages');

      const userMessages = data.messages.filter(
        message =>
          (message.sender && message.sender._id === senderId && message.receiver._id === currentUser._id) ||
          (message.receiver._id === senderId && message.sender._id === currentUser._id)
      );

      setMessages(userMessages);
    } catch (error) {
      setError("Error fetching messages: " + error.message);
    }
  }, [currentUser]);

  const handleSenderClick = useCallback((sender) => {
    setSelectedSender(sender);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!messageText.trim()) return;

    const newMessage = {
      _id: `temp-${Date.now()}`,
      text: messageText,
      sender: currentUser,
      receiver: selectedSender,
      createdAt: new Date().toISOString(),
      temporary: true,
    };
    setMessages(prevMessages => [...prevMessages, newMessage]);
    setMessageText('');

    setSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender: currentUser._id,
          receiver: selectedSender._id,
          text: messageText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to send message');

      setMessages(prevMessages =>
        prevMessages.map(msg => (msg._id.startsWith('temp-') ? data.message : msg))
      );
    } catch (error) {
      setError("Error sending message: " + error.message);
      setMessages(prevMessages => prevMessages.filter(msg => !msg._id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  }, [messageText, currentUser, selectedSender]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleScroll = () => {
    if (messagesEndRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current.parentNode;
      setIsUserAtBottom(scrollHeight - scrollTop === clientHeight);
    }
  };

  const formatRelativeTime = useCallback((timestamp) => {
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
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className='flex flex-col md:flex-row w-full h-[calc(100vh-80px)] mt-20'>
      <div className='w-full border-r border-gray-300 md:w-1/4'>
        <h2 className='p-4 font-bold'>Messages</h2>
        <ul>
          {senders.map((sender) => (
            <li
              key={sender._id}
              onClick={() => handleSenderClick(sender)}
              className={`flex items-center p-4 cursor-pointer ${selectedSender?._id === sender._id ? 'bg-gray-200' : ''}`}
            >
              <img src={sender.profilePicture} alt={sender.username} className="object-cover w-10 h-10 mr-3 rounded-full" />
              <span>{sender.username}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className='mt-1 md:hidden'>
        <hr />
      </div>

      <div className='flex flex-col w-full p-4 overflow-hidden md:w-3/4'>
        {selectedSender ? (
          <div className='flex flex-col h-full'>
            <Link href={`/profile/${selectedSender._id}`} className="flex items-center mb-4">
              <img src={selectedSender.profilePicture} alt={selectedSender.username} className="object-cover w-12 h-12 mr-3 rounded-full" />
              <h2 className='font-bold'>{selectedSender.username}</h2>
            </Link>
            <div className='flex-1 overflow-y-auto scrollbar-hide' onScroll={handleScroll}>
              {messages.length > 0 ? (
                messages.map((message) => (
                  <div key={message._id} className={`mb-2 flex ${message.sender && (message.sender._id === currentUser._id || (message.temporary && message.sender._id === currentUser._id)) ? 'justify-end' :
                    'justify-start'}`}>
                    <div
                      className={`inline-block max-w-xs p-2 text-white rounded-lg ${message.sender && (message.sender._id === currentUser._id || (message.temporary && message.sender._id === currentUser._id))
                        ? 'bg-blue-500'
                        : 'bg-gray-400'
                        }`}
                    >
                      <p>{message.text}</p>
                      <span className='block mt-1 text-xs text-right text-gray-200'>
                        {formatRelativeTime(message.createdAt)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className='text-center text-gray-500'>No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className='flex items-center mt-4'>
              <input
                type='text'
                className='flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Type your message...'
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !sending && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className={`px-4 py-2 text-white bg-blue-500 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${sending ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        ) : (
          <p className='text-center text-gray-500'>Select a sender to view messages.</p>
        )}
      </div>
    </div>
  );
};

export default MessageInbox;
