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

	@Column({ type: "varchar", length: 50, nullable: false })
	joinCode: string;

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

	@ManyToOne(() => User, (user) => user.memberships)
	user: User;

	@ManyToOne(() => Community, (community) => community.memberships)
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

	@IsString()
	@IsNotEmpty()
	joinCode: string;
}
