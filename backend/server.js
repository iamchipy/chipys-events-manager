// backend / server entry point
import express from 'express'
import path from 'path'
// Import .ENV and set it as config
import dotenv from 'dotenv'
dotenv.config()
// import middleware custom errors
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
// import middleware cookie-parser for protecting routes
import cookieParser from 'cookie-parser';
// import DB stuff for use and assign it
import connectDB from './config/db.js'
connectDB()

// set the port using the ENV
const port = process.env.PORT || 3000;

// import the routes
import userRoutes from './routes/userRoutes.js'

// Define the base Express app
const app = express()

// this lets us use JSON data and also URL encoded data
app.use(express.json())
app.use(express.urlencoded({extended: true}))

// this lets us use cookie parsing in express app
app.use(cookieParser())

// routes / endpoints
app.use('/api/users', userRoutes)
if (process.env.NODE_ENV === "production") {
    const __dirname = path.resolve()
    // this makes the dist folder a 'static route' whatever that is in our context
    app.use(express.static(path.join(__dirname, 'frontend/dist')))
    // now we point anything that isn't api/users there
    app.get('*', (req,res) => res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html')))
}else{
    app.get('/', (req,res) => res.send('Dev server base response [RDY]'))
}


// import errors
app.use(notFound)
app.use(errorHandler)

// Announce the listener
app.listen(port, () =>  console.log(`Server started on port ${port}`))