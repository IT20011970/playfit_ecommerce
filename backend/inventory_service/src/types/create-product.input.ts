import { InputType, Field, Int, Float } from '@nestjs/graphql';

@InputType()
export class CreateProductInput {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => Float)
  price: number;

  @Field()
  image: string;

  @Field()
  category: string;

  @Field(() => Int)
  stock: number;

  @Field(() => [String])
  sizes: string[];

  @Field(() => [String])
  colors: string[];

  @Field({ defaultValue: false })
  isNewArrival: boolean;
}
