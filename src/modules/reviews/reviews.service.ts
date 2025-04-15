/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewInput, UpdateReviewInput } from './dto/review.input';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({ relations: ['product'] });
  }

  async findOne(id: number): Promise<Review | null> {
    return this.reviewRepository.findOne({ where: { id }, relations: ['product'] });
  }

  async create(createReviewInput: CreateReviewInput): Promise<Review> {
    const review = this.reviewRepository.create(createReviewInput);
    return this.reviewRepository.save(review);
  }

  async update(id: number, updateReviewInput: UpdateReviewInput): Promise<Review | null> {
    await this.reviewRepository.update(id, updateReviewInput);
    return this.reviewRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<boolean> {
    await this.reviewRepository.delete(id);
    return true;
  }

  async countByProductId(productId: number): Promise<number> {
    return this.reviewRepository.count({
      where: { product: { id: productId } },
    });
  }

  // Tính điểm trung bình của một product
  async getAverageRating(productId: number): Promise<number> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.productId = :productId', { productId })
      .getRawOne();

    return parseFloat(result.average) || 0;
  }

  // Lấy điểm trung bình cho nhiều products (tối ưu cho DataLoader)
  async getAverageRatings(productIds: number[]): Promise<Record<number, number>> {
    const results = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.productId', 'productId')
      .addSelect('AVG(review.rating)', 'average')
      .where('review.productId IN (:...productIds)', { productIds })
      .groupBy('review.productId')
      .getRawMany();

    return results.reduce((acc, curr) => {
      acc[curr.productId] = parseFloat(curr.average) || 0;
      return acc;
    }, {});
  }

  // Lấy số lượng reviews cho nhiều products (tối ưu cho DataLoader)
  async getReviewCounts(productIds: number[]): Promise<Record<number, number>> {
    const results = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.productId', 'productId')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.productId IN (:...productIds)', { productIds })
      .groupBy('review.productId')
      .getRawMany();

    return results.reduce((acc, curr) => {
      acc[curr.productId] = parseInt(curr.count) || 0;
      return acc;
    }, {});
  }
}
