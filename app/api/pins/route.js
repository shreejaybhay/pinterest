import { connectDB } from "@/lib/db";
import pinModel from "@/models/pin.model";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
    try {
        await connectDB();
        const pins = await pinModel.find();
        return NextResponse.json({ message: "OK", pins }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await connectDB();
        const { title, description, imageURL, link } = await request.json();
        const authToken = request.cookies.get("authToken")?.value;

        if (!authToken) {
            console.log("Auth token not found");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        let userId;
        try {
            const data = jwt.verify(authToken, process.env.JWT_KEY);
            userId = data.id;  // Corrected to use 'id' instead of '_id'
        } catch (error) {
            console.error("Error verifying auth token:", error);
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        if (!userId) {
            console.error("User ID not found in token");
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const pin = new pinModel({ title, description, imageURL, link, user: userId });
        const createdPin = await pin.save();

        return NextResponse.json({ message: "Created Pin", pin: createdPin }, { status: 201 });
    } catch (error) {
        console.error("Error creating pin:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
