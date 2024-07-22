import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String },
    coverPicture: { type: String },
    name: { type: String },
    bio: { type: String },
    age: { type: Number },
    website: { type: String },
    followers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: Schema.Types.ObjectId, ref: "User" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
}, { timestamps: true });

export const User = mongoose.models.User || mongoose.model('User', UserSchema)