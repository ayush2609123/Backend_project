import mongoose,{Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const userSchema=new Schema(
    {
        username:{
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim:true,
            index:true, //enables searching feild
        },
        email:{
            type: String,
            require: true,
            unique: true,
            lowercase: true,
            trim:true,
        },
        fullName:{
            type: String,
            require: true,
            trim:true,
            index:true,
        },
        avatar:{
            type:String,  //cloudinary url
            required:true,
        },
        coverImage:{
            type:String,
        },
        watchHistory:[{
            type: Schema.Types.ObjectId,
            ref:"video"
        }
        ],
        password:{
            type:String,
            required:[true,"password is required"]
        },
        refreshToken:{
            type:String,
        }


    },
    {
        timestamps:true
    }
)
// ()=>{} doesnt have access of 'this'  .  No context known 
userSchema.pre("save", async function(next){
      if(!this.isModified("password")) return next();
         this.password= bcrypt.hash(this.password, 10)
         next()
})


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken = function(){
     return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullName
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
    
    )
}

// it has less information
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
    
    )
}




export const User=mongoose.model("User",userSchema)