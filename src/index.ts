import "reflect-metadata";
import { Connection, createConnection } from "typeorm";
import { User } from "./entity/User";
import * as express from "express";
import * as cors from "cors";
import usersRouter from "./routes/users.routes";

const app = express();

app.use(cors());
app.use(express.json());

async function start() {
	try {
		const connection: Connection = await createConnection();

		app.use("/api/users", usersRouter);

		app.listen(8080, () => {
			console.log(`Listening on http://localhost:8080`);
		});
	} catch (error) {
		console.error(error);
	}
}

start();
