import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
// import { UpdateProductDto } from './dto/update-product.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({
    status: 200,
    description: 'Return all products.',
    type: [Product],
  })
  async findAll(): Promise<{ products: Product[] }> {
    const products = await this.productsService.findAll(); // Đợi kết quả của Promise
    return { products }; // Trả về object với thuộc tính products
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
