import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'
import DinoRequest from '../models/requestModel.js'
import generateToken from '../utils/generateToken.js'
import Event from '../models/eventModel.js'
import GuildMeta from '../models/guildModel.js'

// variables for standard
// Is is stored here AND a frontend copy in "FilterPresets.jsx"
const INCOMPLETE_STATES = { $nin: ["Completed", "DeletedByUser", "DeletedByBreeder"] }


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
    const userFilter = { id: req.body.id }
    let newUser = null
    let updatedUserValues = null

    // handle our three cases
    // 1 - new user
    // 2 - update user
    // 3 - get user (info only)
    const userExists = await User.findOne(userFilter)
    if (userExists != null) {
        // console.log(Object.keys(req.body))
        // console.log(Object.keys(req.body).length)
        // console.log(Object.keys(req.body).length <= 1)

        if (Object.keys(req.body).length <= 1) {
            // then we are only returning the existing user's info
            console.log(`Returning ${userExists.global_name}'s info`)
            res.status(200).json(userExists)
            return
        }
        console.log("Attempting to update user")
        updatedUserValues = await User.findOneAndUpdate(userFilter, req.body)
            .then(result => {
                if ("error" in result) {
                    console.log("result.error")
                    console.log(result.error)
                    result.status(400)
                    throw new Error(`Failed to update user ${req.body.id}`)
                }
                console.log(`${result.global_name} profile updated`)
                generateToken(res, result.id + result.token)
                res.status(200).json(result)
            }).catch(e => { console.error(e) })
    } else {
        console.log("Attempting to create new user")
        newUser = await User.create(req.body)
            .then(result => {
                if (result.error) {
                    console.log("result.error")
                    console.log(result.error)
                    result.status(400)
                    throw new Error(`Failed to create user ${req.body.id}`)
                }
                // console.log(result)
                console.log(`${result.global_name} profile created`)
                generateToken(res, result.id + result.token)
                res.status(201).json(result)
            }).catch(e => { console.error(e) })
    }
})

// @desc        Get multiple user profiles
// route        GET /api/users/profiles/:global_name
// @access      Private
const getUserProfiles = asyncHandler(async (req, res) => {
    console.warn("getUserProfiles:")
    try {
        const filter = { global_name: RegExp(req.params.global_name, "i") }
        console.info(filter)

        await User.find(filter)
            .then(result => {
                // console.log("result:")
                // console.log(result)
                if ("error" in result) {
                    console.error("getUserProfiles ERROR")
                    console.error(result.error)
                    res.status(501).json(result.error)
                }
                // console.log("result")
                // console.log(result)
                // console.log(result[0])
                if (result.length < 1) {
                    console.log("404")
                    res.status(404).json({ error: 404, Message: "No matching users found." })
                } else {
                    console.log(`Found ${result.length} matches`)
                    res.status(200).json(result)
                }
            })
    } catch (err) {
        console.error(err)
    }
})

// @desc        Update/change profile
// route        PUT /api/users/profile
// @access      Private
const updateUserProfile = asyncHandler(async (req, res) => {
    // console.warn(req.body.id)
    console.warn("RECEIVED PROFILE UPDATE VALUES")
    console.warn(req.body)

    // first fetch user
    await User.findOneAndUpdate({ id: req.body.id }, req.body)
        .then(result => {
            // console.warn(result)
            if (result == null || "error" in result) {
                res.status(400).json(`No user matching '${req.body.id}' found`)
            } else {
                res.status(202).json(result)
            }
        }).catch(error => {
            console.error(error)
            res.status(501).json(error)
        })
})

// @desc        Logout user/clear tokens?
// route        POST /api/users/logout
// @access      Public
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0)
    })
    res.status(200).json({ message: "Logout successful" })
})

// @desc        Fetches all events and applies a filter
// route        PUT /api/users/eventsByFilter
// @access      Private
const eventsByFilter = asyncHandler(async (req, res) => {
    // console.log(`eventsByFilter: ${req.body.filter}`)
    // console.log(req.body.filter)

    // filter 
    const filter = req.body.filter

    // console.log(`fetchPending: ${req.body.userInfo.global_name}`)
    // lookup pending and completed requests matching user
    const eventsScheduled = await Event.find(filter)
    // console.log(`results: ${requestPending}`)


    // return requests
    if (eventsScheduled[0] === undefined) {
        res.status(404).json(`Message: No requests matching filter`)
    } else {
        res.status(200).json(eventsScheduled)
    }
})

// @desc        Update existing event
// route        PUT /api/users/eventUpdate
// @access      Private
// Accepts      Single object with ._id & .updatedValue {obj}
const eventUpdate = asyncHandler(async (req, res) => {
    console.warn("RECEIVED EVENT UPDATE VALUES")
    // console.warn(req.body)

    const filter = { _id: req.body._id }
    console.warn(filter)
    console.warn(req.body.updatedValue)

    // first fetch user
    await Event.findOneAndUpdate(filter, req.body.updatedValue)
        .then(result => {
            // console.warn(result)
            if ("error" in result) {
                res.status(400).json("unknown error when updating event ")
            } else {
                res.status(202).json(result)
            }
        }).catch(error => {
            console.error(error)
            res.status(501).json(error)
        })
})

// @desc        Creates a new event
// route        POST /api/users/eventCreate
// @access      Private
const eventCreate = asyncHandler(async (req, res) => {
    // console.warn(JSON.stringify(req.body))
    console.log("eventCreate initiated")
    // const userFilter = {id: req.body.id}

    if (!("dino" in req.body) || req.body.dino == ""){
        res.status(422).json("Dino selection required to create event")
        return        
    }

    //TODO somewhere in this function we are double setting HTTPS Request Headers after they are sent
    createdEvent = await Event.create(req.body)
    .then(result => {
        console.log(result)
        if (result == null || "error" in result) {
            console.log("result.error")
            console.log(result.error)
            result.status(400)
            return
        }
        // console.log(result)
        console.log(`Event Created`)
        res.status(201).json(result)
        return
    }).catch(e => { 
        if (e.errors.dino.properties.type == "required" &&
            e.errors.dino.properties.path == "dino"){
            // THIS SHOULDN"T be possible due to front loaded validations that were added
            res.status(422).json("Dino required to create event")
            return
        }
        console.error(e) 
    })
    res.status(599).json("Unknown error")
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
    if (listOfRequestedDinos.length < 1) {
        console.log("New request was blank")
        res.status(400).json({ Mesage: "Likely a blank dino name in the request" })
        return
    }

    // function for converting list of dinos into a list of promises 
    function checkForDuplicate(dino) {
        const filter = {
            status: INCOMPLETE_STATES,
            dino: dino,
            id: req.body.userInfo.id,
            guild: req.body.userInfo.guilds[req.body.userInfo.guild]
        }
        // console.log(`Promise filter: "${dino}"`)
        // .exec() returns the result in a promise
        return DinoRequest.find(filter).exec()
    }

    // console.log("building promise array")
    // Map those with the function
    let promisesOfRequestedDions = listOfRequestedDinos.map(dino => checkForDuplicate(dino));

    // console.log(promises)
    // console.log("starting promise stack")

    // Now run the promises together and wait for all to resolve
    Promise.all(promisesOfRequestedDions)
        .then(isDuplicateCheckResults => {
            // Check for empty objects (confirm if duplicated found)
            isDuplicateCheckResults.forEach((listOfMatchingRequests, index) => {
                // console.log("idDuplicateResult")
                // console.log(listOfMatchingRequests)
                // we get back a list of dinos that match this dino name/user/guild/pending so might be more
                if (listOfMatchingRequests[0] !== undefined && "dino" in listOfMatchingRequests[0]) {
                    const warningString = `Duplicated ${listOfMatchingRequests[0].dino} request!`
                    console.warn(warningString)
                    duplicates.push(listOfMatchingRequests[index].dino)
                    // res.status(400).json({message: warningString})
                } else {
                    // else if not a duplicate we create this request
                    // we'll know which dino it is by the index of request ourder
                    DinoRequest.create({
                        id: req.body.userInfo.id,
                        dino: listOfRequestedDinos[index],
                        status: "Pending",
                        guild: req.body.userInfo.guilds[req.body.userInfo.guild],
                        global_name: req.body.userInfo.global_name
                    }).then(result2 => {
                        console.log(`Creating ${listOfRequestedDinos[index]} request`)
                    })
                }
            })

            if (duplicates.length < listOfRequestedDinos.length ) {
                res.status(201).json({ message: `Duplicates ${duplicates}` })
            } else {
                
                res.status(412).json({ message: `Duplicate request(s) ${duplicates}` })
            }
        })
        .catch(error => {
            // LOG ERRORS 
            console.error("Promise stack error")
            console.error(error)
        })
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
    if (requestPending[0] === undefined || requestPending.length < 1) {
        res.status(404).json({ Message: `No requests found for ${req.body.userInfo.global_name}` })
    } else {
        res.status(200).json(requestPending)
    }
})

// @desc        Get user's pending requests for any user of a guild
// route        PUT /api/users/fetchPendingByFilter
// @access      Private
const fetchPendingByFilter = asyncHandler(async (req, res) => {
    // console.log(`fetchPendingByFilter: ${req.body.userInfo.id}`)
    // console.log(`fetchPendingByFilter:`)
    // console.log(req.body.filter)
    // filter 
    const filter = req.body.filter
    // console.log(`fetchPending: ${req.body.userInfo.global_name}`)
    // lookup pending and completed requests matching user
    const request = await DinoRequest.find(filter)
    // console.log(`results: ${requestPending}`)


    // return requests
    if (request[0] === undefined) {
        res.status(404).json()
    } else {
        res.status(200).json(request)
    }
})

// @desc        Update a dino request
// route        PUT /api/users/updateRequest
// @access      Private
// requires     selectedRequest should be in the body (type DinoRequest Model Obj)
const updateRequest = asyncHandler(async (req, res) => {
    try {
        console.warn(req.body)
        const filter = {
            _id: req.body.selectedRequest._id
        }
        const updatedValue = req.body.updatedValue
        const verification = await DinoRequest.findOneAndUpdate(filter, updatedValue)

        // console.warn(JSON.stringify(verification))
        // return requests
        if (verification === undefined) {
            res.status(400).json(`Message: No requests found for ${req.body.userInfo.global_name} :: ${filter}`)
        } else {

            res.status(200).json(verification)
        }
    } catch (err) {
        console.error("updateRequest:")
        console.error(err)
    }
})

// @desc        Update/change guild meta data
// route        PUT /api/users/updateGuild
// @access      Private
const updateGuildMeta = asyncHandler(async (req, res) => {
    // we handle create/update/query of guilds all here in one
    // query only has a filter in the body
    // others will have more
    let toCreateGuild = false
    const filter = req.body.filter
    const updatedValues = req.body.updatedValues
    console.warn("updateGuildMeta")
    console.info(req.body)

    // case where we have no updatedValues 
    if (updatedValues === null || updatedValues == undefined) {
        console.log("Searching for guild...")
        const foundGuild = await GuildMeta.findOne(filter)
        // if no guild is found create one or return the results found
        if (foundGuild === null || "error" in foundGuild) {
            console.log("Creating guild")
            const createdGuild = await GuildMeta.create(filter)
            console.log(createdGuild)
            res.status(201).json(createdGuild)
            return
        } else {
            console.log("Returning guild info")
            console.log(foundGuild)
            res.status(200).json(foundGuild)
            return
        }
    }

    // have a updatedValues and nothing is found 
    const updatedGuild = await GuildMeta.findOneAndUpdate(filter, updatedValues)
    if (updatedGuild == null || "error" in updatedGuild) {
        console.log("Creating guild")
        const createdGuild = await GuildMeta.create({ ...filter, ...updatedValues })
        console.log(createdGuild)
        res.status(201).json(createdGuild)
        return
    } else {
        console.log("ModifiedResult:")
        console.log(updatedGuild)
        res.status(202).json(updatedGuild)
        return
    }
})

// @desc        get the info of a guild
// route        PUT /api/users/updateGuild
// @access      Private
const getGuildMeta = asyncHandler(async (req, res) => {
    console.warn("getGuildMeta:")
    try {
        const filter = { global_name: RegExp(req.params.global_name, "i") }
        console.info(filter)

        await GuildMeta.find(filter)
            .then(result => {
                // console.log("result:")
                // console.log(result)
                if ("error" in result) {
                    console.error("getGuildMeta ERROR")
                    console.error(result.error)
                    res.status(501).json(result.error)
                }
                // console.log("result")
                // console.log(result)
                // console.log(result[0])
                if (result.length < 1) {
                    console.log("404")
                    res.status(404).json({ error: 404, Message: "No matching guild found." })
                } else {
                    console.log(`Found ${result.length} matches`)
                    res.status(200).json(result)
                }
            })
    } catch (err) {
        console.error(err)
    }
})

export {
    authUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    requestDino,
    fetchPending,
    updateRequest,
    fetchPendingByFilter,
    eventCreate,
    eventUpdate,
    eventsByFilter,
    getUserProfiles,
    updateGuildMeta,
    getGuildMeta,

}