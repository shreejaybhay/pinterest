import { connectDB } from "@/lib/db";
import pinModel from "@/models/pin.model";
import { Save } from "@/models/save.model";
import { NextResponse } from "next/server";

// GET Request Handler
export async function GET(request) {
    try {
        await connectDB();
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const savedPins = await Save.findOne({ user: userId }).populate('pins');
        if (!savedPins) {
            return NextResponse.json({ error: 'No saved pins found for this user' }, { status: 404 });
        }
        return NextResponse.json(savedPins);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// POST Request Handler
export async function POST(request) {
    try {
        await connectDB();
        const { userId, pinId } = await request.json();

        if (!userId || !pinId) {
            return NextResponse.json({ error: 'User ID and Pin ID are required' }, { status: 400 });
        }

        const pin = await pinModel.findById(pinId);
        if (!pin) {
            return NextResponse.json({ error: 'Pin not found' }, { status: 404 });
        }

        let savedPin = await Save.findOne({ user: userId });
        if (!savedPin) {
            savedPin = new Save({ user: userId, pins: [pinId] });
        } else {
            // Push pinId if it’s not already in the array
            if (!savedPin.pins.includes(pinId)) {
                savedPin.pins.push(pinId);
            }
        }

        await savedPin.save();
        return NextResponse.json(savedPin);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

// DELETE Request Handler
export async function DELETE(request) {
    try {
        await connectDB();
        const { userId, pinId } = await request.json();

        if (!userId || !pinId) {
            return NextResponse.json({ error: 'User ID and Pin ID are required' }, { status: 400 });
        }

        const savedPin = await Save.findOne({ user: userId });
        if (!savedPin) {
            return NextResponse.json({ error: 'No saved pins found for this user' }, { status: 404 });
        }

        savedPin.pins = savedPin.pins.filter(id => id.toString() !== pinId);
        await savedPin.save();

        return NextResponse.json({ message: 'Pin removed successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}