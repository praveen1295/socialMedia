import mongoose from "mongoose";

const revenueSharingSchema = new mongoose.Schema({
    pricePerView: {
        type: Number,
        required: [true, 'Price per view is required'],
        min: [0, 'Price per view cannot be negative']
    },
    pricePerLike: {
        type: Number,
        required: [true, 'Price per like is required'],
        min: [0, 'Price per like cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
    }
}, {
    timestamps: true
});

export const RevenueSharing = mongoose.model('RevenueSharing', revenueSharingSchema);
