import mongoose from "mongoose";


// create a user schema for the noSQL DB to use
const userSchema = mongoose.Schema({
    id: {
        type: String,
        required: [true, "Required"],
        unique: true,
        index: true
    },    
    role: {
        type: String,
        lowercase: true,    
        default: "user",     
    },
    guild: {
        type: String,    
        default: ""   
    },    
    guilds: {
        type: mongoose.Schema.Types.Mixed,   
        default: "none"      
    },        
    guildRoles: {
        // list of roles in currently selected guild
        type: Array,
        default:  [""]
    },
    guildAdmins: {
        // list of guilds that user has been given super admin to
        type: Array,
        default: [""]
    },    
    note: {
        type: String,   
        default: "none"    
    },  
    avatar: {
        type: String,       
    },      
    discriminator: {
        type: String,       
    },     
    global_name: {
        type: String,     
        default: "unregistered"     
    },    
    username: {
        type: String,     
        default: "unregistered"     
    }, 
    token: {
        type: String,     
        default: null
    },               
    locale: {
        type: String,       
    },     
    timeOpen: {
        type: Number,
        default: 0
    },  
    timeClose: {
        type: Number,
        default: 0
    },       
    timezoneOffset: {
        type: Number,    
        default: 0   
    },        
},{
    // Enables time stamping
    timestamps: true
})

// // add bcrypt middleware with the .pre() function to do something before saving if the password was mod
// userSchema.pre('save', async function (next) {
//     if (!this.isModified('password')) {
//         next()
//     }
//     const salt = await bcrypt.genSalt()
//     this.password = await bcrypt.hash(this.password, salt)
// })

// // add email compare method (like a function) from bcrypt
// // again we are using async so "phat arrow ()=>{} isn't used"
// userSchema.methods.matchPassword = async function (enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password)
// }

const User = mongoose.model("User", userSchema)

export default User