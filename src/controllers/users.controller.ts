import { Request, Response } from "express";
import { DeleteResult, getRepository, InsertResult } from "typeorm";
import { User } from "../entity/User";

export const getUsers = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const users: User[] = await getRepository(User).find();

	return res.status(200).json(users);
};

export const getUserById = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const userId: string = req.params.id;

	const user: User = await getRepository(User).findOne({ id: userId });

	return res.status(200).json(user);
};

export const createUser = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const newUser: User = req.body;

	const result: InsertResult = await getRepository(User).insert(newUser);

	return res.status(200).json(result.identifiers);
};

export const removeUser = async (
	req: Request,
	res: Response
): Promise<Response> => {
	const userId: string = req.params.id;

	const result: DeleteResult = await getRepository(User).delete({ id: userId });
	return res.status(200).json(result.affected);
};
