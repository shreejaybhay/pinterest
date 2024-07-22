import { connectDB } from "@/lib/db";
import boardModel from "@/models/board.model";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    await connectDB();

    const { id } = params;

    try {
        const board = await boardModel.findById(id);
        if (!board) {
            return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: board });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}

export async function PUT(request, { params }) {
    await connectDB();

    const { id } = params;

    try {
        const body = await request.json();
        const board = await boardModel.findByIdAndUpdate(id, body, { new: true, runValidators: true });
        if (!board) {
            return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: board });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    await connectDB();

    const { id } = params;

    try {
        const deletedBoard = await boardModel.deleteOne({ _id: id });
        if (!deletedBoard.deletedCount) {
            return NextResponse.json({ success: false, error: 'Board not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        return NextResponse.json({ success: false, error }, { status: 400 });
    }
}