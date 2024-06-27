import express from "express";
import protectRoute from "../middleware/protectRoute.js";
import { getUsersForSideBars } from "../controllers/user.controller.js";


const router = express.Router()

router.get("/", protectRoute, getUsersForSideBars)

export default router