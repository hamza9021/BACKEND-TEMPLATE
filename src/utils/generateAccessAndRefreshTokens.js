import { User } from "../models/user.model.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(
            500,
            "Internal Server Error While Generating Access And Refresh Token"
        );
    }
};

export { generateAccessAndRefreshTokens };
