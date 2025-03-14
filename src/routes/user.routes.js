import {Router} from "express";
import {registerUser, loginUser, logoutUser, AccessRefressToken} from "../controllers/user.controller.js"
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router=Router()

router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name: "coverImage",
        maxCount:1
    }
]),registerUser)
// http://localhost:8000/users/register

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser)

router.route("/refreshAccessToken").post(AccessRefressToken)
export default router
