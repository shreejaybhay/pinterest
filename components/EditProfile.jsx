/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const EditProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    oldPassword: "",
    newPassword: "",
    profilePicture: "",
    coverPicture: "",
    name: "",
    bio: "",
    age: "",
    website: "",
  });
  const [editField, setEditField] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/auth/users/${userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        setUser(data);
        setFormData({
          username: data.username,
          profilePicture: data.profilePicture,
          coverPicture: data.coverPicture,
          name: data.name,
          bio: data.bio,
          age: data.age,
          website: data.website,
          oldPassword: "", // Clear old password for security
          newPassword: "", // Clear new password for security
        });
      } catch (error) {
        console.error("Error fetching user:", error);
        setErrorMessage(error.message);
      }
    };
    fetchUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e, field) => {
    e.preventDefault();

    const updateData = {
      [field]: formData[field],
      ...(field === "newPassword" && { oldPassword: formData.oldPassword }),
    };

    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || `Failed to update ${field}`);
      }
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setEditField(null);
    }
  };

  const handleCloseEdit = () => {
    setEditField(null);
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: deletePassword }),
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Failed to delete account");
      }
      // Log out user
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      router.push("/"); // Redirect to homepage or login page
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setDeletePassword("");
      setShowDeleteModal(false);
    }
  };

  const doLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Failed to log out");
      }
      router.push("/login"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
      setErrorMessage(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen mt-16 bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded shadow-md">
        <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
          Edit Profile
        </h2>

        {errorMessage && (
          <div className="mb-4 text-sm text-red-500">{errorMessage}</div>
        )}

        {user && (
          <>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <div className="flex items-center justify-between">
                {formData.profilePicture && (
                  <img
                    className="w-16 h-16 mr-4 rounded-full"
                    src={formData.profilePicture}
                    alt="Profile Pic"
                  />
                )}
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("profilePicture")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Cover Picture
              </label>
              <div className="flex items-center justify-between">
                {formData.coverPicture && (
                  <img
                    className="object-cover w-16 h-16 mr-4 rounded"
                    src={formData.coverPicture}
                    alt="Cover Pic"
                  />
                )}
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("coverPicture")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="flex items-center justify-between">
                <span>{formData.username}</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("username")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Name
              </label>
              <div className="flex items-center justify-between">
                <span>{formData.name}</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("name")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Bio
              </label>
              <div className="flex items-center justify-between">
                <span className="px-1 line-clamp-1">{formData.bio}</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("bio")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Age
              </label>
              <div className="flex items-center justify-between">
                <span>{formData.age}</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("age")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="flex items-center justify-between">
                <span>{formData.website}</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("website")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="flex items-center justify-between">
                <span>********</span>
                <button
                  className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                  onClick={() => setEditField("newPassword")}
                >
                  Edit
                </button>
              </div>
            </div>

            <div className="mb-6">
              <button
                className="w-full px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700"
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>
          </>
        )}

        {editField && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-8 bg-white rounded shadow-md">
              <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
                Edit {editField.charAt(0).toUpperCase() + editField.slice(1)}
              </h2>
              <form onSubmit={(e) => handleSubmit(e, editField)}>
                {editField === "username" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="username"
                    >
                      Username
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="username"
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "profilePicture" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="profilePicture"
                    >
                      Profile Picture URL
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="profilePicture"
                      type="text"
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "coverPicture" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="coverPicture"
                    >
                      Cover Picture URL
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="coverPicture"
                      type="text"
                      name="coverPicture"
                      value={formData.coverPicture}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "name" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "bio" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="bio"
                    >
                      Bio
                    </label>
                    <textarea
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="bio"
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "age" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="age"
                    >
                      Age
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="age"
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "website" && (
                  <div className="mb-4">
                    <label
                      className="block mb-2 text-sm font-medium text-gray-700"
                      htmlFor="website"
                    >
                      Website
                    </label>
                    <input
                      className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                      id="website"
                      type="text"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {editField === "newPassword" && (
                  <>
                    <div className="mb-4">
                      <label
                        className="block mb-2 text-sm font-medium text-gray-700"
                        htmlFor="oldPassword"
                      >
                        Current Password
                      </label>
                      <input
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                        id="oldPassword"
                        type="password"
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="block mb-2 text-sm font-medium text-gray-700"
                        htmlFor="newPassword"
                      >
                        New Password
                      </label>
                      <input
                        className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                        id="newPassword"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
                    onClick={handleCloseEdit}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-md p-8 bg-white rounded shadow-md">
              <h2 className="mb-6 text-2xl font-semibold text-center text-gray-800">
                Confirm Account Deletion
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDelete();
                }}
              >
                <div className="mb-4">
                  <label
                    className="block mb-2 text-sm font-medium text-gray-700"
                    htmlFor="deletePassword"
                  >
                    Enter Password to Confirm
                  </label>
                  <input
                    className="w-full px-3 py-2 leading-tight text-gray-700 border rounded shadow focus:outline-none focus:shadow-outline"
                    id="deletePassword"
                    type="password"
                    name="deletePassword"
                    placeholder="Password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                  />
                </div>
                {errorMessage && (
                  <div className="mb-4 text-sm text-red-500">
                    {errorMessage}
                  </div>
                )}
                <div className="flex justify-between">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 focus:outline-none focus:shadow-outline"
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-bold text-white bg-gray-600 rounded hover:bg-gray-700 focus:outline-none focus:shadow-outline"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div>
          <button
            className="w-full py-2 font-medium text-center bg-gray-300"
            onClick={doLogout}
          >
            LogOut
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
