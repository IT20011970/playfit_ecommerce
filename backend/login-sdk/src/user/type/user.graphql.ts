import { ObjectType, Field, Int, GraphQLISODateTime, Directive } from '@nestjs/graphql';

// Rename GraphQL type to 'User' so it matches across subgraphs for federation
@ObjectType('User', { description: 'User GraphQL type' })
@Directive('@key(fields: "id")')
export class UserGql {
  @Field(() => Int, { description: 'Primary id' })
  id: number;

  @Field(() => String, { nullable: true })
  userId?: string | null;
  
  @Field(() => String, { nullable: true })
  password?: string | null;

  @Field(() => String, { nullable: true })
  salt?: string | null;

  @Field(() => String, { nullable: true })
  role?: string | null;

  @Field(() => String, { nullable: true })
  refreshToken?: string | null;

  @Field(() => GraphQLISODateTime, { nullable: true })
  refreshTokenExpiryTime?: Date | null;

  @Field(() => String, { nullable: true, description: 'National ID / NIC' })
  refNo?: string | null;

  @Field(() => String, { nullable: true })
  contactNo?: string | null;

  @Field(() => Int)
  isActive: number;

  @Field(() => String, { nullable: true })
  extraText1?: string | null;

  @Field(() => String, { nullable: true })
  extraText2?: string | null;

  @Field(() => String, { nullable: true })
  extraText3?: string | null;

  @Field(() => String, { nullable: true })
  extratext4?: string | null;

  @Field(() => Int, { nullable: true })
  extraInt1?: number | null;

  @Field(() => Int, { nullable: true })
  extraInt2?: number | null;

  @Field(() => Int, { nullable: true })
  extraInt3?: number | null;

  @Field(() => String, { nullable: true })
  createby?: string | null;
}
