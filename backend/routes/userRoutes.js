import express from "express"
const router = express.Router()
import { authUser,
    registerUser,
    logoutUser,
    updateUserProfile,
    requestDino,
    fetchPending,
    updateRequest,
    eventCreate,
    eventUpdate,
    eventsByFilter,
    getUserProfiles,
    fetchPendingByFilter } from "../controllers/userControllers.js"
import { protect } from "../middleware/authMiddleware.js"


// route linking
router.post('/', registerUser)
router.post('/auth', authUser)
router.post('/logout', logoutUser)
router.post("/request", requestDino)
router.put("/fetchPending", fetchPending)
router.put("/fetchPendingByFilter", fetchPendingByFilter)
router.put("/updateRequest", updateRequest)
router.post("/eventCreate", eventCreate)
router.put("/eventUpdate", eventUpdate)
router.put("/eventsByFilter", eventsByFilter)
router.get("/profiles/:global_name", getUserProfiles)
router.route('/profile').put(updateUserProfile)
// TODO ADD PROTECT back in


export default router

