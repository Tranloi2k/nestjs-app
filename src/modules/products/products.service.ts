import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedProductResponseDto } from './dto/paginated-product-response.dto';
import { Product } from './entities/product.entity';
// import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async findAll(queryDto?: QueryProductDto): Promise<PaginatedProductResponseDto> {
    const { search, page = 1, limit = 10 } = queryDto || {};

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.reviews', 'reviews');

    // Thêm điều kiện tìm kiếm nếu có
    if (search && search.trim()) {
      queryBuilder.where('product.name LIKE :search', {
        search: `%${search.trim()}%`,
      });
    }

    // Đếm tổng số sản phẩm
    const total = await queryBuilder.getCount();

    // Áp dụng phân trang
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const products = await queryBuilder.getMany();

    // Tính toán rating và reviewCount cho mỗi sản phẩm
    const productsWithRating = products.map((product) => {
      const ratings = product.reviews.map((review) => review.rating);
      const averageRating =
        ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      return {
        ...product,
        rate: averageRating,
        reviewCount: product.reviews.length,
      };
    });

    const totalPages = Math.ceil(total / limit);

    return {
      products: productsWithRating,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['reviews'] });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  //   async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
  //     const product = await this.findOne(id);
  //     Object.assign(product, updateProductDto);
  //     return this.productRepository.save(product);
  //   }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
  }
}
