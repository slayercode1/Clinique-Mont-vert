/*
  Warnings:

  - You are about to drop the column `userId` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `decription` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employeeId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resolvedById` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servive` to the `Ticket` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "cmv-it"."Priority" ADD VALUE 'MEDIUM';
ALTER TYPE "cmv-it"."Priority" ADD VALUE 'LOW';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "cmv-it"."StatusTicket" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "cmv-it"."StatusTicket" ADD VALUE 'CLOSED';

-- DropForeignKey
ALTER TABLE "cmv-it"."Ticket" DROP CONSTRAINT "Ticket_userId_fkey";

-- AlterTable
ALTER TABLE "cmv-it"."Ticket" DROP COLUMN "userId",
ADD COLUMN     "decription" TEXT NOT NULL,
ADD COLUMN     "employeeId" TEXT NOT NULL,
ADD COLUMN     "resolvedById" TEXT NOT NULL,
ADD COLUMN     "servive" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "cmv-it"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "cmv-it"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
