// Importing mongoose and Schema to define the structure of the Video model
import mongoose, { Schema } from "mongoose";

// Importing the pagination plugin for aggregation queries
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Defining the schema for the 'Video' collection
const videoSchema = new Schema(
  {
    // Field for the video file URL or path
    videoFile: {
      type: String, // String type as it will store the URL/path of the video
      required: true // This field is mandatory
    },
    
    // Field for the thumbnail image URL or path
    thumbnail: {
      type: String, // String type to store the URL/path of the thumbnail
      required: true // This field is mandatory
    },

    // Field for the video title
    title: {
      type: String, // String type to store the title of the video
      required: true // This field is mandatory
    },

    // Field for a short description of the video
    description: {
      type: String, // String type to store the description
      required: true // This field is mandatory
    },

    // Field for the video's duration (in seconds or minutes)
    duration: {
      type: Number, // Number type to store the duration of the video
      required: true // This field is mandatory
    },

    // Field to keep track of the number of views for the video
    views: {
      type: Number, // Number type to store the count of views
      default: 0 // Default value is 0 views when the video is first created
    },

    // Field to check if the video is published or not
    ispublished: {
      type: Boolean, // Boolean type to indicate if the video is published
      default: true // Default value is true, meaning the video is published by default
    },

    // Field for the owner of the video, referencing the User collection
    owner: {
      type: Schema.Types.ObjectId, // Stores a reference to a User document
      ref: "User" // The reference to the User collection
    }

  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Applying the pagination plugin to the videoSchema
videoSchema.plugin(mongooseAggregatePaginate);

// Exporting the Video model to be used in other parts of the application
export const Video = mongoose.model("Video", videoSchema);
