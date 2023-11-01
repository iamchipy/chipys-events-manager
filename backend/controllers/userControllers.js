import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import DinoRequest from '../models/requestModel.js'
import generateToken from '../utils/generateToken.js'

// @desc        Auth user get/set token
// route        POST /api/users/auth
// @access      Public
const authUser = asyncHandler(async (req, res) => {
    // changing over to Discord OAuth only
    // const {discord, password} = req.body

    // const user = await User.findOne({discord: discord})
    
    // if (user && (await user.matchPassword(password))) {
    //     generateToken(res, user.id)
    //     res.status(201).json({
    //         id: user.id,
    //         name: user.name,
    //         discord: user.discord,
    //         message: "login successful"
    //     })
    // } else {
    //     res.status(401)
    //     throw new Error('Invalid credentials')
    // }

    const devDiscordOAuthURI = "https://discord.com/api/oauth2/authorize?client_id=1168939215367721021&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Foauth&response_type=token&scope=identify%20guilds"
    const prodDiscordOAuthURI = "https://discord.com/api/oauth2/authorize?client_id=1168939215367721021&redirect_uri=https%3A%2F%2Fbreeding.chipy.dev%2Foauth&response_type=token&scope=identify%20guilds"
    // pick dev or production urls depending on ENV variable
    OAuthURL = process.env.NODE_ENV === "production" ? prodDiscordOAuthURI : devDiscordOAuthURI
    // not sure how to get URL redirects working from here of it that is even a good way to do it
    //TODO build a URL redirect to Discord Auth if users arrive here without it, then tokenize it 

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
        generateToken(res, user.id)
        res.status(201).json({
            id: user.id,
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
        id: req.user.id,
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
    const user = await User.findById(req.user.id)
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

// @desc        Request dino for user
// route        POST /api/request
// @access      Private
const requestDino = asyncHandler(async (req, res) => {
    // load data into reader friendly variables
    const listOfRequestedDinos = req.body.multiSelections
    const userName = req.body.userInfo.global_name
    let duplicates = []

    console.log(`${userName} is requesting: [${listOfRequestedDinos}]`)


    // loop for each dino is the request list
    listOfRequestedDinos.forEach(async (dino) => {
        // build filter for this user/dino/non-completed
        const filter = {
            status: {$ne:"Completed"},
            dino: dino,
            id: req.body.userInfo.id
        }
        // run query for the data
        const requestExists = await DinoRequest.find(filter)
        // check for duplicate entries or previous non-complete requests
        if (requestExists[0] !== undefined) {
            console.log(`Found DUPLICATE request for ${dino}`)
            // console.log(`Found DUPLICATES: ${requestExists}`)
            duplicates.push(dino)
        }else {
            // submit new dino request entry
            console.log(`Creating ${dino} for ${userName}`)
            await DinoRequest.create({
                id: req.body.userInfo.id,
                dino: dino,
                status: "Pending",
                global_name: req.body.userInfo.global_name
            })
        }
    })
 
    console.log(duplicates)
    // run status check
    if (duplicates.length < 1) {
        res.status(200).json({message: "Requests logged"})
    }else{
        //TODO loop back and build a proper wait into this as right now it's ALWAYS returns
        //s200 due to Async causing loops to find duplicatesAFTER 200 response completes
        res.status(400).json({message: `Duplicate request(s) for ${duplicates}`})
    }
    
})
 
export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    requestDino
}