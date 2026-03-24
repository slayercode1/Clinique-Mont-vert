-- AlterTable
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "date_circulation" DATE;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "carburant" TEXT;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "usage" TEXT;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "km_moyen_annuel" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "km_derniere_revision" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "jours_depuis_derniere_revision" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "km_depuis_derniere_revision" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "nb_revisions_effectuees" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "intervalle_recommande_jours" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "intervalle_recommande_km" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "condition_vehicule" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "nb_pannes_historique" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "age_vehicule" INTEGER;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "taux_utilisation_km" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "taux_utilisation_jours" DOUBLE PRECISION;
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN "revisions_par_an" DOUBLE PRECISION;
