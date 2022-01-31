import { config } from "dotenv";
config();
import { genSaltSync, hashSync, compareSync } from "bcrypt";
import jwt = require("jsonwebtoken");
import { Request, Response } from "express";

const JWT_SECRET = process.env.JWT_SECRET;

const salt = genSaltSync(10);

export const encrypt = (password: string): string => {
	const hashedPassword = hashSync(password, salt);
	return hashedPassword;
};

export const compare = (
	plainPassword: string,
	encryptedPassword: string
): boolean => {
	const isPasswordValid = compareSync(plainPassword, encryptedPassword);
	return isPasswordValid;
};

export const generateToken = (username: string): String => {
	const jsonWebToken = jwt.sign(username, JWT_SECRET);
	return jsonWebToken;
};

export const verifyUser = (req: Request, res: Response, next: Function) => {
	const header = req.headers.authorization;

	if (!header) {
		return res.status(403).send("No authorization token");
	}

	const token = header.split(" ")[1];

	jwt.verify(token, JWT_SECRET, (err, payload) => {
		if (err) {
			return res.status(403).send("Authorization token is incorrect");
		} else {
			req.userId = payload.toString();
			return next();
		}
	});
};
