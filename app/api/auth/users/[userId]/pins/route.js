import pinModel from "@/models/pin.model";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { userId } = params;
        const pins = await pinModel.find({ user: userId });
        return NextResponse.json(pins, { status: 200 });
    } catch (error) {
        console.error("Error fetching pins:", error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}