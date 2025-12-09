-- DropForeignKey
ALTER TABLE `CartItem` DROP FOREIGN KEY `CartItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `OrderItem` DROP FOREIGN KEY `OrderItem_productId_fkey`;

-- DropIndex
DROP INDEX `CartItem_productId_fkey` ON `CartItem`;

-- DropIndex
DROP INDEX `OrderItem_productId_fkey` ON `OrderItem`;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
