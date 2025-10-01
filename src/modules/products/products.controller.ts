import { Controller, Get, Post, Body, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { PaginatedProductResponseDto } from './dto/paginated-product-response.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { Product } from './entities/product.entity';

@ApiTags('products') // Nhóm các API liên quan đến sản phẩm
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({
    status: 201,
    description: 'The product has been successfully created.',
    type: Product,
  })
  create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productsService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get all products with search and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Return paginated products with search functionality.',
    type: PaginatedProductResponseDto,
  })
  @ApiQuery({ name: 'search', required: false, description: 'Search by product name' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page', example: 10 })
  async findAll(@Query() queryDto: QueryProductDto): Promise<PaginatedProductResponseDto> {
    return this.productsService.findAll(queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the product with the specified ID.',
    type: Product,
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  findOne(@Param('id') id: string): Promise<Product> {
    return this.productsService.findOne(+id);
  }

  //   @Put(':id')
  //   @ApiOperation({ summary: 'Update a product by ID' })
  //   @ApiResponse({
  //     status: 200,
  //     description: 'The product has been successfully updated.',
  //     type: Product,
  //   })
  //   @ApiResponse({ status: 404, description: 'Product not found.' })
  //   update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
  //     return this.productsService.update(+id, updateProductDto);
  //   }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiResponse({
    status: 200,
    description: 'The product has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Product not found.' })
  remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(+id);
  }
}
