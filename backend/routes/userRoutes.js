import express from "express"
const router = express.Router()
import { authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile } from "../controllers/userControllers.js"
import { protect } from "../middleware/authMiddleware.js"


// route linking
router.post('/', registerUser)
router.post('/auth', authUser)
router.post('/logout', logoutUser)
// router.put('/profile', updateUserProfile)
// router.get('/profile', getUserProfile)
// can be chained as below
router.route('/profile').get(protect, getUserProfile).put(protect,updateUserProfile)

export default router









// app.POST('/api/users', (req,res) => res.send('Server base response'))
// app.POST('/api/users/auth', (req,res) => res.send('Server base response'))
// app.POST('/api/users/logout', (req,res) => res.send('Server base response'))
// app.PUT('/api/users/profile', (req,res) => res.send('Server base response'))
// app.GET('/api/users/profile', (req,res) => res.send('Server base response'))
