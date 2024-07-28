import EditProfile from "@/components/EditProfile";

const getProfileById = async (userId) => {
  try {
    const MainURL = process.env.BASEURL;
    const res = await fetch(`${MainURL}/api/auth/users/${userId}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const user = await res.json();
    return user;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

const EditTopic = async ({ params }) => {
  const { id } = params;
  const user = await getProfileById(id);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg">
          <h2 className="mb-6 text-2xl font-bold text-center text-white">
            User profile not found
          </h2>
          <p className="text-center text-gray-300">
            There was an error fetching the profile. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const { username, profilePicture, coverPicture, name, bio, age, website, oldPassword, newPassword } = user;

  return (
    <EditProfile
      userId={id}
      username={username}
      profilePicture={profilePicture}
      coverPicture={coverPicture}
      name={name}
      bio={bio}
      age={age}
      website={website}
      oldPassword={oldPassword}
      newPassword={newPassword}
    />
  );
};

export default EditTopic;
