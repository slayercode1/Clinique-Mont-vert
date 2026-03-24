-- AlterTable
ALTER TABLE "cmv-fleet"."Vehicle" ADD COLUMN     "prediction_date" TIMESTAMP(3),
ADD COLUMN     "prediction_estimation_jours" DOUBLE PRECISION,
ADD COLUMN     "prediction_estimation_mois" DOUBLE PRECISION,
ADD COLUMN     "prediction_fourchette_max_mois" DOUBLE PRECISION,
ADD COLUMN     "prediction_fourchette_min_mois" DOUBLE PRECISION,
ADD COLUMN     "prediction_recommandation" TEXT;
