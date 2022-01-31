import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";
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

	@Column({ type: "varchar", unique: true, length: 50 })
	username: string;

	@Column({ type: "text" })
	password: string;

	@Column({ type: "varchar", unique: true, length: 50 })
	email: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@OneToMany(() => Community, (community) => community.founder)
	foundedCommunities: Community[];

	@OneToMany(() => Membership, (membership) => membership.user)
	memberships: Membership[];

	@OneToMany(() => Book, (book) => book.user)
	books: Book[];

	@OneToMany(() => Loan, (loan) => loan.owner)
	outgoingLoans: Loan[];

	@OneToMany(() => Loan, (loan) => loan.borrower)
	incomingLoans: Loan[];
}

export class UserSchema {
	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	username: string;

	@IsNotEmpty()
	@IsString()
	@MinLength(6)
	password: string;

	@IsEmail()
	email: string;
}
