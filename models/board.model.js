import mongoose, { Schema } from "mongoose";

const BoardSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pins: [{ type: Schema.Types.ObjectId, ref: 'Pin' }],
}, { timestamps: true });

BoardSchema.pre('remove', async function (next) {
    await mongoose.model('Pin').deleteMany({ board: this._id });
    next();
});

export default mongoose.models.Board || mongoose.model('Board', BoardSchema);