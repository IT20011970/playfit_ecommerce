import { ObjectType, Field, Int } from '@nestjs/graphql';
import { UserGql } from '../type/user.graphql';

@ObjectType()
export class AuthResponse {
  @Field()
  accessToken: string;

  @Field(() => Int)
  expiresIn: number;

  @Field(() => UserGql)
  user: UserGql;
}
