import { connectDB } from "@/lib/db";
import followModel from "@/models/follow.model";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";


export async function GET(request) {
    try {
        await connectDB();
        const follow = await followModel.find()
        return NextResponse.json(follow, { message: "OK" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const { userId, followId } = await request.json();

        // Check if the user and followId are the same
        if (userId === followId) {
            return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
        }

        // Find the user and the user to be followed
        const user = await User.findById(userId);
        const followUser = await User.findById(followId);

        // Check if the user exists
        if (!user || !followUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if already following
        const alreadyFollowing = await followModel.findOne({ follower: userId, following: followId });
        if (alreadyFollowing) {
            return NextResponse.json({ error: "Already following this user" }, { status: 400 });
        }

        // Create a new follow document
        const follow = new followModel({ follower: userId, following: followId });
        await follow.save();

        // Update the following and followers arrays
        user.following.push(followId);
        followUser.followers.push(userId);
        await user.save();
        await followUser.save();

        return NextResponse.json({ success: true, follow }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        // Connect to the database
        await connectDB();

        // Parse the request body
        const { userId } = await request.json();

        // Delete all documents where the userId is in either 'follower' or 'following'
        const result = await followModel.deleteMany({
            $or: [
                { follower: userId },
                { following: userId }
            ]
        });

        if (result.deletedCount > 0) {
            return NextResponse.json({ message: 'Documents deleted successfully.' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No documents found for the provided userId.' }, { status: 404 });
        }
    } catch (error) {
        // Handle errors
        console.error('Error handling DELETE request:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}