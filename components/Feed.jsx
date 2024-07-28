/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import LazyLoad from "react-lazyload";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LoadingSkeleton = () => {
  const height = `${Math.floor(Math.random() * (400 - 200 + 1)) + 200}px`;
  return (
    <div className="relative overflow-hidden bg-gray-200 rounded-lg shadow-md">
      <div className="animate-pulse">
        <div className="bg-gray-300" style={{ height }}></div>
        <div className="p-4">
          <div className="h-6 mb-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    </div>
  );
};

const Feed = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [savedPins, setSavedPins] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showEditbutton, setShowEditbutton] = useState(false);
  const router = useRouter();
  const observer = useRef();

  const fetchPins = async (page) => {
    try {
      const response = await fetch(`/api/pins?page=${page}&limit=25`);
      const data = await response.json();
      if (response.ok) {
        const userIds = [...new Set(data.pins.map((pin) => pin.user))];
        const userResponses = await Promise.all(
          userIds.map((userId) => fetch(`/api/auth/users/${userId}`))
        );
        const users = await Promise.all(userResponses.map((res) => res.json()));
        const usersMap = users.reduce((acc, user) => {
          acc[user._id] = user;
          return acc;
        }, {});

        const pinsWithUser = data.pins.map((pin) => ({
          ...pin,
          user: usersMap[pin.user],
        }));

        pinsWithUser.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setPins((prevPins) => {
          // Filter out any duplicate pins
          const existingPins = new Set(prevPins.map((pin) => pin._id));
          const newPins = pinsWithUser.filter(
            (pin) => !existingPins.has(pin._id)
          );
          return [...prevPins, ...newPins];
        });
        setHasMore(data.pins.length > 0);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError("Error fetching pins: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPins(page);
  }, [page]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/currentUser");
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setCurrentUserId(data._id);
        } else {
          setError("Error fetching user data: " + data.error);
        }
      } catch (error) {
        setError("Error fetching user data: " + error.message);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchSavedPins = async () => {
      if (user) {
        try {
          const response = await fetch(`/api/save?userId=${user._id}`);
          const data = await response.json();
          if (response.ok) {
            setSavedPins(data.pins);
          } else {
            setError(data.error);
          }
        } catch (error) {
          setError("Error fetching saved pins: " + error.message);
        }
      }
    };

    if (user) {
      fetchSavedPins();
    }
  }, [user]);

  const handleSaveUnsave = async (pin) => {
    try {
      const isSaved = savedPins.some((savedPin) => savedPin._id === pin._id);
      const url = "/api/save";
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id, pinId: pin._id }),
      });
      if (response.ok) {
        if (isSaved) {
          setSavedPins(
            savedPins.filter((savedPin) => savedPin._id !== pin._id)
          );
        } else {
          setSavedPins([...savedPins, pin]);
        }
      } else {
        const data = await response.json();
        setError(data.error);
      }
    } catch (error) {
      setError("Error saving/un-saving pin: " + error.message);
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
    link.download = imageURL.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    if (pins.user === currentUserId) {
      setShowEditbutton(true);
    }
  }, [pins, currentUserId]);

  const handleEditPin = (pin) => {
    router.push(`/editpin/${pin._id}`);
  };

  const lastPinElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  if (loading && pins.length === 0) {
    return (
      <div className="p-4 mt-20 xl:mx-16 md:mx-0">
        <div className="grid-cols-custom">
          {Array.from({ length: 25 }).map((_, index) => (
            <LoadingSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // console.log(pins);
  // console.log(currentUserId);
  return (
    <div className="p-4 mt-20 xl:mx-16 md:mx-0">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 2, 750: 3, 1200: 5, 1600: 7 }}
      >
        <Masonry gutter="16px">
          {pins.map((pin, index) => {
            if (pins.length === index + 1) {
              return (
                <div ref={lastPinElementRef} key={pin._id}>
                  <div className="relative overflow-hidden rounded-lg shadow-md group">
                    <Link href={`/pin/${pin._id}`}>
                      <LazyLoad height={300} offset={100}>
                        <Image
                          src={pin.imageURL}
                          alt={pin.title}
                          className="object-cover w-full h-auto transition duration-300 ease-in-out group-hover:brightness-50"
                          loading="lazy"
                          width={300}
                          height={500}
                        />
                      </LazyLoad>
                    </Link>
                    <button
                      onClick={() => handleSaveUnsave(pin)}
                      className={`absolute hidden px-4 py-2 text-lg font-semibold text-white rounded-full top-4 right-4 group-hover:block ${
                        savedPins.some((savedPin) => savedPin._id === pin._id)
                          ? "bg-gray-700"
                          : "bg-red-700"
                      }`}
                      aria-label="Save Pin"
                    >
                      {savedPins.some((savedPin) => savedPin._id === pin._id)
                        ? "Saved"
                        : "Save"}
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
                            <DropdownMenuItem
                              onClick={() => handleDownload(pin.imageURL)}
                            >
                              Download Image
                            </DropdownMenuItem>
                            {pin.user?._id === currentUserId && (
                              <DropdownMenuItem
                                onClick={() => handleEditPin(pin)}
                              >
                                Edit pin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full gap-3 px-4 py-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <LazyLoad height={30} offset={100}>
                        <Image
                          className="object-cover w-6 h-6 rounded-full"
                          src={pin.user?.profilePicture}
                          alt={pin.user?.username || "Profile"}
                          loading="lazy"
                          width={300}
                          height={400}
                        />
                      </LazyLoad>
                      <span>{pin.user?.username || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div key={pin._id}>
                  <div className="relative overflow-hidden rounded-lg shadow-md group">
                    <Link href={`/pin/${pin._id}`}>
                      <LazyLoad height={300} offset={100}>
                        <Image
                          src={pin.imageURL}
                          alt={pin.title}
                          className="object-cover w-full h-auto transition duration-300 ease-in-out group-hover:brightness-50"
                          loading="lazy"
                          width={300}
                          height={500}
                        />
                      </LazyLoad>
                    </Link>
                    <button
                      onClick={() => handleSaveUnsave(pin)}
                      className={`absolute hidden px-4 py-2 text-lg font-semibold text-white rounded-full top-4 right-4 group-hover:block ${
                        savedPins.some((savedPin) => savedPin._id === pin._id)
                          ? "bg-gray-700"
                          : "bg-red-700"
                      }`}
                      aria-label="Save Pin"
                    >
                      {savedPins.some((savedPin) => savedPin._id === pin._id)
                        ? "Saved"
                        : "Save"}
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
                            <DropdownMenuItem
                              onClick={() => handleDownload(pin.imageURL)}
                            >
                              Download Image
                            </DropdownMenuItem>
                            {pin.user?._id === currentUserId && (
                              <DropdownMenuItem
                                onClick={() => handleEditPin(pin)}
                              >
                                Edit pin
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between w-full gap-3 px-4 py-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <LazyLoad height={30} offset={100}>
                        <Image
                          className="object-cover w-6 h-6 rounded-full"
                          src={pin.user?.profilePicture}
                          alt={pin.user?.username || "Profile"}
                          loading="lazy"
                          width={24}
                          height={24}
                        />
                      </LazyLoad>
                      <span>{pin.user?.username || "Anonymous"}</span>
                    </div>
                  </div>
                </div>
              );
            }
          })}
          {loading && <LoadingSkeleton />}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default Feed;
