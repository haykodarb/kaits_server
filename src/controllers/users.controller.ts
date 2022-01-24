import { Request, Response } from "express";
import { DeleteResult, getRepository, InsertResult } from "typeorm";
import { User, UserSchema } from "../entity/User";
import { validate, ValidationError } from "class-validator";
import { encrypt, compare, generateToken } from "../helpers/crypto";
import { Result } from "../models/result";

export const getUserById = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const userId: string = req.params.id;

	const user: User = await getRepository(User).findOne({ id: userId });

	return res.status(200).json(user);
};

export const login = async (req: Request, res: Response): Promise<Response> => {
	let inputBody = new UserSchema();

	inputBody.username = req.body.username;
	inputBody.password = req.body.password;

	//TODO: only skip email
	const validationErrors: ValidationError[] = await validate(inputBody, {
		skipMissingProperties: true,
	});

	if (validationErrors.length > 0) {
		return res.status(400).json({
			errors: validationErrors,
		});
	}

	const storedUser: User = await getRepository(User).findOne({
		username: inputBody.username,
	});

	const result: Result = {
		payload: "",
		success: false,
	};

	res.status(403);

	if (storedUser.password) {
		const isPasswordValid = compare(inputBody.password, storedUser.password);

		if (isPasswordValid) {
			result.payload = generateToken(storedUser.id);
			res.status(200);
		} else {
			result.payload = "Incorrect password.";
		}
	} else {
		result.payload = "User does not exist.";
	}

	return res.json(result);
};

export const register = async (
	req: Request,
	res: Response
): Promise<Response> => {
	let inputBody = new UserSchema();

	inputBody.email = req.body.email;
	inputBody.password = req.body.password;
	inputBody.username = req.body.username;

	const validationErrors: ValidationError[] = await validate(inputBody);

	if (validationErrors.length > 0) {
		return res.status(400).json({
			errors: validationErrors,
		});
	}

	const hashedPassword = encrypt(req.body.password);

	const newUser: User = req.body;

	newUser.password = hashedPassword;

	const result: InsertResult = await getRepository(User).insert(newUser);

	return res.status(200).json(result.identifiers);
};

export const removeUser = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const userId: string = req.params.id;

	const result: DeleteResult = await getRepository(User).delete({ id: userId });

	return res.status(200).json(result.affected > 0);
};
