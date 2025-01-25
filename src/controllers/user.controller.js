import wrapperFunction from "../utils/asyncWrap.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../services/cloudinary.js";
import { generateAccessAndRefreshTokens } from "../utils/generateAccessAndRefreshTokens.js";
import jwt from "jsonwebtoken";

const registerUser = wrapperFunction(async (req, res, next) => {
    console.log(req.body);
    const { fullName, email, userName, password } = req.body;

    if (!fullName || !email || !userName || !password) {
        throw new ApiError(400, "Field Should Not Be Empty");
    }

    if (await User.findOne({ $or: [{ userName }, { email }] })) {
        throw new ApiError(409, "User Already Exists");
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Should Be Required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log(avatar);

    if (!avatar) {
        throw new ApiError(400, "Avatar is not uploaded on cloud");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullName,
        email,
        userName,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Server Is Not Responding");
    }

    return res
        .status(201)
        .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const loginUser = wrapperFunction(async (req, res) => {
    console.log(req.body);
    const { email, userName, password } = req.body;
    if (!userName || !email || !password) {
        throw new ApiError(400, "Please Give The Required Fields");
    }

    const user = await User.findOne({ $or: [{ userName }, { email }] });

    if (!user) {
        throw new ApiError(400, "User Doesnot exists Please SignUp First");
    }

    const isPasswordValidate = await user.isPasswordMatch(password);

    if (!isPasswordValidate) {
        throw new ApiError(400, "Please Enter Correct Password");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
        user._id
    );

    const updatedUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: updatedUser, accessToken, refreshToken },
                "User Logged In Successfully"
            )
        );
});

const logoutUser = wrapperFunction(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { refreshToken: undefined },
        },
        { new: true }
    );

    const cookieOptions = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(200, {}, "User Logout Successfully");
});

const refreshAccessToken = wrapperFunction(async (req, res) => {
    try {
        const incomingRefreshToken =
            req.cookies.refreshToken || req.body.refreshToken;
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Cannot Found Refresh Token");
        }

        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (!decodedToken) {
            throw new ApiError(401, "Invalid Refresh Token");
        }

        const user = await User.findById(decodedToken._id);

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token Is Expired");
        }

        const cookieOptions = { httpOnly: true, secure: true };

        const { refreshToken, accessToken } = generateAccessAndRefreshTokens();

        res.status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(
                200,
                { refreshToken, accessToken },
                "Access Token Refresh Successfully"
            );
    } catch (error) {
        throw new ApiError(401, error?.message);
    }
});

const changeCurrentPassword = wrapperFunction(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!(oldPassword && newPassword)) {
        throw new ApiError(404, "Field Should Not Be Empty");
    }

    const user = await User.findById(req.user._id);
    const isPasswordCorrect = user.isPasswordMatch(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(404, "Incorrect Password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password Changes Successfully"));
});

const getCurrectUser = wrapperFunction(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "Current User Fetched Successfully")
        );
});

const updateUserAccountDetail = wrapperFunction(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new ApiError(404, "Please Provide All Necessary Fields");
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { fullName, email },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User Updated Successfully"));
});

const updateUserAvatar = wrapperFunction(async (req, res) => {
    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(404, "Avatar Not Found");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar.url) {
        throw new ApiError(400, "Error While Uploading On Cloud");
    }

    //DELETE OLD IMAGE FROM CLOUDINARY

    const user = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    ).select("-password");

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"));
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrectUser,
    updateUserAccountDetail,
    updateUserAvatar,
};
