import express                    from "express";
import "reflect-metadata";
import { __prod__ }               from "./constants";
import mikroOrmConfig             from "./mikro-orm.config";
import { MikroORM }               from "@mikro-orm/core";
import { ApolloServer }           from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema }            from "type-graphql";
import { HelloResolver }          from "./resolver/hello";
import { PostResolver }           from "./resolver/post";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false,
    }),
    //context is an object that is accessible by all the resolvers
    context: ({em: orm.em}),
    // to enable graphql playground
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],  
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });
  app.listen(4000, () => {
    console.log("Server started on http://localhost:4000/graphql");
  });
}

main().catch(e =>{
    console.log("ERRORP: " + e);
});