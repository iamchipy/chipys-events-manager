import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next)=> {
    let token = req.cookies.jwt
    //TODO add additional tiers for Discord auth and Admins

    if (token){
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            // fetches the request with .select helping avoid password slipping
            req.user = await User.findById(decoded.userId).select("-password")
            next()
        }catch (error){
            res.status(403)
            throw new Error("Restricted, invalid token")
        }
    }else{
        res.status(403)
        throw new Error("Restricted, missing token")
    }
})

export { protect }