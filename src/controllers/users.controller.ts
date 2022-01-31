import { Request, Response } from "express";
import { DeleteResult, getRepository, InsertResult } from "typeorm";
import { User, UserSchema } from "../entity/User";
import { validate, ValidationError } from "class-validator";
import { encrypt, compare, generateToken } from "../helpers/crypto";

export const getUserById = async (userId: string): Promise<User> => {
	const user: User = await getRepository(User).findOne({ id: userId });

	return user;
};

export const login = async (req: Request, res: Response): Promise<Response> => {
	let inputBody = new UserSchema();

	inputBody.username = req.body.username;
	inputBody.password = req.body.password;
	inputBody.email = "valid@email.com";

	try {
		const validationErrors: ValidationError[] = await validate(inputBody);

		if (validationErrors && validationErrors.length > 0) {
			return res.status(403).json({
				errors: validationErrors,
			});
		}

		const storedUser: User = await getRepository(User).findOne({
			username: inputBody.username,
		});

		res.status(403);

		if (!storedUser || !storedUser.password) {
			return res.send("User does not exist.");
		}

		const isPasswordValid = compare(inputBody.password, storedUser.password);

		if (!isPasswordValid) {
			return res.send("Incorrect password.");
		}

		return res.status(200).send(generateToken(storedUser.id));
	} catch (error) {
		return res.status(403).send("Error in login, please try again.");
	}
};

export const register = async (
	req: Request,
	res: Response
): Promise<Response> => {
	res.status(403);

	let inputBody = new UserSchema();

	inputBody.email = req.body.email;
	inputBody.password = req.body.password;
	inputBody.username = req.body.username;

	try {
		const validationErrors: ValidationError[] = await validate(inputBody);

		const userRepository = getRepository(User);

		if (validationErrors && validationErrors.length > 0) {
			return res.send(validationErrors[0]);
		}

		const hashedPassword = encrypt(req.body.password);

		const newUser: User = req.body;

		newUser.password = hashedPassword;

		const isUsernameTaken = await userRepository.findOne({
			where: {
				username: newUser.username,
			},
		});

		if (isUsernameTaken) {
			return res.send("Username is taken.");
		}
		const isEmailTaken = await userRepository.findOne({
			where: {
				email: newUser.email,
			},
		});
		if (isEmailTaken) {
			return res.send("Email is already being used.");
		}

		const insertResult: InsertResult = await userRepository.insert(newUser);

		if (insertResult && insertResult.identifiers.length > 0)
			return res.status(200).send("User created successfully.");

		return res.send("Error in creating user, please try again.");
	} catch (error) {
		return res.send(error);
	}
};

export const removeUser = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const userId: string = req.params.id;

	const result: DeleteResult = await getRepository(User).delete({ id: userId });

	return res.status(200).send(result.affected > 0);
};
