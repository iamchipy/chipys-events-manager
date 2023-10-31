import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

// @desc        Auth user/set token
// route        POST /api/users/auth
// @access      Public
const authUser = asyncHandler(async (req, res) => {
    const {discord, password} = req.body

    const user = await User.findOne({discord: discord})
    
    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            discord: user.discord,
            message: "login successful"
        })
    } else {
        res.status(401)
        throw new Error('Invalid credentials')
    }
})

// @desc        Register a new user
// route        POST /api/users
// @access      Public
const registerUser = asyncHandler(async (req, res) => {
    const {name, discord, password} = req.body

    const userExists = await User.findOne({discord})
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    const user = await User.create({
        name,
        discord,
        password
    })

    if (user) {
        generateToken(res, user._id)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            discord: user.discord
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data or unknown error with user creation')
    }
    console.log(user)
})

// @desc        Logout user/clear tokens?
// route        POST /api/users/logout
// @access      Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({message: "Logout successful"})
})

// @desc        Get user profile
// route        GET /api/users/profile
// @access      Private
const getUserProfile = asyncHandler(async (req, res) => {
    // console.log(req.user)
    const user = {
        _id: req.user._id,
        name: req.user.name,
        discord: req.user.discord
    }
    res.status(200).json(user)
})

// @desc        Update/change profile
// route        PUT /api/users
// @access      Private
const updateUserProfile = asyncHandler(async (req, res) => {
    let newUserInfo = {
        name: req.body.name,
        discord: req.body.discord,
        password: req.body.password
    }
    // first fetch user
    const user = await User.findById(req.user._id)
    // verify user was found
    if (user){
        // update field with the OR || op allowing easy ways to overwrite with new info
        user.name = req.body.name || user.name
        user.discord = req.body.discord || user.discord
        // if a password was provided we'll update that too
        if (req.body.password) {
            user.password = req.body.password
        }
        // now await the save
        const updatedUser = await user.save()
        res.status(202).json(updatedUser)
    }else{
        res.status(404)
        throw new Error("User not found (for profile updating)")
    }
    res.status(200).json({message: "Update Profile"})
})

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
}