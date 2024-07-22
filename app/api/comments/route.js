// pages/api/comments.js
import { connectDB } from '@/lib/db';
import commentModel from '@/models/comment.model';
import pinModel from '@/models/pin.model';
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const pinId = url.searchParams.get('pinId');

        if (!pinId) {
            return NextResponse.json({ error: 'Pin ID is required' }, { status: 400 });
        }

        await connectDB();
        const comments = await commentModel.find({ pin: pinId }).populate('user', 'username profilePicture');

        return NextResponse.json({ comments }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { text, userId, pinId } = await request.json();

        if (!text || !userId || !pinId) {
            return NextResponse.json({ error: 'Text, User ID, and Pin ID are required' }, { status: 400 });
        }

        await connectDB();
        const newComment = await commentModel.create({ text, user: userId, pin: pinId });
        if (!newComment) {
            return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
        }
        const updatedPin = await pinModel.findByIdAndUpdate(pinId, {
            $push: { comments: newComment._id },
        }, { new: true });

        if (!updatedPin) {
            return NextResponse.json({ error: 'Failed to update pin' }, { status: 500 });
        }
        return NextResponse.json(newComment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const { commentId, text } = await request.json();

        if (!commentId || !text) {
            return NextResponse.json({ error: 'Comment ID and text are required' }, { status: 400 });
        }

        await connectDB();
        const updatedComment = await commentModel.findByIdAndUpdate(commentId, { text }, { new: true });

        if (!updatedComment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        return NextResponse.json(updatedComment, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { commentId } = await request.json();

        if (!commentId) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        await connectDB();
        const comment = await commentModel.findById(commentId);

        if (!comment) {
            return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
        }

        // Remove the comment from the pin's comments array
        await pinModel.findByIdAndUpdate(comment.pin, {
            $pull: { comments: commentId }
        });

        // Delete the comment
        await commentModel.findByIdAndDelete(commentId);

        return NextResponse.json({ message: 'Comment deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}