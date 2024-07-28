import mongoose, { Schema } from "mongoose";

const MessageSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
