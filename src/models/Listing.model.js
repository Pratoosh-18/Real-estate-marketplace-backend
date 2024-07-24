import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
    {
        ownerName: {
            type: String,
            required: true,
        },
        ownerEmail: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        regularPrice: {
            type: Number,
            required: true,
        },
        discountPrice: {
            type: Number,
            required: true,
        },
        bathrooms: {
            type: Number,
            required: true,
        },
        bedrooms: {
            type: Number,
            required: true,
        },
        furnished: {
            type: Boolean,
            required: true,
        },
        parking: {
            type: Boolean,
            required: true,
        },
        imageUrls: {
            type: Array,
            required: true,
        },
        isSold: {
            type: Boolean,
            default: false
        },
        buyerEmail: {
            type: String,
        }
    },
    { timestamps: true }
);

export const Listing = mongoose.model("Listing", listingSchema);
