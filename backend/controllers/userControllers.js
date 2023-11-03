import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import DinoRequest from '../models/requestModel.js'
import generateToken from '../utils/generateToken.js'
import e from 'express'

// variables for standard
const INCOMPLETE_STATES = {$nin:["Completed","DeletedByUser"]}

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
    // console.warn(JSON.stringify(req.body))
    console.warn("registerUser initiated")
    const userFilter = {id: req.body.id}
    let newUser = null
    let updatedUserValues = null

    // Check if user is new (if not update user)
    const userExists = await User.findOne(userFilter)
    if (userExists) {
        console.log("Attempting to update user")
        updatedUserValues = await User.findOneAndUpdate(userFilter, req.body)
            .then(result => {
                if (result.error){
                    console.log("result.error")
                    console.log(result.error)
                    result.status(400)
                    throw new Error(`Failed to update user ${req.body.id}`)                    
                }
                console.log(`${result.global_name} profile updated`)
                res.status(200).json(result)    
                generateToken(res, result.id)            
            }).catch( e=> {console.error(e)})
    }else{
        console.log("Attempting to create new user")
        newUser = await User.create(req.body)
            .then(result=>{
                if (result.error){
                    console.log("result.error")
                    console.log(result.error)
                    result.status(400)
                    throw new Error(`Failed to create user ${req.body.id}`)     
                }
                // console.log(result)
                console.log(`${result.global_name} profile created`)
                res.status(201).json(result)      
                generateToken(res, result.id)  
            }).catch( e=> {console.error(e)})
    }
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
    console.log(req.body.userInfo)
    const user = await User.findOne({id:req.body.id})
    res.status(200).json(user)
})

// @desc        Update/change profile
// route        PUT /api/users/profile
// @access      Private
const updateUserProfile = asyncHandler(async (req, res) => {
    // console.warn(req.body.id)
    // console.warn("RECEIVED PROFILE UPDATE VALUES")
    // console.warn(req.body)

    // first fetch user
    const updatedUser = await User.findOneAndUpdate({id:req.body.id},req.body)

    // verify user was found
    if (updatedUser){
        res.status(202).json(updatedUser)
    }else{
        res.status(404)
        throw new Error("User not found (for profile updating)")
    }
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
            status: INCOMPLETE_STATES,
            dino: dino,
            id: req.body.userInfo.id,
            guild: req.body.userInfo.guild
        }
        // run query for the data
        const requestExists = await DinoRequest.find(filter)
        // check for duplicate entries or previous non-complete requests
        if (requestExists[0] !== undefined) {
            // console.log(`Found DUPLICATE request for ${dino}`)
            // console.log(`Found DUPLICATES: ${requestExists}`)
            duplicates.push(dino)
        }else {
            // submit new dino request entry
            console.log(`Creating ${dino} for ${userName}`)
            console.log(req.body.userInfo)
            await DinoRequest.create({
                id: req.body.userInfo.id,
                dino: dino,
                status: "Pending",
                guild: req.body.userInfo.guild,
                global_name: req.body.userInfo.global_name
            })
        }
    })
 
    // run status check
    if (duplicates.length < 1) {
        res.status(200).json({message: "Requests logged"})
    }else{
        console.log(`Duplicates (ignored): ${duplicates}`)
        //TODO loop back and build a proper wait into this as right now it's ALWAYS returns
        //s200 due to Async causing loops to find duplicatesAFTER 200 response completes
        res.status(400).json({message: `Duplicate request(s) for ${duplicates}`})
    }
})
 
// @desc        Get user's pending requests
// route        PUT /api/users/fetchPending
// @access      Private
const fetchPending = asyncHandler(async (req, res) => {    
    // console.log(`fetchPending: ${req.body.userInfo.id}`)
    // filter 
    const filter = {
        status: INCOMPLETE_STATES,
        id: req.body.userInfo.id
    }    
    // console.log(`fetchPending: ${req.body.userInfo.global_name}`)
    // lookup pending and completed requests matching user
    const requestPending = await DinoRequest.find(filter)
    // console.log(`results: ${requestPending}`)

    // return requests
    if (requestPending[0] === undefined){
        res.status(400).json(`Message: No requests found for ${req.body.userInfo.global_name}`)
    } else {
        res.status(200).json(requestPending)
    }
})

// @desc        Get user's pending requests for any user of a guild
// route        PUT /api/users/fetchPendingByFilter
// @access      Private
const fetchPendingByFilter = asyncHandler(async (req, res) => {    
    // console.log(`fetchPendingByFilter: ${req.body.userInfo.id}`)
    // console.log(`fetchPendingByFilter: ${req.body.filter}`)
    // console.log(req.body.filter)
    // filter 
    const filter = req.body.filter
    // console.log(`fetchPending: ${req.body.userInfo.global_name}`)
    // lookup pending and completed requests matching user
    const requestPending = await DinoRequest.find(filter)
    // console.log(`results: ${requestPending}`)

    // return requests
    if (requestPending[0] === undefined){
        res.status(404).json(`Message: No requests matching filter`)
    } else {
        res.status(200).json(requestPending)
    }
})

// @desc        Update a dino request
// route        PUT /api/users/updateRequest
// @access      Private
const updateRequest = asyncHandler(async (req, res) => {    
    // console.warn(JSON.stringify(req.body))
    const filter = {
        _id: req.body.selectedRequest._id
    }
    const updatedValue = req.body.updatedValue
    const verification = await DinoRequest.findOneAndUpdate(filter, updatedValue)

    // console.warn(JSON.stringify(verification))
    // return requests
    if (verification === undefined){
        res.status(400).json(`Message: No requests found for ${req.body.userInfo.global_name} :: ${filter}`)
    } else {
        res.status(200).json(verification)
    }
})

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    requestDino,
    fetchPending,
    updateRequest,
    fetchPendingByFilter
}