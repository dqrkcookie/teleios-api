import mongoose from "mongoose";

const detectionSchema = new mongoose.Schema({
    objectType: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    timeStamp: {
        type: mongoose.Schema.Types.Date,
        default: Date.now
    },
    cameraType: {
        type: mongoose.Schema.Types.String
    }
})

const Detection = mongoose.model("Detection", detectionSchema);

export default Detection;