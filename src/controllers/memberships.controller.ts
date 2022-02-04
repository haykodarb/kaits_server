import { validate, ValidationError } from "class-validator";
import { getRepository, InsertResult, Repository } from "typeorm";
import { Community } from "../entity/Community";
import { Membership, MembershipSchema } from "../entity/Membership";
import { User } from "../entity/User";
import { randomBytes } from "crypto";
import { generateToken } from "../helpers/crypto";
import { Request, Response } from "express";

const generateJoinCode = (): string => {
	const randomCode: string = randomBytes(8).toString("hex");

	console.log(`Random code: ${randomCode}`);

	return randomCode;
};

const isJoinCodeAvailable = async (
	generatedCode: string,
	community: Community,
	user: User
): Promise<boolean> => {
	try {
		const joinCodeExists: Membership = await getRepository(Membership).findOne({
			where: [
				{
					joinCode: generatedCode,
					community: community,
				},
				{
					joinCode: generatedCode,
					user: user,
				},
			],
		});

		return joinCodeExists == undefined;
	} catch (error) {
		return false;
	}
};

export const createMembership = async (
	user: User,
	community: Community,
	isAdmin: boolean = false
): Promise<boolean> => {
	try {
		const inputMembership: MembershipSchema = new MembershipSchema();

		inputMembership.user = user;
		inputMembership.community = community;
		inputMembership.hasJoined = isAdmin;
		inputMembership.isAdmin = isAdmin;

		let generatedCode: string = generateJoinCode();

		let isAvailable: boolean = await isJoinCodeAvailable(
			generatedCode,
			community,
			user
		);

		while (!isAvailable) {
			generatedCode = generateJoinCode();
			isAvailable = await isJoinCodeAvailable(generatedCode, community, user);
		}

		inputMembership.joinCode = generatedCode;

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

export const joinCommunity = async (req: Request, res: Response) => {
	try {
		res.status(400);

		const membershipRepository: Repository<Membership> =
			getRepository(Membership);

		const _foundUser: User = await getRepository(User).findOne({
			where: { id: req.userId },
		});

		const joinCode: string = req.body.joinCode;

		if (!joinCode) {
			res.send("Access code was empty.");
		}

		const foundMembership: Membership = await membershipRepository.findOne({
			where: {
				user: _foundUser,
				joinCode: joinCode,
			},
		});

		if (foundMembership == undefined) {
			return res.send("Access code does not belong to any community.");
		}

		foundMembership.hasJoined = true;

		foundMembership.save();

		return res.status(200).send("User has joined community successfully.");
	} catch (error) {
		return res
			.status(500)
			.send("Server error has occurred, please try again later");
	}
};
