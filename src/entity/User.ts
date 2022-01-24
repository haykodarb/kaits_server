import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	OneToMany,
} from "typeorm";
import { Book } from "./Book";
import { Community } from "./Community";
import { Loan } from "./Loan";
import { Membership } from "./Membership";

@Entity({ name: "users" })
export class User extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	username: string;

	@Column({ type: "text" })
	password: string;

	@Column({ type: "varchar", length: 50 })
	email: string;

	@Column({ type: "int", default: 0 })
	bookQuota: number;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@OneToMany(() => Community, (community) => community.user)
	communities: Community[];

	@OneToMany(() => Membership, (membership) => membership.user)
	memberships: Membership[];

	@OneToMany(() => Book, (book) => book.user)
	books: Book[];

	@OneToMany(() => Loan, (loan) => loan.owner)
	outgoingLoans: Loan[];

	@OneToMany(() => Loan, (loan) => loan.borrower)
	incomingLoans: Loan[];
}
