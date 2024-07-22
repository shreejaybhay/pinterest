import { connectDB } from "@/lib/db";
import followModel from "@/models/follow.model";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        await connectDB();
        const { userId, unfollowId } = await request.json();

        // Check if the user and unfollowId are the same
        if (userId === unfollowId) {
            return NextResponse.json({ error: "You cannot unfollow yourself" }, { status: 400 });
        }

        // Find the user and the user to be unfollowed
        const user = await User.findById(userId);
        const unfollowUser = await User.findById(unfollowId);

        // Check if the user exists
        if (!user || !unfollowUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if not following
        const following = await followModel.findOne({ follower: userId, following: unfollowId });
        if (!following) {
            return NextResponse.json({ error: "You are not following this user" }, { status: 400 });
        }

        // Remove the follow document
        await followModel.findOneAndDelete({ follower: userId, following: unfollowId });

        // Update the following and followers arrays
        user.following = user.following.filter(id => id.toString() !== unfollowId);
        unfollowUser.followers = unfollowUser.followers.filter(id => id.toString() !== userId);
        await user.save();
        await unfollowUser.save();

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
