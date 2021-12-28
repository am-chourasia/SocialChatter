import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ObjectType, Field } from "type-graphql";

@ObjectType() // to make it a graphql object with various fields
@Entity() // to make it an entity for the ORM to work upon
export class User {
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
	@Property({ type: "text", unique: true })
	username!: string;

	@Property({ type: "text" })
	password!: string;
}
