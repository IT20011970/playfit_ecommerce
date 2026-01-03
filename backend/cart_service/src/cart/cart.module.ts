import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { UserCartResolver } from './user-cart.resolver';
import { Cart } from './entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  providers: [CartService, CartResolver, UserCartResolver],
  exports: [CartService],
})
export class CartModule {}
