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
    timezoneOffset: {
        type: Number,       
    },
    startTime: {
        type: Number,
    },    
    guild: {
        type: Object,     
        index: true          
    }, 
    status: {
        type: String,     
        default: "Scheduled"  
    },        
    note: {
        type: String,    
        default: "Just a normal day"   
    },   
    capacity: {
        type: Number,
        default: 1
    },
    webhook: {
        type: String,
        default: ""
    }     ,
    announcement: {
        type: String,
        default: ""
    }                 
},{
    // Enables time stamping
    timestamps: true
})

const Event = mongoose.model("Event", eventSchema)

export default Event