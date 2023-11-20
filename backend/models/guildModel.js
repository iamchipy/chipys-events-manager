import mongoose from "mongoose";

// create a dinoRequest schema for the noSQL DB to use
const guildSchema = mongoose.Schema({
    id: {
        type: String,
        required: [true, "Required"],
        unique: true,
        index: true
    }, 
    name: {
        type: String,
    },
    icon: {
        type: String,
    }, 
    breederRoleIDs: {
        type: Array
    },            
},{
    // Enables time stamping
    timestamps: true
})

const GuildMeta = mongoose.model("GuildMeta", guildSchema)

export default GuildMeta
