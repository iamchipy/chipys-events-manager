import express from "express"
const router = express.Router()
import { authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    requestDino,
    fetchPending,
    updateRequest } from "../controllers/userControllers.js"
// import { protect } from "../middleware/authMiddleware.js"


// route linking
router.post('/', registerUser)
router.post('/auth', authUser)
router.post('/logout', logoutUser)
// router.post('/register', registerUser)
router.post("/request", requestDino)
router.put("/fetchPending", fetchPending)
router.put("/updateRequest", updateRequest)
// router.route('/profile').get(protect, getUserProfile).put(protect,updateUserProfile)

export default router

