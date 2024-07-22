import { NextResponse } from "next/server";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB } from "@/lib/db";
import { User } from "@/models/user.model";

export async function POST(request) {
    try {
        await connectDB();

        const { email, password } = await request.json();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return NextResponse.json({ message: 'Invalid email or password.' }, { status: 401 });
        }

        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_KEY, { expiresIn: '1d' });

        const response = NextResponse.json({ message: "Login successful", success: true, user });
        response.cookies.set("authToken", token, { httpOnly: true });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Server error.' }, { status: 500 });
    }
}
