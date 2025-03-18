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
}
