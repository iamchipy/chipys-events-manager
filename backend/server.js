// backend / server entry point
import express from 'express'

// Import .ENV and set it as config
import dotenv from 'dotenv'
dotenv.config()
// set the port using the ENV
const port = process.env.PORT || 3000;

// import the routes
import userRoutes from './routes/userRoutes.js'

// Define the base Express app
const app = express()

// routes / endpoints
app.use('/api/users', userRoutes)
app.get('/', (req,res) => res.send('Server base response'))



// Announce the listener
app.listen(port, () =>  console.log(`Server started on port ${port}`))