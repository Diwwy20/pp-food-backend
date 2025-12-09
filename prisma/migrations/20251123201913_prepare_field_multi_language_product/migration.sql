-- AlterTable
ALTER TABLE `Product` ADD COLUMN `descriptionEn` TEXT NULL,
    ADD COLUMN `descriptionTh` TEXT NULL,
    ADD COLUMN `isRecommended` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `nameEn` VARCHAR(191) NULL,
    ADD COLUMN `nameTh` VARCHAR(191) NULL;
