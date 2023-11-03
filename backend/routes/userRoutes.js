import express from "express"
const router = express.Router()
import { authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    requestDino,
    fetchPending,
    updateRequest,
    fetchPendingByFilter } from "../controllers/userControllers.js"
import { protect } from "../middleware/authMiddleware.js"


// route linking
// router.post('/', registerUser)
router.post('/auth', authUser)
router.post('/logout', logoutUser)
router.post("/request", requestDino)
router.put("/fetchPending", fetchPending)
router.put("/fetchPendingByFilter", fetchPendingByFilter)
router.put("/updateRequest", updateRequest)
router.route('/profile').get(protect, getUserProfile).put(updateUserProfile)
// TODO ADD PROTECT back in


export default router

