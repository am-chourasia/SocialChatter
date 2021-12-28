import { User } from "../entities/UserEntity";
import { MyContext } from "src/types";
import {Resolver, Ctx, Mutation, Arg, InputType, Field} from "type-graphql";
import argon2 from "argon2";

@InputType()
class inputCredentials {
    @Field()
    username! : string
    @Field()
    password! : string
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)      
    async register(
        @Arg('credentials') credentials : inputCredentials, 
        @Ctx() {em}: MyContext
    ) {
        const hashedPassword = await argon2.hash(credentials.password);
        const user = em.create(User, {username: credentials.username, password: hashedPassword});
        await em.persistAndFlush(user);
        return user;
    }
}