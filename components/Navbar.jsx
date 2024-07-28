/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { AuthContext } from "./AuthContext";
import { useRouter } from "next/navigation";
import { MenuIcon, XIcon } from "@heroicons/react/outline"; // Ensure you have installed @heroicons/react@v1

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/auth/currentUser");

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();

        setCurrentUser(data);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        router.push("/login"); // Redirect to login if there's an error
      }
    };

    if (user) {
      fetchUserData();
    } else {
      setCurrentUser(null);
    }
  }, [user, router]);

  return (
    <nav className="fixed top-0 left-0 z-50 flex items-center justify-between w-full p-4 bg-white shadow-md">
      <div className="flex items-center">
        <svg
          aria-label="Pinterest"
          fill="#CC0000"
          className="w-8 h-8"
          role="img"
          viewBox="0 0 24 24"
        >
          <path d="M7.55 23.12c-.15-1.36-.04-2.67.25-3.93L9 14.02a7 7 0 0 1-.34-2.07c0-1.68.8-2.88 2.08-2.88.88 0 1.53.62 1.53 1.8q0 .57-.22 1.28l-.53 1.73q-.15.5-.15.91c0 1.2.92 1.88 2.09 1.88 2.08 0 3.57-2.16 3.57-4.96 0-3.12-2.04-5.11-5.06-5.11-3.36 0-5.49 2.19-5.49 5.23 0 1.23.38 2.37 1.11 3.15-.24.4-.5.48-.88.48-1.2 0-2.34-1.7-2.34-4 0-3.99 3.2-7.16 7.68-7.16 4.7 0 7.66 3.28 7.66 7.33 0 4.07-2.88 7.13-5.98 7.13a3.8 3.8 0 0 1-3.07-1.47l-.61 2.5c-.33 1.28-.83 2.5-1.62 3.67A12 12 0 0 0 24 11.99 12 12 0 1 0 7.55 23.12"></path>
        </svg>
        <Link href="/" className="ml-3 text-[#CC0000] font-semibold text-xl">
          Pinterest
        </Link>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="block p-2 lg:hidden"
        aria-label="Toggle Menu"
      >
        {isOpen ? (
          <XIcon className="w-6 h-6" />
        ) : (
          <MenuIcon className="w-6 h-6" />
        )}
      </button>

      <div
        className={`lg:flex lg:items-center lg:space-x-4 ${
          isOpen ? "block" : "hidden"
        } absolute lg:static top-16 left-0 w-full bg-white lg:bg-transparent lg:w-auto lg:top-auto lg:left-auto lg:shadow-none lg:pb-0 pb-5`}
      >
        <ul className="flex flex-col items-center p-4 space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:p-0">
          <li>
            <Link href="/today">Today</Link>
          </li>
        </ul>

        <div className="flex flex-col items-center space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4 lg:items-center lg:ml-auto">
          {user ? (
            <>
              <Link href="/createPin">Create</Link>
              <Link href="/message/inbox">DM</Link>

              <Link href="/profile">
                <img
                  src={currentUser?.profilePicture}
                  alt="Profile"
                  className="object-cover w-8 h-8 rounded-full"
                />
              </Link>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="bg-[#B60000] py-2 px-4 rounded-full text-white"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="bg-[#B60000] py-2 px-4 rounded-full text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-[#E2E2E2] py-2 px-4 rounded-full"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
