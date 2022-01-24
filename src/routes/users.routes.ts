import { Router } from "express";
import { register, getUserById, login } from "../controllers/users.controller";

const router = Router();

router.post("/login", login);
router.post("/register", register);

router.get("/:id", getUserById);

export default router;
