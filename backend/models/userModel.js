import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

// create a user schema for the noSQL DB to use
const userSchema = mongoose.Schema({
    name: {
        type: String
    },
    discord: {
        type: String,
        required: true,
        unique: true
    },    
    password: {
        type: String,
        required: true
    }
},{
    // Enables time stamping
    timestamps: true
})

// add bcrypt middleware with the .pre() function to do something before saving if the password was mod
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    const salt = await bcrypt.genSalt()
    this.password = await bcrypt.hash(this.password, salt)
})

// add email compare method (like a function) from bcrypt
// again we are using async so "phat arrow ()=>{} isn't used"
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model("User", userSchema)

export default User