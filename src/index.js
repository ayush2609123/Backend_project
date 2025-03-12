
import dotenv from "dotenv" ;
dotenv.config ({
  path: '../env'
})
import connectDB from "./db/index.js";
import { app } from "./app.js";

console.log("ACCESS_TOKEN_SECRET:", process.env.ACCESS_TOKEN_SECRET);
console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

connectDB()
  .then(() => {
    console.log("MongoDB connected!");

    // Start the server
    const PORT = process.env.PORT || 6000;
    app.listen(PORT, () => {
      console.log(`Server is running at: ${PORT}`);
    });

    // Handle server-level errors
    app.on("error", (error) => {
      console.error("Server Error:", error);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed!", err);
    process.exit(1); // Exit the application in case of a database connection failure
  });


















   
// const app=express() 

// (async()=>{
//     try{
//       await  mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//       app.on("error",(error)=>{
//         console.log("ERRR: ",error);
//         throw error
//       }
//         )
//     app.listen(process.env.PORT,()=>{
//         console.log(`App is listening on port ${process.env.PORT }`)
//     })    
//     }
//     catch(error){
//         console.error("ERROR: ",error)
//         throw error
//     }
// })()

