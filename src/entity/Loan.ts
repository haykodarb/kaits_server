import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToOne,
} from "typeorm";
import { Book } from "./Book";
import { User } from "./User";

@Entity({ name: "loans" })
export class Loan extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	OLID: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@Column({
		type: "timestamp",
		default: null,
		nullable: true,
	})
	approvedAt: Date;

	@Column({
		type: "timestamp",
		default: null,
		nullable: true,
	})
	returnedAt: Date;

	@ManyToOne(() => User, (user) => user.outgoingLoans, { nullable: false })
	borrower: User;

	@ManyToOne(() => User, (user) => user.incomingLoans, { nullable: false })
	owner: User;

	@ManyToOne(() => Book, (book) => book.loans, { nullable: false })
	book: Book;
}
