-- DropForeignKey
ALTER TABLE "cmv-it"."Material" DROP CONSTRAINT "Material_ticketId_fkey";

-- AlterTable
ALTER TABLE "cmv-it"."Material" ALTER COLUMN "ticketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cmv-it"."Material" ADD CONSTRAINT "Material_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "cmv-it"."Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
