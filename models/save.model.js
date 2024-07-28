import mongoose, { Schema } from "mongoose";

const savedPinsSchema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    pins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pin' }]
}, { timestamps: true })

export const Save = mongoose.models.Save || mongoose.model('Save', savedPinsSchema)