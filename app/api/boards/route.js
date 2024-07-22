import { connectDB } from "@/lib/db";
import boardModel from "@/models/board.model";
import { NextResponse } from "next/server";

// GET handler to fetch all boards
export async function GET(request) {
    await connectDB();
    try {
        const boards = await boardModel.find({});
        if (!boards || boards.length === 0) {
            return NextResponse.json({ message: "No boards found" }, { status: 404 });
        }
        return NextResponse.json({ message: "OK", boards }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST handler to create a new board
export async function POST(request) {
    await connectDB();
    try {
        const body = await request.json();
        const board = await boardModel.create(body);
        return NextResponse.json({ message: "Created", board }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
