import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType() // to make it a graphql object with various fields
@Entity() // to make it an entity for the ORM to work upon
export class Post {
	@Field()
	@PrimaryKey()
	id!: number;

	@Field(() => String)
	@Property({ type: "date" })
	createdAt = new Date();

	@Field(() => String)
	@Property({ type: "date", onUpdate: () => new Date() })
	updatedAt = new Date();

	@Field()
	@Property({ type: "text" })
	title!: string;
}
