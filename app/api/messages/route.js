import { connectDB } from "@/lib/db";
import messageModel from "@/models/message.model";
import { NextResponse } from "next/server";

export async function GET(request) {
    await connectDB();
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    try {
        const query = userId
            ? {
                $or: [
                    { sender: userId },
                    { receiver: userId }
                ]
              }
            : {};

        const messages = await messageModel.find(query).populate('sender receiver', 'username profilePicture');
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
