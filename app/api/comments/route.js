import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import commentModel from '@/models/comment.model';
import pinModel from '@/models/pin.model';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const pinId = url.searchParams.get('pinId');

        if (!userId && !pinId) {
            return NextResponse.json({ error: 'Either userId or pinId is required' }, { status: 400 });
        }

        await connectDB();

        // Create filter based on the presence of userId or pinId
        const filter = {};
        if (userId) {
            filter.user = userId;
        }
        if (pinId) {
            filter.pin = pinId;
        }

        const comments = await commentModel.find(filter).populate('user', 'username profilePicture').populate('pin', 'title description'); // Adjust fields as needed

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
            $push: { comments: newComment.user._id },
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
        const { commentId, userId } = await request.json();

        if (!commentId && !userId) {
            return NextResponse.json({ error: 'Either Comment ID or User ID is required' }, { status: 400 });
        }

        await connectDB();

        if (commentId) {
            // Handle deletion by commentId
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
        }

        else if (userId) {
            // Ensure userId is in ObjectId format
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                return NextResponse.json({ error: 'Invalid User ID format' }, { status: 400 });
            }

            // Find and delete comments by userId
            const comments = await commentModel.find({ user: userId }).exec();

            if (comments.length === 0) {
                return NextResponse.json({ error: 'No comments found for the user' }, { status: 404 });
            }

            for (const comment of comments) {
                // Remove the comment from the pin's comments array
                await pinModel.findByIdAndUpdate(comment.pin, {
                    $pull: { comments: comment._id }
                });

                // Delete the comment
                await commentModel.findByIdAndDelete(comment._id);
            }

            return NextResponse.json({ message: 'All comments by the user deleted successfully' }, { status: 200 });
        }
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}