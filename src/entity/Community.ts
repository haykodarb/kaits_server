import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	ManyToOne,
	OneToMany,
} from "typeorm";
import { Membership } from "./Membership";
import { User } from "./User";

@Entity({ name: "communities" })
export class Community extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	name: string;

	@Column({ type: "text" })
	description: string;

	@Column({ type: "boolean", default: true })
	isActive: boolean;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.communities)
	founder: User;

	@OneToMany(() => Membership, (membership) => membership.community)
	memberships: Membership[];
}
