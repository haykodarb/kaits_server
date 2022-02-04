import { Router } from "express";
import {
	createCommunity,
	getCommunitiesForUser,
} from "../controllers/communities.controller";
import { joinCommunity } from "../controllers/memberships.controller";
import { verifyUser } from "../helpers/crypto";

const router = Router();

router.post("/", verifyUser, createCommunity);

router.get("/", verifyUser, getCommunitiesForUser);

router.post("/join", joinCommunity);

export default router;
