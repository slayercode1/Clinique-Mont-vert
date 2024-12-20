-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cmv-fleet";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "cmv-it";

-- CreateEnum
CREATE TYPE "cmv-it"."Status" AS ENUM ('ACTIF', 'INACTIF');

-- CreateEnum
CREATE TYPE "cmv-it"."Priority" AS ENUM ('HIGT');

-- CreateEnum
CREATE TYPE "cmv-it"."StatusTicket" AS ENUM ('TODO');

-- CreateEnum
CREATE TYPE "cmv-it"."State" AS ENUM ('IN_USE', 'IN_REPAIR', 'OUT_OF_SERVICE');

-- CreateEnum
CREATE TYPE "cmv-fleet"."StateVehicle" AS ENUM ('IN_USE', 'IN_REPAIR', 'AVAILABLE');

-- CreateTable
CREATE TABLE "cmv-it"."User" (
    "id" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "lastname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "cmv-it"."Status" NOT NULL DEFAULT 'INACTIF',
    "roleId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."Session" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expired_at" TIMESTAMP(3) NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."Ticket" (
    "id" TEXT NOT NULL,
    "status" "cmv-it"."StatusTicket" NOT NULL DEFAULT 'TODO',
    "priority" "cmv-it"."Priority" NOT NULL DEFAULT 'HIGT',
    "created_at" TIMESTAMP(3) NOT NULL,
    "validated_at" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."Material" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "state" "cmv-it"."State" NOT NULL DEFAULT 'IN_USE',
    "purchase_date" DATE NOT NULL,
    "supplier" TEXT NOT NULL,
    "expired_at" DATE NOT NULL,
    "ticketId" TEXT NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."Permission" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-it"."PermissionOnRole" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "PermissionOnRole_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "cmv-fleet"."Vehicle" (
    "id" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "state" "cmv-fleet"."StateVehicle" NOT NULL DEFAULT 'IN_USE',
    "maintenance_date" DATE NOT NULL,
    "kilometres" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cmv-fleet"."Cost" (
    "id" TEXT NOT NULL,
    "cost" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "maintenance_date" DATE NOT NULL,
    "vehicleId" TEXT NOT NULL,

    CONSTRAINT "Cost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_userid_key" ON "cmv-it"."Session"("userid");

-- AddForeignKey
ALTER TABLE "cmv-it"."User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cmv-it"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."Session" ADD CONSTRAINT "Session_userid_fkey" FOREIGN KEY ("userid") REFERENCES "cmv-it"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cmv-it"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."Material" ADD CONSTRAINT "Material_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "cmv-it"."Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."PermissionOnRole" ADD CONSTRAINT "PermissionOnRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "cmv-it"."Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-it"."PermissionOnRole" ADD CONSTRAINT "PermissionOnRole_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "cmv-it"."Permission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cmv-fleet"."Cost" ADD CONSTRAINT "Cost_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "cmv-fleet"."Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
