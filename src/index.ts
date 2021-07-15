import express                    from "express";
import { __prod__ }               from "./constants";
import mikroOrmConfig             from "./mikro-orm.config";
import { MikroORM }               from "@mikro-orm/core";
import { ApolloServer }           from "apollo-server-express";
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import { buildSchema }            from "type-graphql";
import { HelloResolver }          from "./resolver/hello";

const main = async () => {
  const orm = await MikroORM.init(mikroOrmConfig);
  orm.getMigrator().up();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground({})],  
    // to enable graphql playground
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