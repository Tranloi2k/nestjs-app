import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { ProductsService } from './products.service';
import { CreateProductInput } from './dto/product.input';
import { Product } from './entities/product.entity';

@Resolver(() => Product)
export class ProductResolver {
  constructor(private readonly productService: ProductsService) {}

  @Query(() => [Product], { name: 'products' })
  findAll() {
    return this.productService.findAll();
  }

  @Query(() => Product, { name: 'product' })
  findOne(@Args('id', { type: () => Number }) id: number) {
    return this.productService.findOne(id);
  }

  @Mutation(() => Product, { name: 'createProduct' })
  create(@Args('createProductInput') createProductInput: CreateProductInput) {
    return this.productService.create(createProductInput);
  }

  //   @Mutation(() => Product, { name: 'updateProduct' })
  //   update(@Args('updateProductInput') updateProductInput: UpdateProductInput) {
  //     return this.productService.update(updateProductInput.id, updateProductInput);
  //   }

  @Mutation(() => Boolean, { name: 'deleteProduct' })
  delete(@Args('id', { type: () => Number }) id: number) {
    return this.productService.remove(id);
  }
}
