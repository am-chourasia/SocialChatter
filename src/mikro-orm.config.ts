import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path';

export default {
    migrations: {
        path: path.join(__dirname,'./migrations'), // path to the folder with migrations
        pattern: /^[\w-]+\d+\.[jt]s$/, // regex pattern for the migration files
    },
    entities: [Post],
    dbName: 'rebbit',
    user: 'admin',
    password: 'amchourasia',
    type: 'postgresql',
    debug: !__prod__ , // logs the sql when not in production
} as Parameters<typeof MikroORM.init>[0];