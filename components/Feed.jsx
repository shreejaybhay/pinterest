/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";

const Feed = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const observer = useRef();

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const response = await fetch("/api/pins");
        const data = await response.json();
        if (response.ok) {
          // Batch fetch user data
          const userIds = [...new Set(data.pins.map(pin => pin.user))];
          const userResponses = await Promise.all(
            userIds.map(userId => fetch(`/api/auth/users/${userId}`))
          );
          const users = await Promise.all(userResponses.map(res => res.json()));
          const usersMap = users.reduce((acc, user) => {
            acc[user._id] = user;
            return acc;
          }, {});

          const pinsWithUser = data.pins.map(pin => ({
            ...pin,
            user: usersMap[pin.user]
          }));
          setPins(pinsWithUser);
        } else {
          setError(data.error);
        }
      } catch (error) {
        setError("Error fetching pins: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPins();
  }, []);

  const handleLazyLoad = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.current.unobserve(img);
      }
    });
  };

  useEffect(() => {
    observer.current = new IntersectionObserver(handleLazyLoad);
    const images = document.querySelectorAll('.lazy-load');
    images.forEach(img => observer.current.observe(img));
    return () => {
      observer.current.disconnect();
    };
  }, [pins]);

  if (loading) {
    return <div className="py-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="py-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="container p-4 mx-auto mt-20">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 2, 750: 3, 900: 5 }}
      >
        <Masonry gutter="16px">
          {pins.map((pin) => (
            <div key={pin._id}>
              <div className="relative overflow-hidden bg-black rounded-lg shadow-md group">
                <Link href={`/pin/${pin._id}`}>
                  <img
                    data-src={pin.imageURL}
                    alt={pin.title}
                    className="object-cover w-full h-auto transition duration-300 ease-in-out group-hover:brightness-50 lazy-load"
                  />
                </Link>
                <button
                  className="absolute hidden px-4 py-2 text-lg font-semibold text-white bg-red-700 rounded-full top-4 right-4 group-hover:block"
                  aria-label="Save Pin"
                >
                  Save
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
                    <a
                      href="#"
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
                    </a>
                    <a
                      href="#"
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
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between w-full gap-3 px-4 py-2 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <img
                    className="w-6 h-6 rounded-full"
                    src={pin.user.profilePicture}
                    alt={pin.user.username || "Profile"}
                  />
                  <span>{pin.user.username || "Anonymous"}</span>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default Feed;
