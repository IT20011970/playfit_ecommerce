import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities';
import { CreateProductInput, UpdateProductInput, ReduceStockInput } from '../types';
import { KafkaProducerService } from 'src/utils/kafka/kafka-producer.service';


@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private readonly kafkaProducer: KafkaProducerService,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async create(input: CreateProductInput): Promise<{ success: boolean; message: string }> {
    await this.kafkaProducer.publishInventoryItemAdded(input as any);
    
    return { 
      success: true, 
      message: 'Product creation event published. You will be notified once processed.' 
    };
  }

  async update(input: UpdateProductInput): Promise<{ success: boolean; message: string }> {
    await this.findOne(input.id);
    const { id, ...changes } = input;
    
    await this.kafkaProducer.publishInventoryItemUpdated(input.id, changes);
    
    return { 
      success: true, 
      message: 'Product update event published. You will be notified once processed.' 
    };
  }

  async delete(id: string): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);
    
    await this.kafkaProducer.publishInventoryItemDeleted(id);
    
    return { 
      success: true, 
      message: 'Product deletion event published. You will be notified once processed.' 
    };
  }

  /**
   * Check if sufficient stock is available for a product
   */
  async checkStock(productId: string, quantity: number): Promise<boolean> {
    const product = await this.findOne(productId);
    return product.stock >= quantity;
  }

  /**
   * Check stock for multiple products (cart items)
   * Returns an object with productId and available stock if insufficient
   */
  async checkMultipleStock(items: ReduceStockInput[]): Promise<{ success: boolean; insufficientItems?: Array<{ productId: string; requested: number; available: number }> }> {
    const insufficientItems: Array<{ productId: string; requested: number; available: number }> = [];

    for (const item of items) {
      const product = await this.findOne(item.productId);
      if (product.stock < item.quantity) {
        insufficientItems.push({
          productId: item.productId,
          requested: item.quantity,
          available: product.stock,
        });
      }
    }

    if (insufficientItems.length > 0) {
      return { success: false, insufficientItems };
    }

    return { success: true };
  }

  /**
   * Reduce stock for a single product
   * Throws error if insufficient stock
   */
  async reduceStock(productId: string, quantity: number): Promise<{ success: boolean; message: string }> {
    const product = await this.findOne(productId);

    if (product.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock for product ${product.name}. Requested: ${quantity}, Available: ${product.stock}`
      );
    }

    await this.kafkaProducer.publishInventoryStockReduced(productId, quantity, product.stock - quantity);
    
    return { 
      success: true, 
      message: 'Stock reduction event published. You will be notified once processed.' 
    };
  }

  /**
   * Reduce stock for multiple products (cart items)
   * All operations are atomic - if one fails, none are applied
   */
  async reduceMultipleStock(items: ReduceStockInput[]): Promise<{ success: boolean; message: string }> {
    const stockCheck = await this.checkMultipleStock(items);
    
    if (!stockCheck.success && stockCheck.insufficientItems) {
      const errors = stockCheck.insufficientItems
        .map(item => `Product ${item.productId}: requested ${item.requested}, available ${item.available}`)
        .join('; ');
      throw new BadRequestException(`Insufficient stock: ${errors}`);
    }

    for (const item of items) {
      await this.reduceStock(item.productId, item.quantity);
    }

    return { 
      success: true, 
      message: 'Stock reduction events published. You will be notified once processed.' 
    };
  }

  /**
   * Increase stock (for cancellations or returns)
   */
  async increaseStock(productId: string, quantity: number): Promise<{ success: boolean; message: string }> {
    const product = await this.findOne(productId);
    
    await this.kafkaProducer.publishInventoryStockIncreased(productId, quantity, product.stock + quantity);
    
    return { 
      success: true, 
      message: 'Stock increase event published. You will be notified once processed.' 
    };
  }

  /**
   * Seed initial product data from db.ts
   */
  async seedProducts(products: CreateProductInput[]): Promise<Product[]> {
    const seededProducts: Product[] = [];
    
    for (const productData of products) {
      const existing = await this.productRepository.findOne({ where: { id: productData.id } });
      if (!existing) {
        const product = this.productRepository.create(productData);
        const saved = await this.productRepository.save(product);
        seededProducts.push(saved);
      }
    }

    return seededProducts;
  }
}
