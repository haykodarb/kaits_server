import {
	Entity,
	Column,
	BaseEntity,
	PrimaryGeneratedColumn,
	OneToMany,
	ManyToOne,
} from "typeorm";
import { Loan } from "./Loan";
import { User } from "./User";

@Entity({ name: "books" })
export class Book extends BaseEntity {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ type: "varchar", length: 50 })
	OLID: string;

	@Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
	createdAt: Date;

	@ManyToOne(() => User, (user) => user.books)
	user: User;

	@OneToMany(() => Loan, (loan) => loan.book)
	loans: Loan[];
}
