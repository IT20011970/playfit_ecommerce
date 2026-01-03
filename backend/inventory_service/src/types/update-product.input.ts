import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class UpdateProductInput {
  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Float, { nullable: true })
  price?: number;

  @Field({ nullable: true })
  image?: string;

  @Field({ nullable: true })
  category?: string;

  @Field(() => Int, { nullable: true })
  stock?: number;

  @Field(() => [String], { nullable: true })
  sizes?: string[];

  @Field(() => [String], { nullable: true })
  colors?: string[];

  @Field({ nullable: true })
  isNewArrival?: boolean;
}
