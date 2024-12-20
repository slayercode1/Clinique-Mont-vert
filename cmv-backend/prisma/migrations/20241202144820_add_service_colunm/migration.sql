/*
  Warnings:

  - You are about to drop the column `servive` on the `Ticket` table. All the data in the column will be lost.
  - Added the required column `serviceId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "cmv-it"."Ticket" DROP COLUMN "servive",
ADD COLUMN     "serviceId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cmv-it"."User" ADD COLUMN     "serviceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "cmv-it"."Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "cmv-it"."User" ADD CONSTRAINT "User_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "cmv-it"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "cmv-it"."Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
