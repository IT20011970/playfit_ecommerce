import { InputType, Field, Int, PartialType, GraphQLISODateTime } from '@nestjs/graphql';
import { CreateUserInput } from './create-user.input';

@InputType()
export class UpdateUserInput extends PartialType(CreateUserInput) {}
