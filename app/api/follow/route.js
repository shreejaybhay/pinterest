import { connectDB } from "@/lib/db";
import followModel from "@/models/follow.model";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";

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