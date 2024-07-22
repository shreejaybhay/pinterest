import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import pinModel from "@/models/pin.model";
import boardModel from "@/models/board.model";
import commentModel from "@/models/comment.model";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        await connectDB();

        // Retrieve the auth token from cookies
        const authToken = request.cookies.get("authToken")?.value;
        if (!authToken) {
            return NextResponse.json({ error: 'No auth token found' }, { status: 401 });
        }

        let data;
        try {
            // Verify the JWT token
            data = jwt.verify(authToken, process.env.JWT_KEY);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Fetch the user excluding the password field
        const user = await User.findById(data.id).select("-password");
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Fetch all pins for the user
        const userPins = await pinModel.find({ user: user._id }).lean();

        // Fetch comments for each pin
        for (let pin of userPins) {
            const comments = await commentModel.find({ pin: pin._id }).populate('user', 'username profilePicture').lean();
            pin.comments = comments;
        }

        // Fetch all boards for the user
        const userBoards = await boardModel.find({ user: user._id }).lean();

        // Attach the full pin details and boards to the user's posts
        const userWithPinsAndBoards = {
            ...user.toObject(),
            posts: userPins, // Include full pin objects in the posts field
            boards: userBoards // Include full board objects in the boards field
        };

        return NextResponse.json(userWithPinsAndBoards);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
