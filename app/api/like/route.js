// pages/api/like.js
import { connectDB } from '@/lib/db';
import likeModels from '@/models/like.models';
import pinModel from '@/models/pin.model';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        await connectDB();
        const likes = await likeModels.find();
        return NextResponse.json({ message: 'OK', likes }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { userId, pinId } = await request.json();

        if (!userId || !pinId) {
            return NextResponse.json({ error: 'User ID and Pin ID are required' }, { status: 400 });
        }

        await connectDB();

        const existingLike = await likeModels.findOne({ user: userId, pin: pinId });

        if (existingLike) {
            return NextResponse.json({ error: 'User has already liked this pin' }, { status: 400 });
        }

        const newLike = await likeModels.create({ user: userId, pin: pinId });

        await pinModel.findByIdAndUpdate(pinId, {
            $push: { likes: userId },
            $pull: { dislikes: userId }
        });

        return NextResponse.json(newLike, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { userId, pinId } = await request.json();

        if (!userId || !pinId) {
            return NextResponse.json({ error: 'User ID and Pin ID are required' }, { status: 400 });
        }

        await connectDB();

        const existingLike = await likeModels.findOne({ user: userId, pin: pinId });

        if (!existingLike) {
            return NextResponse.json({ error: 'User has not liked this pin' }, { status: 400 });
        }

        await likeModels.deleteOne({ _id: existingLike._id });

        await pinModel.findByIdAndUpdate(pinId, {
            $pull: { likes: userId }
        });

        return NextResponse.json({ message: 'Successfully unliked the pin' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
