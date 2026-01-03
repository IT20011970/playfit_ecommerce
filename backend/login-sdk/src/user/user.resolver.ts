import { Resolver, Query, Mutation, Args, Int, ResolveReference } from '@nestjs/graphql';
import { UserGql } from './type/user.graphql';
import { UserService } from './user.service';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { AuthResponse } from './dto/auth-response.dto';
import { Inject } from '@nestjs/common';

@Resolver(() => UserGql)
export class UserResolver {
	constructor(private readonly userService: UserService) {}

	@ResolveReference()
	resolveReference(reference: { __typename: string; id: number }) {
		return this.userService.findOne(reference.id);
	}

	@Query(() => [UserGql], { name: 'users' })
	users() {
		return this.userService.findAll();
	}

	@Query(() => UserGql, { name: 'user', nullable: true })
	user(@Args('id', { type: () => Int }) id: number) {
		return this.userService.findOne(id);
	}

	@Mutation(() => UserGql, { name: 'createUser' })
	createUser(@Args('input') input: CreateUserInput) {
		return this.userService.create(input as any);
	}

	@Mutation(() => UserGql, { name: 'updateUser' })
	updateUser(
		@Args('id', { type: () => Int }) id: number,
		@Args('input') input: UpdateUserInput,
	) {
		return this.userService.update(id, input as any);
	}

	@Mutation(() => Boolean, { name: 'deleteUser' })
	async deleteUser(@Args('id', { type: () => Int }) id: number) {
		return this.userService.remove(id);
	}

	// Sign-in mutation: returns JWT token and expiry in seconds
	@Mutation(() => AuthResponse, { name: 'signIn' })
	async signIn(
		@Args('userId') userId: string,
		@Args('password') password: string,
	) {
		return this.userService.signIn(userId, password);
	}
}
