import 'reflect-metadata';
import express from 'express';
import { ApolloServer, BaseContext } from '@apollo/server';
import {
  expressMiddleware,
  ExpressContextFunctionArgument,
} from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { DataSource } from 'typeorm';
import http from 'http';
import cors from 'cors';
import { buildSchema } from 'type-graphql';
import { CountryResolver } from './resolvers/countryResolver';
import dotenv from 'dotenv';

dotenv.config();

const port = 4000;
const app = express();
const httpServer = http.createServer(app);

const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'data.db',
  synchronize: true,
  logging: false,
  entities: [__dirname + '/entity/*.ts'],
});

async function startServer() {
  await AppDataSource.initialize();
  const schema = await buildSchema({
    resolvers: [CountryResolver],
  });

  const server = new ApolloServer({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  app.use(
    '/',
    cors({
      origin: ['http://localhost:3000', 'https://studio.apollographql.com'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({
        req,
        res,
      }: ExpressContextFunctionArgument): Promise<BaseContext> => {
        return Promise.resolve({ req, res });
      },
    })
  );

  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`GraphQL server is running at http://localhost:${port}/`);
}

startServer().catch((error) => {
  console.error('Error starting server:', error);
});
