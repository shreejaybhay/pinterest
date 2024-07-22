import mongoose, { Schema } from "mongoose";

const BoardSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pins: [{ type: Schema.Types.ObjectId, ref: 'Pin' }],
}, { timestamps: true });

export default mongoose.models.Board || mongoose.model('Board', BoardSchema);