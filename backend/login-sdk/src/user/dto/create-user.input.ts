import { InputType, Field, Int, GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class CreateUserInput {
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

  @Field(() => Int, { nullable: true })
  isActive?: number | null;

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
