import mongoose from "mongoose";

// create a dinoRequest schema for the noSQL DB to use
const requestSchema = mongoose.Schema({
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
        index: true,
        default: {
            name: "default",
            id: ""
        }
    },        
    timezone: {
        type: Number,
        lowercase: true,         
    },
    guild: {
        type: Object,       
    }, 
    status: {
        type: String,     
        default: "Pending"    
    },        
    note: {
        type: String,    
        default: ""   
    },                
},{
    // Enables time stamping
    timestamps: true
})

const DinoRequest = mongoose.model("DinoRequest", requestSchema)

export default DinoRequest