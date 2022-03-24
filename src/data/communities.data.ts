import { getRepository, In, InsertResult } from "typeorm";
import { Community, CommunitySchema } from "../entity/Community";
import { Membership } from "../entity/Membership";
import { User } from "../entity/User";

export const getCommunityById = async (
	communityId: string,
	loadMemberships: boolean = false
): Promise<Community> => {
	try {
		const community: Community = await getRepository(Community).findOne(
			communityId,
			{
				relations: loadMemberships ? ["memberships"] : [],
			}
		);

		if (community == undefined) return null;

		return community;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const getUsersInCommunity = async (community: Community) => {
	try {
		const usersResult: User[] = community.memberships.map((value) => {
			const userItem: User = new User();
			userItem.id = value.user.id;
			userItem.username = value.user.username;

			return userItem;
		});

		return usersResult;
	} catch (error) {
		console.error(error);
		return null;
	}
};

export const getCommunitiesForUser = async (
	user: User
): Promise<Community[]> => {
	try {
		const membershipsResult: Membership[] = await getRepository(
			Membership
		).find({
			where: {
				user: user,
			},
			relations: ["community"],
			order: {
				createdAt: "DESC",
			},
		});

		const communitiesResult: Community[] = membershipsResult.map(
			(item) => item.community
		);

		if (communitiesResult == undefined || communitiesResult == null)
			return null;

		return communitiesResult;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const getAdminCommunitiesForUser = async (user: User) => {
	try {
		const membershipsResult: Membership[] = await getRepository(
			Membership
		).find({
			where: {
				user: user,
				isAdmin: true,
			},
			relations: ["community"],
			order: {
				createdAt: "DESC",
			},
		});

		const communitiesResult: Community[] = membershipsResult.map(
			(item) => item.community
		);

		return communitiesResult;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const createCommunity = async (
	inputCommunity: CommunitySchema
): Promise<Community> => {
	try {
		const communityToCreate: Community = new Community();

		communityToCreate.founder = inputCommunity.founder;
		communityToCreate.description = inputCommunity.description;
		communityToCreate.name = inputCommunity.name;

		const createdCommunity: Community = await communityToCreate.save();

		return createdCommunity;
	} catch (error) {
		console.error(error);

		return null;
	}
};
