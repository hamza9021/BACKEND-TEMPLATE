import { ApiError } from "../utils/ApiError.js";
import wrapperFunction from "../utils/asyncWrap.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const verifyJWT = wrapperFunction(async (req, _, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized Token");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        );

        if (!user) {
            throw new ApiError(401, "Invalid Token");
        }

        req.user = user;

        next();
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Access To Token");
    }
});

export { verifyJWT };
