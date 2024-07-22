import pinModel from "@/models/pin.model";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { pinId } = params;
    try {
        const pin = await pinModel.findById(pinId);
        if (!pin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }
        return NextResponse.json(pin, { status: 200 });
    } catch (error) {
        console.error("Error fetching pin:", error);
        return NextResponse.json({ error: "Failed to fetch pin" }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { pinId } = params;
    try {
        const { title, description, imageURL, link } = await request.json();

        // Check if the provided fields are valid
        if (!title || !imageURL) {
            return NextResponse.json({ error: "Title and imageURL are required" }, { status: 400 });
        }

        let pin = await pinModel.findById(pinId);
        if (!pin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }

        // Update pin fields
        pin.title = title;
        pin.description = description;
        pin.imageURL = imageURL;
        pin.link = link;

        const updatedPin = await pin.save();
        return NextResponse.json(updatedPin, { status: 200 });
    } catch (error) {
        console.error("Error updating pin:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { pinId } = params;
        const pin = await pinModel.findByIdAndDelete(pinId);
        if (!pin) {
            return NextResponse.json({ error: "Pin not found" }, { status: 404 });
        }
        return NextResponse.json({ message: "Pin deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete pin" }, { status: 500 });
    }
}