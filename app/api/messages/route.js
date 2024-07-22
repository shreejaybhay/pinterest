import { connectDB } from "@/lib/db";
import messageModel from "@/models/message.model";
import { NextResponse } from "next/server";

// GET handler to fetch all messages
export async function GET(request) {
    await connectDB();
    try {
        const messages = await messageModel.find({}).populate('sender receiver', 'username profilePicture');
        return NextResponse.json({ message: "OK", messages }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    await connectDB();
    try {
        const body = await request.json();
        const message = await messageModel.create(body);
        return NextResponse.json({ message: "Created", message }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}