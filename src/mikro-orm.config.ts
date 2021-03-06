import { __prod__ } from "./constants";
import { Post } from "./entities/PostEntity";
import { MikroORM } from "@mikro-orm/core";
import path from "path";
import { User } from "./entities/UserEntity";

export default {
	migrations: {
		path: path.join(__dirname, "./migrations"), // path to the folder with migrations
		pattern: /^[\w-]+\d+\.[jt]s$/, // regex pattern for the migration files
	},
	entities: [Post, User],
	dbName: "socialchatter",
	user: "socialchatteradmin",
	password: "amchourasia",
	type: "postgresql",
	debug: !__prod__, // logs the sql when not in production
} as Parameters<typeof MikroORM.init>[0];
