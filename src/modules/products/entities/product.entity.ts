import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Review } from 'src/modules/reviews/entities/review.entity';

@ObjectType() // Đánh dấu class là một GraphQL Object Type
@Entity('Products')
export class Product {
  @Field() // Đánh dấu trường là một GraphQL Field
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  description: string;

  @Field(() => Int)
  @Column('decimal')
  price: number;

  @Field(() => [Review], { name: 'reviews' }) // Đánh dấu quan hệ với Review
  @OneToMany(() => Review, (reviews) => reviews.product) // Quan hệ 1-nhiều với Review
  reviews: Review[];
}
