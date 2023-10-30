import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import generateToken from '../utils/generateToken.js'

// @desc        Auth user/set token
// route        POST /api/users/auth
// @access      Public
const authUser = asyncHandler(async (req, res) => {
    // error example
    // req.status(401)
    // throw new Error('Something went wrong')
    const {discord, password} = req.body

    const user = await User.findOne({discord: discord})
    
    if (user && (await user.matchPassword(password))) {
        generateToken(res, user._id)
        res.status(201).json({
            _id: user._id,
            name: user.name,
            discord: user.discord
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
    res.status(200).json({message: "User Profile"})
})

// @desc        Update/change profile
// route        PUT /api/users
// @access      Private
const updateUserProfile = asyncHandler(async (req, res) => {
    res.status(200).json({message: "Update Profile"})
})

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile
}