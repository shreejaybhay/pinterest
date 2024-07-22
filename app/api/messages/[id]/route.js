import { connectDB } from "@/lib/db";
import messageModel from "@/models/message.model";
import { NextResponse } from "next/server";

// GET handler to fetch a specific message by ID
export async function GET(request, { params }) {
    await connectDB();
    const { id } = params;
    try {
        const message = await messageModel.findById(id).populate('sender receiver', 'username profilePicture');
        if (!message) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }
        return NextResponse.json({ message: "OK", message }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PUT handler to update a specific message by ID
export async function PUT(request, { params }) {
    await connectDB();
    const { id } = params;
    try {
        const body = await request.json();
        const message = await messageModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!message) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }
        return NextResponse.json({ message: "Updated", message }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

// DELETE handler to delete a specific message by ID
export async function DELETE(request, { params }) {
    await connectDB();
    const { id } = params;
    try {
        const deletedMessage = await messageModel.findByIdAndDelete(id);
        if (!deletedMessage) {
            return NextResponse.json({ message: 'Message not found' }, { status: 404 });
        }
        return NextResponse.json({ message: "Deleted" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}