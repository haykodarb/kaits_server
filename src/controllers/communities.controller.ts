import { validate, ValidationError } from "class-validator";
import { Request, Response } from "express";
import { getRepository, InsertResult } from "typeorm";
import { Community, CommunitySchema } from "../entity/Community";
import { Membership } from "../entity/Membership";
import { User } from "../entity/User";
import { createMembership } from "./memberships.controller";

export const createCommunity = async (req: Request, res: Response) => {
	const inputCommunity: CommunitySchema = new CommunitySchema();

	inputCommunity.description = req.body.description;
	inputCommunity.name = req.body.name;

	try {
		inputCommunity.founder = await getRepository(User).findOne({
			id: req.userId,
		});

		const validationErrors: ValidationError[] = await validate(inputCommunity);

		res.status(403);

		if (validationErrors && validationErrors.length > 0) {
			return res.send(validationErrors[0]);
		}

		const insertResult: InsertResult = await getRepository(Community).insert(
			inputCommunity
		);

		if (!insertResult || insertResult.identifiers.length == 0) {
			console.log(insertResult.generatedMaps);
			return res.send("Error in creating community, please try again");
		}

		let createdCommunity: Community = insertResult
			.generatedMaps[0] as Community;

		const membershipCreated: boolean = await createMembership(
			inputCommunity.founder,
			createdCommunity
		);

		if (!membershipCreated) {
			return res.send("Could not add user to the created community");
		}

		return res.status(200).send("Community created successfully.");
	} catch (error) {
		if (error.code == "ER_DUP_ENTRY") {
			return res.status(403).send("Community with this name already exists");
		}

		return res
			.status(403)
			.send("Error in creating community, please try again");
	}
};

export const getCommunitiesForUser = async (req: Request, res: Response) => {
	try {
		const membershipsResult: Membership[] = await getRepository(
			Membership
		).find({
			where: {
				user: req.userId,
			},
			relations: ["community"],
		});

		const communitiesResult: Community[] = membershipsResult.map(
			(item) => item.community
		);

		return res.status(200).send(communitiesResult);
	} catch (error) {}
};
1;
