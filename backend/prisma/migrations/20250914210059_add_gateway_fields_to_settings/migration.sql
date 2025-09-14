-- AlterTable
ALTER TABLE "public"."settings" ADD COLUMN     "cnpay_public_key" TEXT,
ADD COLUMN     "cnpay_secret_key" TEXT,
ADD COLUMN     "oasyfy_public_key" TEXT,
ADD COLUMN     "oasyfy_secret_key" TEXT,
ADD COLUMN     "syncpay_client_id" TEXT,
ADD COLUMN     "syncpay_client_secret" TEXT;
