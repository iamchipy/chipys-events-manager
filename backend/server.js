// backend / server entry point
import express from 'express'

// Import .ENV and set it as config
import dotenv from 'dotenv'
dotenv.config()
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
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

// routes / endpoints
app.use('/api/users', userRoutes)
app.get('/', (req,res) => res.send('Server base response'))

// import errors
app.use(notFound)
app.use(errorHandler)

// Announce the listener
app.listen(port, () =>  console.log(`Server started on port ${port}`))