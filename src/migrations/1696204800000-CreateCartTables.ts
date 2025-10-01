import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateCartTables1696204800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tạo bảng carts
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'userId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_CART_USER_ID',
            columnNames: ['userId'],
          },
        ],
      }),
      true,
    );

    // Tạo bảng cart_items
    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'cartId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'productId',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'quantity',
            type: 'integer',
            isNullable: false,
            default: 1,
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'createdAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
        indices: [
          {
            name: 'IDX_CART_ITEM_CART_ID',
            columnNames: ['cartId'],
          },
          {
            name: 'IDX_CART_ITEM_PRODUCT_ID',
            columnNames: ['productId'],
          },
        ],
      }),
      true,
    );

    // Thêm foreign key cho carts -> users
    await queryRunner.createForeignKey(
      'carts',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Thêm foreign key cho cart_items -> carts
    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['cartId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'carts',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );

    // Thêm foreign key cho cart_items -> products
    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({
        columnNames: ['productId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'Products',
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Xóa foreign keys trước
    const cartItemsTable = await queryRunner.getTable('cart_items');
    const cartsTable = await queryRunner.getTable('carts');

    if (cartItemsTable) {
      const cartItemsForeignKeys = cartItemsTable.foreignKeys;
      for (const foreignKey of cartItemsForeignKeys) {
        await queryRunner.dropForeignKey('cart_items', foreignKey);
      }
    }

    if (cartsTable) {
      const cartsForeignKeys = cartsTable.foreignKeys;
      for (const foreignKey of cartsForeignKeys) {
        await queryRunner.dropForeignKey('carts', foreignKey);
      }
    }

    // Xóa bảng
    await queryRunner.dropTable('cart_items', true);
    await queryRunner.dropTable('carts', true);
  }
}
