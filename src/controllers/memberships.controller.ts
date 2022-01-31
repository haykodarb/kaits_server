import { validate, ValidationError } from "class-validator";
import { getRepository, InsertResult } from "typeorm";
import { Community } from "../entity/Community";
import { Membership, MembershipSchema } from "../entity/Membership";
import { User } from "../entity/User";

export const createMembership = async (
	user: User,
	community: Community
): Promise<boolean> => {
	try {
		const inputMembership: MembershipSchema = new MembershipSchema();

		inputMembership.user = user;
		inputMembership.community = community;

		const validationErrors: ValidationError[] = await validate(inputMembership);

		if (validationErrors && validationErrors.length > 0) {
			return false;
		}
		const insertResult: InsertResult = await getRepository(Membership).insert(
			inputMembership
		);

		return insertResult.identifiers.length > 0;
	} catch (error) {
		console.error(error);
		return false;
	}
};
