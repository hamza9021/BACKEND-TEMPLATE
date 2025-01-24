import mongoose, { Schema, model } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

const userSchema = new Schema(
    {
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            },
        ],
        userName: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true, //FOR BETTER SEARCH
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true, //FOR BETTER SEARCH
        },

        fullName: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        password: {
            type: String,
            minlength: 8,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

userSchema.pre("save", async function (next) {
    try {
        if (this.isModified("password")) {
            this.password = await bcrypt.hash(this.password, 10);
        }
        next();
    } catch (error) {
        next(error);
    }
});

userSchema.methods.isPasswordMatch = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, fullName: this.fullName },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        { _id: this._id, email: this.email, fullName: this.fullName },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};

export const User = model("User", userSchema);
