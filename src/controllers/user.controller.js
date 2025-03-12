import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Token Generation Function
import jwt from "jsonwebtoken";
import { response } from "express";

try {
    const token = jwt.sign({ test: "hello" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    console.log("Test Token:", token);
} catch (err) {
    console.error("JWT Token Test Error:", err);
}

const genAccessTokandRefreshTok = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new ApiError(404, "User not found for token generation");
        }

        const AccessToken = user.generateAccessToken();
        const RefreshToken = user.generateRefreshToken();

        user.refreshToken = RefreshToken;
        await user.save({ validateBeforeSave: false });

        return { AccessToken, RefreshToken };
    } catch (error) {
        console.error("Token generation error:", error);
        throw new ApiError(500, "Error in refresh token or access token generation");
    }
};
console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);


// User Registration
export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validate required fields
    if ([fullName, email, username, password].some((field) => !field?.trim())) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        throw new ApiError(400, "Invalid email format");
    }

    // Check if user already exists
    const existingUser = await User.findOne({
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // Handle uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar to Cloudinary");
    }

    // Create user
    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    const createdUser = await User.findById(user._id).select("-password -RefreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(new ApiResponse(201, createdUser, "User registered successfully"));
});

// User Login
export const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    const findUser = await User.findOne({
        $or: [{ username }, { email }],
    });

    if (!findUser) {
        throw new ApiError(404, "User not found");
    }

    // Validate password
    const isPasswordValid = await findUser.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate tokens
    const { AccessToken, RefreshToken } = await genAccessTokandRefreshTok(findUser._id);

    // Cookie options
    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    const loggedInUser = await User.findById(findUser._id).select("-password -RefreshToken");

    return res
        .status(200)
        .cookie("accessToken", AccessToken, options)
        .cookie("refreshToken", RefreshToken, options)
        .json(new ApiResponse(200, { user: loggedInUser, AccessToken, RefreshToken }, "User logged in successfully"));
});

// User Logout
export const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { RefreshToken: "" } }, { new: true });

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    };

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// User asked for New Access Token
export const AccessRefressToken= asyncHandler( async(req,res)=>{
     const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken
     if(!incomingRefreshToken){
        throw new ApiError(401,"unauthroised request")
     }
     try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user= await User.findById(decodedToken?._id);
        if(!user){
           throw new ApiError(401,"inValid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
           throw new ApiError(401,"refresh token is expire or used")
        }
   
        const options={
           httpOnly:true,
           secure: true
        }
        const {accessToken, newrefreshToken}=  await genAccessTokandRefreshTok(user._id)
   
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken",newrefreshToken , options)
        .json(
           new ApiResponse(
               200,
               {accessToken,refreshToken:newrefreshToken},
               "access token refreshed succesfully"
           )
        )
     } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
     }
})