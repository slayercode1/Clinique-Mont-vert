-- AlterEnum
ALTER TYPE "cmv-it"."StatusTicket" ADD VALUE 'BLOCKED';

-- AlterTable
ALTER TABLE "cmv-it"."Ticket" ADD COLUMN     "assignId" TEXT;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_assignId_fkey" FOREIGN KEY ("assignId") REFERENCES "cmv-it"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
