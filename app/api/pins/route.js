import { connectDB } from "@/lib/db";
import pinModel from "@/models/pin.model";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    await connectDB();

    // Retrieve query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page')) || 1;
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const skip = (page - 1) * limit;

    let pins;
    if (userId) {
      // Find pins by userId with pagination and sort by createdAt
      pins = await pinModel.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    } else {
      // Find all pins with pagination and sort by createdAt
      pins = await pinModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
    }

    const totalPins = userId ? await pinModel.countDocuments({ user: userId }) : await pinModel.countDocuments();
    const totalPages = Math.ceil(totalPins / limit);

    return NextResponse.json({
      message: "OK",
      pins,
      totalPages,
      currentPage: page,
    }, { status: 200 });
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
      userId = data.id;
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
