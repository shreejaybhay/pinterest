import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import pinModel from "@/models/pin.model";

connectDB();

export async function GET(request) {
    try {
        // Fetch all users excluding their passwords
        const users = await User.find().select('-password');

        // Fetch all pins and group them by user ID
        const allPins = await pinModel.find();
        const pinsByUserId = allPins.reduce((acc, pin) => {
            if (!acc[pin.user]) {
                acc[pin.user] = [];
            }
            acc[pin.user].push(pin); // Store the full pin object
            return acc;
        }, {});

        // Update each user object with their associated pins
        const usersWithPins = users.map(user => ({
            ...user.toObject(),
            posts: pinsByUserId[user._id.toString()] || [] // Include full pin objects in the posts field
        }));

        return NextResponse.json({ users: usersWithPins, success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }
}


export async function POST(request) {
    const { username, email, password, profilePicture, coverPicture, name, bio, age, website, followers, following, posts } = await request.json();

    if (password.length < 8) {
        return NextResponse.json({ message: "Password must be at least 8 characters long.", success: false }, { status: 400 });
    }
    const user = new User({ username, email, password, profilePicture, coverPicture, name, bio, age, website, followers, following, posts });

    try {
        user.password = bcrypt.hashSync(user.password, parseInt(process.env.BCRYPT_SALT));
        const createdUser = await user.save();
        return NextResponse.json({ user: createdUser, success: true }, { status: 201 });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.email) {
            return NextResponse.json({ message: "This email is already registered", success: false }, { status: 400 });
        }
        return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }
}