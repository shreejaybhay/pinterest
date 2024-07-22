import mongoose, { Schema } from "mongoose";

const CommentSchema = new Schema({
    text: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pin: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
}, { timestamps: true });

export default mongoose.models.Comment || mongoose.model('Comment', CommentSchema);
