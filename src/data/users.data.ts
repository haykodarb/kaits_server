import { validate, ValidationError } from "class-validator";
import { create } from "domain";
import { Request, response, Response } from "express";
import { getRepository, In, InsertResult, Like, Not } from "typeorm";
import { Community, CommunitySchema } from "../entity/Community";
import { Membership } from "../entity/Membership";
import { User } from "../entity/User";

export const getUserById = async (userId: string): Promise<User> => {
	const user: User = await getRepository(User).findOne(userId);

	return user;
};

export const searchUsers = async (query: string, ids: string[]) => {
	try {
		const usersFound: User[] = await getRepository(User).find({
			where: {
				username: Like(`%${query}%`),
				id: Not(In(ids)),
			},
			take: 10,
			order: {
				username: "DESC",
			},
			select: ["id", "username"],
		});

		return usersFound;
	} catch (error) {
		console.error(error);
		return null;
	}
};
