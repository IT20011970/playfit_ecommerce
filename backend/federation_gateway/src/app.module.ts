import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
@Module({
  imports: [
    GraphQLModule.forRoot<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      // Disable CSRF prevention in dev/local so browser requests to /graphql are allowed.
      // In production, re-enable CSRF protection or use proper preflight headers.
      server: {
        csrfPrevention: false,
        introspection: true,
        plugins: [ApolloServerPluginLandingPageLocalDefault()],
      },
      gateway: {
        supergraphSdl: new IntrospectAndCompose({
          subgraphs: [
            { 
              name: 'UserGql', 
              url: process.env.USER_SERVICE_URL || 'http://localhost:3000/graphql' 
            },
            { 
              name: 'CartService', 
              url: process.env.CART_SERVICE_URL || 'http://localhost:3002/graphql' 
            },
            { 
              name: 'OrderService', 
              url: process.env.ORDER_SERVICE_URL || 'http://localhost:3003/graphql' 
            },
            { 
              name: 'InventoryService', 
              url: process.env.INVENTORY_SERVICE_URL || 'http://localhost:3004/graphql' 
            },
          ],
        }),
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
