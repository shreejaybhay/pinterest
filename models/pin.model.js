import mongoose, { Schema } from 'mongoose';

const PinSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    imageURL: { type: String, required: true },
    link: { type: String, trim: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    board: { type: Schema.Types.ObjectId, ref: 'Board' },
}, { timestamps: true });

PinSchema.pre('remove', async function (next) {
    await mongoose.model('Comment').deleteMany({ pin: this._id });
    await mongoose.model('Like').deleteMany({ pin: this._id });
    next();
});

export default mongoose.models.Pin || mongoose.model('Pin', PinSchema);