import { Post } from "../entities/PostEntity";
import { MyContext } from "src/types";
import { Resolver, Query, Ctx, Mutation, Arg, Int } from "type-graphql";

@Resolver()
export class PostResolver {
	@Query(() => [Post]) // returns all the posts
	posts(@Ctx() { em }: MyContext) {
		return em.find(Post, {});
	}

	@Query(() => Post, { nullable: true }) // return a post with the given id, returning null type if not found
	post(@Arg("id", () => Int) id: number, @Ctx() { em }: MyContext) {
		return em.findOne(Post, { id });
	}

	@Mutation(() => Post) // creating and returning a post
	async createPost(
		@Arg("title", () => String) title: string,
		@Ctx() { em }: MyContext
	) {
		const post = em.create(Post, { title });
		await em.persistAndFlush(post);
		return post;
	}

	@Mutation(() => Post, { nullable: true })
	async updatePost(
		@Arg("id") id: number,
		@Arg("title", () => String, { nullable: true }) title: string,
		@Ctx() { em }: MyContext
	) {
		const post = await em.findOne(Post, { id });
		if (!post) return null;
		if (typeof title !== undefined) {
			post.title = title;
			await em.persistAndFlush(post);
		}
		return post;
	}

	@Mutation(() => Boolean)
	async deletePost(@Arg("id") id: number, @Ctx() { em }: MyContext) {
		try {
			await em.nativeDelete(Post, { id });
			return true;
		} catch {
			return false;
		}
	}
}
