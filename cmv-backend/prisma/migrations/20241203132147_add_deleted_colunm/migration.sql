-- AlterTable
ALTER TABLE "cmv-fleet"."Cost" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cmv-it"."Material" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cmv-it"."Ticket" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "cmv-it"."User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
