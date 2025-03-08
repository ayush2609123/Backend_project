import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const genAccessTokandRefreshTok=async(userId){
    try {
        const user=await User.findById(userId);
        const AccessToken=user.generateAccessToken();
        const RefreshToken=user.generateRefreshToken();

        user.RefreshToken=RefreshToken;
        await user.save({validateBeforeSave: false})

        return {AccessToken,RefreshToken}

    } catch (error) {
        throw new ApiError(500,"error in refresh token or access token")
    }
}

export const registerUser = asyncHandler(async (req, res) => {
    const { fullName, email, username, password } = req.body;

    // Validation - all fields are required
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
        $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }]
    });
    // either email or username
    if (existingUser) {
        throw new ApiError(409, "User already exists");
    }

    // Handle uploaded files
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload files to Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    let coverImage = null;

    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    // Create new user
    const user = await User.create({
        fullName,
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password, // Ensure hashing password before saving
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // Fetch created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );
});
 
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const loginUser = asyncHandler(async (req, res) => {

   // req body-> data
   // username or email
   // find username or email
   // check password
   // generate access and Refresh token
   // send cookie
   // give response login succesfull





    const { email, username ,password } = req.body;

    // Check if both fields are provided

    if( !username || !email){
        throw new ApiError(400, "username or email is required");
    }
    const findUser= await User.findOne({
        $or: [{username},{email}]
    })
    
    if (!findUser) {
        throw new ApiError(404, "User not found");
    }
     
    // Compare the password
    const isPasswordValid = await findUser.isPasswordCorrect(password);
 

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    // Generate JWT token
    const {accestoken, refrestoken} = await genAccessTokandRefreshTok(user._id)

    // send in cookies

    res.status(200).json({ message: "Login successful", token });
});

