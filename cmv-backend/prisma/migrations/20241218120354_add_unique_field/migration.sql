/*
  Warnings:

  - A unique constraint covering the columns `[roleId,permissionId]` on the table `PermissionOnRole` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PermissionOnRole_roleId_permissionId_key" ON "cmv-it"."PermissionOnRole"("roleId", "permissionId");
