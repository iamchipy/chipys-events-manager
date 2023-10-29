import express from "express"
const router = express.Router()
import { authUser } from "../controllers/userControllers.js"

router.post('/auth', authUser)
router.post('/logoff', authUser)
router.put('/profile', authUser)
router.get('/profile', authUser)

export default router









// app.POST('/api/users', (req,res) => res.send('Server base response'))
// app.POST('/api/users/auth', (req,res) => res.send('Server base response'))
// app.POST('/api/users/logout', (req,res) => res.send('Server base response'))
// app.PUT('/api/users/profile', (req,res) => res.send('Server base response'))
// app.GET('/api/users/profile', (req,res) => res.send('Server base response'))
