import { Router } from "express";
import {
	loginHandler,
	registerHandler,
	searchForUsersHandler,
} from "../controllers/users.controller";

const router = Router();

router.post("/login", loginHandler);
router.post("/register", registerHandler);
router.get("/search", searchForUsersHandler);

export default router;
