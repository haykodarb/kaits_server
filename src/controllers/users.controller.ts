import { Request, Response } from "express";
import { DeleteResult, getRepository, InsertResult } from "typeorm";
import { User, UserSchema } from "../entity/User";
import { validate, ValidationError } from "class-validator";
import { encrypt, compare, generateToken } from "../helpers/crypto";
import { getUsersInCommunity } from "../data/communities.data";
import { Community } from "../entity/Community";
import { getCommunityById } from "../data/communities.data";
import { searchUsers } from "../data/users.data";

export const searchForUsersHandler = async (req: Request, res: Response) => {
	try {
		const searchQuery: string = req.query.query.toString();

		const communityId: string = req.query.communityId.toString();

		const community: Community = await getCommunityById(communityId, true);

		const usersAlreadyInCommunity: User[] = await getUsersInCommunity(
			community
		);

		const usersFound: User[] = await searchUsers(
			searchQuery,
			usersAlreadyInCommunity.map((value) => value.id)
		);

		if (usersFound == undefined || usersFound == null)
			return res.status(500).send("Internal server error.");

		return res.status(200).send(usersFound);
	} catch (error) {
		console.error(error);

		return res.status(500).send("Internal server error.");
	}
};

export const loginHandler = async (
	req: Request,
	res: Response
): Promise<Response> => {
	let inputBody = new UserSchema();

	inputBody.username = req.body.username;
	inputBody.password = req.body.password;
	inputBody.email = "valid@email.com";

	try {
		const validationErrors: ValidationError[] = await validate(inputBody);

		if (validationErrors && validationErrors.length > 0) {
			return res.status(400).json({
				errors: validationErrors,
			});
		}

		const storedUser: User = await getRepository(User).findOne({
			username: inputBody.username,
		});

		if (!storedUser || !storedUser.password) {
			return res.status(400).send("User does not exist.");
		}

		const isPasswordValid = compare(inputBody.password, storedUser.password);

		if (!isPasswordValid) {
			return res.status(400).send("Incorrect password.");
		}

		return res.status(200).send(generateToken(storedUser.id));
	} catch (error) {
		console.error(error);

		return res.status(500).send("Error in login, please try again.");
	}
};

export const registerHandler = async (
	req: Request,
	res: Response
): Promise<Response> => {
	res.status(400);

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

		return res.status(500).send("Error in creating user, please try again.");
	} catch (error) {
		console.error(error);

		return res.status(500).send("Error in creating user, please try again.");
	}
};

export const removeUser = async (
	req: Request,
	res: Response
): Promise<Response> => {
	try {
		const userId: string = req.params.id;

		if (req.userId == userId)
			return res
				.status(400)
				.send("Requesting user does not match user to delete.");

		const result: DeleteResult = await getRepository(User).delete({
			id: userId,
		});

		if (result && result.affected > 0) {
			return res.status(200).send("User deleted");
		}
		{
			return res.status(500).send("Server error, please try again later.");
		}
	} catch (error) {
		console.error(error);

		return res.status(500).send("Server error, please try again later.");
	}
};
