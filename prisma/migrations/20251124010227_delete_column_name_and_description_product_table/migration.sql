/*
  Warnings:

  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Product` table. All the data in the column will be lost.
  - Made the column `nameEn` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `nameTh` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Product` DROP COLUMN `description`,
    DROP COLUMN `name`,
    MODIFY `nameEn` VARCHAR(191) NOT NULL,
    MODIFY `nameTh` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `firstName` VARCHAR(191) NULL,
    MODIFY `lastName` VARCHAR(191) NULL;
