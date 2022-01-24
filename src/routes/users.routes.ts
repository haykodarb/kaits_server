import { Router } from "express";
import {
	createUser,
	getUsers,
	removeUser,
} from "../controllers/users.controller";

const router = Router();

router.get("/", getUsers);
router.post("/", createUser);
router.delete("/:id", removeUser);
router.get("/:id", () => {});

/*
router.put("/users", () => {});
*/

export default router;
