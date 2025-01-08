import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
 
cloudinary.config({ 
    // cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    // api_key: process.env.CLOUDINARY_API_KEY, 
    // api_secret: process.env.CLOUDINARY_API_SECRET
    cloud_name: "djbaxxzqa", 
    api_key:"497557787677559", 
    api_secret: "oogToKs2RplMKOs3ePGiLXWqFcY"
});

const uploadOnCloudinary=async(localFilePath)=>{
      
      try{
           if(!localFilePath){
            return null
           }
           const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
           })
           //file has been uploaded successfull
           console.log("file is uploaded on cloudinary",response.url);
           return response
      }   
      catch(error){
         fs.unlinkSync(localFilePath)   // remove the locally saved 
         //temporary file as the upload option got failed
         return null;

      }
}

export {uploadOnCloudinary}