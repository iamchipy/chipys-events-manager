import mongoose from "mongoose";

// modal for breeding events scheduled by breeders
const eventSchema = mongoose.Schema({
    id: {
        type: String,
        required: [true, "Required"],
        index: true
    }, 
    global_name: {
        type: String,
    },
    dino: {
        type: String,
        required: [true, "Required"],
        index: true
    },        
    timezone: {
        type: Number,
        lowercase: true,         
    },
    time: {
        type: time,
        lowercase: true,         
    },
    date: {
        type: date,
        lowercase: true,         
    },        
    guild: {
        type: String,       
    }, 
    status: {
        type: String,       
    },        
    note: {
        type: String,       
    },                
},{
    // Enables time stamping
    timestamps: true
})

const Event = mongoose.model("Event", eventSchema)

export default Event