import express from "express";
import "reflect-metadata";
import { __prod__ } from "./constants";
import mikroOrmConfig from "./mikro-orm.config";
import { MikroORM } from "@mikro-orm/core";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolver/helloResolver";
import { PostResolver } from "./resolver/postResolver";
import { UserResolver } from "./resolver/userResolver";
import { MyContext } from "./types";

const sessionManagement = () => {
	const session = require("express-session");
	const redis = require("redis");
	const redisClient = redis.createClient({
		host: "localhost",
		port: 6379,
	});
	redisClient.on("error", (err: Error) => {
		console.error("Redis Client Error : ", err.message);
	});

	const RedisStore = require("connect-redis")(session);
	return {
		RedisStore,
		redisClient,
		session,
	};
};

const main = async () => {
	const orm = await MikroORM.init(mikroOrmConfig);
	await orm.getMigrator().up(); // run the migration before anything else
	const app = express();
	const { RedisStore, redisClient, session } = sessionManagement();
	app.use(
		session({
			name: "qid",
			store: new RedisStore({
				client: redisClient,
				disableTouch: true,
			}),
			cookie: {
				maxAge: 1000 * 60 * 60 * 24 * 10, // 10 days
				httpOnly: true, // cookie is not accessible from the frontend javascript
				secure: __prod__, // cookie only works in https
				sameSite: "lax",
			},
			saveUninitialized: false,
			secret: "thesecret_key_from_the_production",
			resave: false,
		})
	);

	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [HelloResolver, PostResolver, UserResolver],
			validate: false,
		}),
		context: ({ req, res }): MyContext => ({
			em: orm.em,
			req,
			res,
		}), //context is an object that is accessible by all the resolvers
		plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],
	});

	await apolloServer.start();
	apolloServer.applyMiddleware({ app });
	app.listen(5000, () => {
		console.log("Server started on http://localhost:5000/graphql");
	});
};

main().catch((e) => {
	console.log("ERROR: " + e);
	console.error(e);
});
