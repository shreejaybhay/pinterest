import mongoose, { Schema } from 'mongoose';

const LikeSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pin: { type: Schema.Types.ObjectId, ref: 'Pin', required: true },
}, { timestamps: true });

export default mongoose.models.Like || mongoose.model('Like', LikeSchema);
