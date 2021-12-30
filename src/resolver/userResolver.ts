import { User } from "../entities/UserEntity";
import { MyContext } from "src/types";
import {
	Resolver,
	Ctx,
	Mutation,
	Arg,
	InputType,
	Field,
	ObjectType,
	Query,
} from "type-graphql";
import argon2 from "argon2";

@InputType()
class inputCredentials {
	@Field()
	username!: string;
	@Field()
	password!: string;
}

@ObjectType()
class FieldError {
	constructor(field: string, message: string) {
		this.field = field;
		this.message = message;
	}
	@Field()
	field: string;
	@Field()
	message: string;
}

@ObjectType()
class UserResponse {
	@Field(() => [FieldError], { nullable: true })
	error?: [FieldError];
	@Field(() => User, { nullable: true })
	user?: User;
}

@Resolver()
export class UserResolver {
	@Query(() => User, { nullable: true })
	async me(@Ctx() { req, em }: MyContext) {
		// not loged in
		if (!req.session.userId) return null;
		const user = await em.findOne(User, { id: req.session.userId });
		return user;
	}

	@Mutation(() => UserResponse)
	async register(
		@Arg("credentials") credentials: inputCredentials,
		@Ctx() { em, req }: MyContext
	) {
		if (credentials.username.length < 2)
			return {
				error: [
					new FieldError(
						"username",
						"username must be of length greater than 2"
					),
				],
			};
		if (credentials.password.length < 3)
			return {
				error: [
					new FieldError(
						"password",
						"password must be of length greater than 3"
					),
				],
			};
		const hashedPassword = await argon2.hash(credentials.password);
		const user = em.create(User, {
			username: credentials.username,
			password: hashedPassword,
		});
		try {
			await em.persistAndFlush(user);
		} catch (err) {
			if (err.code === "23505") {
				return {
					error: [new FieldError("username", "username already taken!")],
				};
			}
		}
		// will store the cookie of the registered user
		// which will keep them loged in
		req.session.userId = user.id;
		return {
			user: user,
		};
	}

	@Mutation(() => UserResponse)
	async login(
		@Arg("credentials") credentials: inputCredentials,
		@Ctx() { em, req }: MyContext
	) {
		const user = await em.findOne(User, { username: credentials.username });
		if (!user) {
			return {
				error: [
					new FieldError("username", "User with that username doestn't exist."),
				],
			};
		}
		const vaild = await argon2.verify(user.password, credentials.password);
		if (!vaild) {
			return {
				error: [new FieldError("passsword", "Incorrect Password!")],
			};
		}
		// adding userId to the session once loged in successfully.
		req.session.userId = user.id;
		return {
			user: user,
		};
	}
}
