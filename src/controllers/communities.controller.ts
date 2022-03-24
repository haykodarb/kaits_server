import { validate, ValidationError } from "class-validator";
import { Request, Response } from "express";

import {
	createCommunity,
	getAdminCommunitiesForUser,
	getCommunitiesForUser,
	getCommunityById,
	getUsersInCommunity,
} from "../data/communities.data";

import {
	getMembershipFromId,
	isUserAdminOfCommunity,
	isUserInCommunity,
	joinCommunity,
} from "../data/memberships.data";

import { Community, CommunitySchema } from "../entity/Community";
import { Membership } from "../entity/Membership";
import { User } from "../entity/User";
import { createMembership } from "../data/memberships.data";
import { getUserById } from "../data/users.data";

export const createCommunityHandler = async (req: Request, res: Response) => {
	try {
		const inputCommunity: CommunitySchema = new CommunitySchema();

		inputCommunity.description = req.body.description;
		inputCommunity.name = req.body.name;
		inputCommunity.founder = await getUserById(req.userId);

		const validationErrors: ValidationError[] = await validate(inputCommunity);

		if (validationErrors && validationErrors.length > 0) {
			return res.status(400).send(validationErrors[0]);
		}

		const createdCommunity: Community = await createCommunity(inputCommunity);

		if (createdCommunity == null || createCommunity == undefined)
			return res.status(500).send("Internal Server Error");

		const createdMembership: Membership = await createMembership(
			createdCommunity.founder,
			createdCommunity,
			true
		);

		if (createdMembership == undefined || createdMembership == null) {
			return res
				.status(400)
				.send("Could not add user to the created community");
		}

		return res.status(200).send("Community created successfully.");
	} catch (error) {
		console.error(error);

		return res
			.status(500)
			.send("Error in creating community, please try again");
	}
};

export const inviteUserToCommunity = async (req: Request, res: Response) => {
	try {
		if (req.body.communityId == undefined || req.body.userId == undefined)
			return res.status(400).send("Missing arguments");

		const community: Community = await getCommunityById(req.body.communityId);

		if (community == undefined)
			return res.status(400).send("Community does not exist.");

		const admin: User = await getUserById(req.userId);

		if (admin == undefined)
			return res.status(400).send("Requesting user does not exist.");

		let isUserAdmin: boolean = await isUserAdminOfCommunity(admin, community);

		if (isUserAdmin == null)
			return res.status(500).send("Internal server error");

		if (!isUserAdmin)
			return res.status(400).send("User is not admin of this community.");

		const invitedUser: User = await getUserById(req.body.userId);

		if (invitedUser == undefined)
			return res.status(400).send("Invited user does not exist.");

		const existingMembership: Membership = await isUserInCommunity(
			invitedUser,
			community
		);

		if (existingMembership == null || existingMembership == undefined) {
			const newMembership: Membership = await createMembership(
				invitedUser,
				community
			);

			if (newMembership == null || existingMembership == undefined) {
				return res.status(500).send("Internal server error.");
			}

			return res.status(200).send("User has been invited to community.");
		}

		if (existingMembership.hasJoined)
			return res.status(400).send("User is already part of this community.");

		return res
			.status(200)
			.send("User has already been invited to this community.");
	} catch (error) {
		console.error(error);

		return res.status(500).send("Internal server error.");
	}
};

export const communitiesForUserHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const communities: Community[] = await getCommunitiesForUser(
			await getUserById(req.userId)
		);

		if (communities == null || communities == undefined)
			return res.status(500).send("Internal server error.");

		return res.status(200).send(communities);
	} catch (error) {
		console.error(error);

		return res.status(500).send("Internal server error");
	}
};

export const adminCommunitiesForUserHandler = async (
	req: Request,
	res: Response
) => {
	try {
		const communities: Community[] = await getAdminCommunitiesForUser(
			await getUserById(req.userId)
		);

		if (communities == null || communities == undefined)
			return res.status(500).send("Internal server error");

		return res.status(200).send(communities);
	} catch (error) {
		console.error(error);

		return res.status(500).send("Internal server error");
	}
};

export const usersInCommunityHandler = async (req: Request, res: Response) => {
	try {
		const communityId: string = req.query.communityId.toString();

		const communityWithMemberships: Community = await getCommunityById(
			communityId,
			true
		);

		const requestingUser: User = await getUserById(req.userId);

		if (!isUserInCommunity(requestingUser, communityWithMemberships)) {
			return res.status(400).send("You are not a member of this community.");
		}

		const usersResult: User[] = await getUsersInCommunity(
			communityWithMemberships
		);

		if (usersResult == undefined || usersResult == null)
			return res.status(500).send("Internal server error");

		return res.status(200).send(usersResult);
	} catch (error) {
		console.error(error);
		return res.status(500).send("Internal server error.");
	}
};

export const joinCommunityHandler = async (req: Request, res: Response) => {
	try {
		const foundUser: User = await getUserById(req.userId);

		const foundMembership: Membership = await getMembershipFromId(
			req.query.membershipId.toString()
		);

		if (foundMembership == undefined || foundMembership == null) {
			return res.status(400).send("This invite does not exist.");
		}

		if (foundUser.id != foundMembership.user.id) {
			return res.status(400).send("Invite does not match the user.");
		}

		const returnedMembership: Membership = await joinCommunity(foundMembership);

		if (returnedMembership == null || returnedMembership == undefined)
			return res.status(500).send("Internal server error.");

		return res.status(200).send("User has joined community successfully.");
	} catch (error) {
		console.error(error);

		return res
			.status(500)
			.send("Server error has occurred, please try again later");
	}
};
