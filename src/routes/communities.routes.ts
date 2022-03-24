import { Router } from "express";
import {
	adminCommunitiesForUserHandler,
	communitiesForUserHandler,
	createCommunityHandler,
	joinCommunityHandler,
	usersInCommunityHandler,
} from "../controllers/communities.controller";
import { verifyUser } from "../helpers/crypto";

const router = Router();

router.use(verifyUser);

router.post("/", createCommunityHandler);

router.get("/", communitiesForUserHandler);

router.get("/admin", adminCommunitiesForUserHandler);

router.get("/users", usersInCommunityHandler);

router.post("/join", joinCommunityHandler);

export default router;
