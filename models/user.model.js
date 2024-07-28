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
    savedPins: [{ type: Schema.Types.ObjectId, ref: "Save" }],
    posts: [{ type: Schema.Types.ObjectId, ref: "Pin" }],
}, { timestamps: true });

UserSchema.pre('remove', async function (next) {
    const userId = this._id;
    await mongoose.model('Board').deleteMany({ user: userId });
    await mongoose.model('Pin').deleteMany({ user: userId });
    await mongoose.model('Comment').deleteMany({ user: userId });
    await mongoose.model('Follow').deleteMany({ $or: [{ follower: userId }, { following: userId }] });
    await mongoose.model('Like').deleteMany({ user: userId });
    next();
  });

export const User = mongoose.models.User || mongoose.model('User', UserSchema)