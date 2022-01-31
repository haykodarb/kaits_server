import { IsNotEmpty, IsNotEmptyObject, IsUUID } from "class-validator";
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

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@Column({ type: "timestamp", default: null, nullable: true })
	approvedAt: Date;

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
}
