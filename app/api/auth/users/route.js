import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";
import { NextResponse } from "next/server";
import pinModel from "@/models/pin.model";
import followModel from "@/models/follow.model";
import { Save } from "@/models/save.model";

connectDB();

export async function GET(request) {
    try {
        // Fetch all users without passwords
        const users = await User.find().select('-password');
        
        // Fetch all pins and organize by userId
        const allPins = await pinModel.find();
        const pinsByUserId = allPins.reduce((acc, pin) => {
            if (!acc[pin.user]) {
                acc[pin.user] = [];
            }
            acc[pin.user].push(pin);
            return acc;
        }, {});

        // Fetch saved pins for each user
        const usersWithSavedPins = await Promise.all(users.map(async user => {
            // Fetch saved pins for the user
            const savedPinsDoc = await Save.findOne({ user: user._id }).populate('pins');
            
            // Construct user object with populated pins and saved pins
            return {
                ...user.toObject(),
                posts: pinsByUserId[user._id.toString()] || [],
                savedPins: savedPinsDoc ? savedPinsDoc.pins : []
            };
        }));

        return NextResponse.json({ users: usersWithSavedPins, success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: error.message, success: false }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { username, email, password, profilePicture, coverPicture, name, bio, age, website, followers, following, savedPins, posts } = await request.json();

        if (password.length < 8) {
            return NextResponse.json({ message: "Password must be at least 8 characters long.", success: false }, { status: 400 });
        }

        const user = new User({ username, email, password, profilePicture, coverPicture, name, bio, age, website, followers, following, savedPins, posts });

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


export async function DELETE(request) {
    const { userId } = await request.json();

    try {
        // Find the user by userId
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found:', userId);
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        // Delete all posts associated with the user
        await pinModel.deleteMany({ user: userId });

        // Optionally, delete the user from any follow relationships
        await followModel.deleteMany({
            $or: [
                { follower: userId },
                { following: userId }
            ]
        });

        // Delete the user
        await User.deleteOne({ _id: userId });

        console.log('User and all associated data deleted successfully:', userId);
        return NextResponse.json({ message: 'User and associated data deleted successfully' }, { status: 204 });
    } catch (error) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ message: 'Error deleting user', success: false }, { status: 500 });
    }
}