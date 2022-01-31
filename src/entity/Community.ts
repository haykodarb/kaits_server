import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import {
	IsEmail,
	isNotEmpty,
	IsNotEmpty,
	IsString,
	IsUUID,
	MinLength,
} from "class-validator";

import { Membership } from "./Membership";
import { User } from "./User";

@Entity({ name: "communities" })
export class Community extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50, unique: true })
	name: string;

	@Column({ type: "text" })
	description: string;

	@Column({ type: "boolean", default: true })
	isActive: boolean;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.foundedCommunities)
	founder: User;

	@OneToMany(() => Membership, (membership) => membership.community)
	memberships: Membership[];
}

export class CommunitySchema {
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	name: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(20)
	description: string;

	@IsNotEmpty()
	founder: User;
}
