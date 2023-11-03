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
        index: true
    },        
    timezone: {
        type: Number,
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

const DinoRequest = mongoose.model("DinoRequest", requestSchema)

export default DinoRequest