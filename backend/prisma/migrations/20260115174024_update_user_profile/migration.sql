/*
  Warnings:

  - A unique constraint covering the columns `[cnpj]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `DocumentSignature_documentId_fkey` ON `documentsignature`;

-- DropIndex
DROP INDEX `EventRegistration_eventId_fkey` ON `eventregistration`;

-- DropIndex
DROP INDEX `FinancialRecord_userId_fkey` ON `financialrecord`;

-- AlterTable
ALTER TABLE `profile` ADD COLUMN `activityBranch` VARCHAR(191) NULL,
    ADD COLUMN `birthDate` DATETIME(3) NULL,
    ADD COLUMN `city` VARCHAR(191) NULL,
    ADD COLUMN `cnpj` VARCHAR(191) NULL,
    ADD COLUMN `complement` VARCHAR(191) NULL,
    ADD COLUMN `currentCompany` VARCHAR(191) NULL,
    ADD COLUMN `district` VARCHAR(191) NULL,
    ADD COLUMN `docCnpjCard` VARCHAR(191) NULL,
    ADD COLUMN `docCpf` VARCHAR(191) NULL,
    ADD COLUMN `docDiploma` VARCHAR(191) NULL,
    ADD COLUMN `docProfessionalRegistry` VARCHAR(191) NULL,
    ADD COLUMN `docResponsibleRg` VARCHAR(191) NULL,
    ADD COLUMN `docRgCnh` VARCHAR(191) NULL,
    ADD COLUMN `docSocialContract` VARCHAR(191) NULL,
    ADD COLUMN `education` VARCHAR(191) NULL,
    ADD COLUMN `employeeCount` INTEGER NULL,
    ADD COLUMN `fantasyName` VARCHAR(191) NULL,
    ADD COLUMN `jobRole` VARCHAR(191) NULL,
    ADD COLUMN `number` VARCHAR(191) NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `professionalRegistry` VARCHAR(191) NULL,
    ADD COLUMN `responsibleCpf` VARCHAR(191) NULL,
    ADD COLUMN `responsibleName` VARCHAR(191) NULL,
    ADD COLUMN `socialReason` VARCHAR(191) NULL,
    ADD COLUMN `state` VARCHAR(191) NULL,
    ADD COLUMN `stateRegistration` VARCHAR(191) NULL,
    ADD COLUMN `street` VARCHAR(191) NULL,
    ADD COLUMN `type` ENUM('PF', 'PJ') NOT NULL DEFAULT 'PF',
    ADD COLUMN `website` VARCHAR(191) NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL,
    MODIFY `fullName` VARCHAR(191) NULL,
    MODIFY `cpf` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Dependent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `kinship` ENUM('CONJUGE', 'FILHO') NOT NULL,
    `birthDate` DATETIME(3) NOT NULL,
    `userId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Profile_cnpj_key` ON `Profile`(`cnpj`);

-- AddForeignKey
ALTER TABLE `Profile` ADD CONSTRAINT `Profile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dependent` ADD CONSTRAINT `Dependent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialRecord` ADD CONSTRAINT `FinancialRecord_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRegistration` ADD CONSTRAINT `EventRegistration_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventRegistration` ADD CONSTRAINT `EventRegistration_eventId_fkey` FOREIGN KEY (`eventId`) REFERENCES `Event`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSignature` ADD CONSTRAINT `DocumentSignature_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DocumentSignature` ADD CONSTRAINT `DocumentSignature_documentId_fkey` FOREIGN KEY (`documentId`) REFERENCES `DocumentAta`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
