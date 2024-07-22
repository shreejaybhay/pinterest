import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
    const { userId } = params;
    try {
        const user = await User.findById(userId).select("-password");
        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json({ message: "Error fetching user", success: false }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { userId } = params;
    const { password } = await request.json();

    console.log("DELETE request received:", { userId, password });

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found:", userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log("Invalid password for user:", userId);
            return NextResponse.json({ message: 'Invalid password' }, { status: 401 });
        }

        await User.deleteOne({ _id: userId });
        console.log("User deleted successfully:", userId);
        return NextResponse.json({ message: 'User deleted successfully' }, { status: 204 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ message: "Error deleting user", success: false }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { userId } = params;
    const { username, email, oldPassword, newPassword, profilePicture, coverPicture, name, bio, age, website, followers, following, posts } = await request.json();

    try {
        const user = await User.findById(userId);
        if (!user) {
            console.log("User not found:", userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (profilePicture) user.profilePicture = profilePicture;
        if (coverPicture) user.coverPicture = coverPicture;
        if (name) user.name = name;
        if (bio) user.bio = bio;
        if (age) user.age = age;
        if (website) user.website = website;
        if (followers) user.followers = followers;
        if (following) user.following = following;
        if (posts) user.posts = posts;

        if (newPassword) {
            const isMatch = await bcrypt.compare(oldPassword, user.password);
            if (!isMatch) {
                return NextResponse.json({ message: 'Invalid old password' }, { status: 404 });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await user.save();
        return NextResponse.json({ message: "User updated successfully", user: updatedUser, success: true });
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json({ message: "Error updating user", success: false }, { status: 500 });
    }
}
