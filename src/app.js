import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
const app=express();

app.use(cors({
    origin: process.env.CORS_ORIGIN

}))

app.use(express.json({limit:"16kb"}))
// ayush%20kushwaha...
app.use(express.urlencoded({extended: true,limit:"16kb"}))
app.use(express.static("public"))
app.use(cookieParser()) // we can access cookies and perform CRUD operation on these cookies


export { app }