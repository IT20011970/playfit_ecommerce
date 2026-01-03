import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloFederationDriver, ApolloFederationDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { decryptedSecrets } from './Db_Encript/decrypt-secrets';
import { UserModule } from './user/user.module';

const fallbackDatabaseUrl =
  'postgresql://neondb_owner:npg_WHJ72IBcyfkF@ep-patient-dew-a4m078xf-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const databaseUrl = (process.env.DATABASE_URL ?? '').trim() || fallbackDatabaseUrl;
const shouldUseSsl = /sslmode=require/i.test(databaseUrl) || process.env.DB_SSL === 'true';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        path: join(process.cwd(), 'src/schema.gql'),
        federation: 2,
      },
      playground: true,
      path: '/graphql',
    }),
    // TypeOrmModule.forFeature([User]),
    //   TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: decryptedSecrets.username,
    //   password: decryptedSecrets.password,
    //   database: decryptedSecrets.database,
    //   entities: ['dist/**/*.entity.{ts,js}'],
    //   synchronize: true,
    // }),
    
    // TypeORM Database Connection
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: databaseUrl,
      autoLoadEntities: true,
      synchronize: true,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
