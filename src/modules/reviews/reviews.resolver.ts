import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { ReviewService } from './reviews.service';
import { Review } from './entities/review.entity';
import { CreateReviewInput, UpdateReviewInput } from './dto/review.input';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(private readonly reviewService: ReviewService) {}

  @Query(() => [Review], { name: 'reviews' })
  findAll() {
    return this.reviewService.findAll();
  }

  @Query(() => Review, { name: 'reviews' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.reviewService.findOne(id);
  }

  @Mutation(() => Review, { name: 'createReview' })
  create(@Args('createReviewInput') createReviewInput: CreateReviewInput) {
    return this.reviewService.create(createReviewInput);
  }

  @Mutation(() => Review, { name: 'updateReview' })
  update(@Args('updateReviewInput') updateReviewInput: UpdateReviewInput) {
    return this.reviewService.update(updateReviewInput.id, updateReviewInput);
  }

  @Mutation(() => Boolean, { name: 'deleteReview' })
  delete(@Args('id', { type: () => Int }) id: number) {
    return this.reviewService.remove(id);
  }
}
