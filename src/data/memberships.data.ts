import { validate, ValidationError } from "class-validator";
import { getRepository } from "typeorm";
import { Community } from "../entity/Community";
import { Membership, MembershipSchema } from "../entity/Membership";
import { User } from "../entity/User";

export const getMembershipFromId = async (
	membershipId: string
): Promise<Membership> => {
	try {
		const foundMembership: Membership = await getRepository(Membership).findOne(
			membershipId
		);

		return foundMembership;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const isUserAdminOfCommunity = async (
	user: User,
	community: Community
): Promise<boolean> => {
	try {
		const membership: Membership = await getRepository(Membership).findOne({
			where: {
				user: user,
				community: community,
			},
		});

		if (membership == undefined) {
			return false;
		}

		return membership.isAdmin;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const isUserInCommunity = async (
	user: User,
	community: Community
): Promise<Membership> => {
	try {
		const membership: Membership = await getRepository(Membership).findOne({
			where: {
				user: user,
				community: community,
			},
		});

		return membership;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const joinCommunity = async (
	membership: Membership
): Promise<Membership> => {
	try {
		membership.hasJoined = true;
		membership.joinedAt = new Date();

		const savedMembership = membership.save();

		return savedMembership;
	} catch (error) {
		console.error(error);

		return null;
	}
};

export const createMembership = async (
	user: User,
	community: Community,
	isAdmin: boolean = false
): Promise<Membership> => {
	try {
		const inputMembership: MembershipSchema = new MembershipSchema();

		inputMembership.user = user;
		inputMembership.community = community;
		inputMembership.hasJoined = isAdmin;
		inputMembership.isAdmin = isAdmin;

		console.log("Creating user...");

		const validationErrors: ValidationError[] = await validate(inputMembership);

		if (validationErrors && validationErrors.length > 0) {
			console.error(validationErrors);
			return null;
		}

		const membershipToCreate: Membership = new Membership();

		membershipToCreate.user = inputMembership.user;
		membershipToCreate.community = inputMembership.community;
		membershipToCreate.hasJoined = inputMembership.hasJoined;
		membershipToCreate.isAdmin = inputMembership.isAdmin;

		const savedMembership: Membership = await membershipToCreate.save();

		return savedMembership;
	} catch (error) {
		console.error(error);
		return null;
	}
};
