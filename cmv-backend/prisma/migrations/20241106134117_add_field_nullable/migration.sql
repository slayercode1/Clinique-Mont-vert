-- DropForeignKey
ALTER TABLE "cmv-it"."Ticket" DROP CONSTRAINT "Ticket_resolvedById_fkey";

-- AlterTable
ALTER TABLE "cmv-it"."Ticket" ALTER COLUMN "validated_at" DROP NOT NULL,
ALTER COLUMN "resolvedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "cmv-it"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
