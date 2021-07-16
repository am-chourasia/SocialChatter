import {Post} from "../entities/Post";
import { MyContext } from "src/types";
import {Resolver, Query, Ctx, Mutation, Arg, Int} from "type-graphql";

@Resolver()
export class PostResolver {
    @Query(() => [Post])
    posts(@Ctx() {em}: MyContext){
        return em.find(Post, {});
    }

    @Query(() => Post, {nullable: true}) // for returning null type if not found
    post(
        @Arg('id', ()=> Int) id: number, 
        @Ctx() {em}: MyContext) {
        return em.findOne(Post, { id });
    }

    @Mutation(() => Post) // for returning null type if not found
    async createPost(
        @Arg('title', ()=> String) title : string, 
        @Ctx() {em}: MyContext) {
        const post = em.create(Post, {title});
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Post, {nullable: true}) // for returning null type if not found
    async updatePost(
        @Arg('id') id:number,
        @Arg('title', ()=> String, {nullable:true}) title : string, 
        @Ctx() {em}: MyContext) {
        const post = await em.findOne(Post, {id});
        if(!post)
            return null;
        if(typeof title !== undefined)
            post.title = title;
        await em.persistAndFlush(post);
        return post;
    }

    @Mutation(() => Boolean) // for returning null type if not found
    async deletePost(
        @Arg('id') id:number,
        @Ctx() {em}: MyContext) {
        try{
            await em.nativeDelete(Post, {id});
            return true;
        } catch {
            return false;
        }
    }
}