import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) {}

	async create(data: Partial<User>): Promise<User> {
			if (data.password) {
				const salt = crypto.randomBytes(16).toString('hex');
				const hash = crypto.createHash('sha256').update((data.password ?? '') + salt).digest('hex');
				data.salt = salt;
				data.password = hash;
			}

			const user = this.userRepo.create(data as User);
			return this.userRepo.save(user);
	}

		async findByUserId(userId: string): Promise<User | null> {
			return this.userRepo.findOne({ where: { userId } });
		}

		validatePassword(user: User, plainPassword: string): boolean {
			if (!user || !user.salt || !user.password) return false;
			const hash = crypto.createHash('sha256').update(plainPassword + user.salt).digest('hex');
			return hash === user.password;
		}

	// Sign in: verify credentials and return JWT token with expiration
	async signIn(userId: string, plainPassword: string): Promise<{ accessToken: string; expiresIn: number; user: User }> {
		const user = await this.findByUserId(userId);
		if (!user) throw new UnauthorizedException('Invalid credentials');
		const valid = this.validatePassword(user, plainPassword);
		if (!valid) throw new UnauthorizedException('Invalid credentials');

		const secret = process.env.JWT_SECRET ?? 'change_this_secret';
		const expiresIn = parseInt(process.env.JWT_EXPIRES_IN ?? '3600', 10);

		const payload = { sub: user.id, userId: user.userId, role: user.role };
		const token = jwt.sign(payload, secret, { expiresIn });
		return { accessToken: token, expiresIn, user };
	}	findAll(): Promise<User[]> {
		return this.userRepo.find();
	}

	async findOne(id: number): Promise<User | null> {
		return this.userRepo.findOne({ where: { id } });
	}

	async update(id: number, data: Partial<User>): Promise<User> {
		const res = await this.userRepo.update(id, data as QueryDeepPartialEntity<User>);
		// after update, return the entity (or throw if not found)
		const updated = await this.findOne(id);
		if (!updated) throw new NotFoundException(`User with id ${id} not found`);
		return updated;
	}

	async remove(id: number): Promise<boolean> {
		const res = await this.userRepo.delete(id);
		return (res.affected ?? 0) > 0;
	}
}

type QueryDeepPartialEntity<T> = Partial<T> | { [P in keyof T]?: QueryDeepPartialEntity<T[P]> };
