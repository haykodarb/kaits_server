import {
	IsBoolean,
	IsNotEmpty,
	IsNotEmptyObject,
	IsString,
	IsUUID,
} from "class-validator";
import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	ManyToOne,
} from "typeorm";
import { Community } from "./Community";
import { User } from "./User";

@Entity({ name: "memberships" })
export class Membership extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "boolean", default: false })
	isAdmin: boolean;

	@Column({ type: "boolean", default: false })
	hasJoined: boolean;

	@Column({
		type: "timestamp",
		default: () => "CURRENT_TIMESTAMP",
		nullable: false,
	})
	createdAt: Date;

	@Column({
		type: "timestamp",
		nullable: true,
		default: null,
	})
	joinedAt: Date;

	@ManyToOne(() => User, (user) => user.memberships, {
		eager: true,
	})
	user: User;

	@ManyToOne(() => Community, (community) => community.memberships, {
		eager: true,
	})
	community: Community;
}

export class MembershipSchema {
	@IsNotEmpty()
	user: User;

	@IsNotEmpty()
	community: Community;

	@IsBoolean()
	isAdmin: boolean;

	@IsBoolean()
	hasJoined: boolean;
}
