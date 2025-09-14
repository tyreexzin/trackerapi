-- CreateTable
CREATE TABLE "public"."sellers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "apiKey" TEXT NOT NULL,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."settings" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "pix_provider_primary" TEXT,
    "pix_provider_secondary" TEXT,
    "pix_provider_tertiary" TEXT,
    "pushinpay_token" TEXT,
    "stripe_public_key" TEXT,
    "stripe_secret_key" TEXT,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pixels" (
    "id" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "pixel_id" TEXT NOT NULL,
    "meta_api_token" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "pixels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bots" (
    "id" TEXT NOT NULL,
    "bot_name" TEXT NOT NULL,
    "bot_token" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "bots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."pressels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "white_page_url" TEXT,
    "sellerId" TEXT NOT NULL,
    "botId" TEXT NOT NULL,

    CONSTRAINT "pressels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."checkouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "redirect_url" TEXT NOT NULL,
    "value_type" TEXT NOT NULL,
    "fixed_value_cents" INTEGER,
    "sellerId" TEXT NOT NULL,

    CONSTRAINT "checkouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."clicks" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sellerId" TEXT NOT NULL,
    "presselId" TEXT,
    "checkoutId" TEXT,
    "referer" TEXT,
    "user_agent" TEXT,
    "fbclid" TEXT,
    "fbp" TEXT,
    "fbc" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "utm_content" TEXT,
    "utm_term" TEXT,

    CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" TEXT NOT NULL,
    "clickId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "pix_value" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "transaction_id_provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_PresselPixels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PresselPixels_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_CheckoutPixels" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CheckoutPixels_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "sellers_email_key" ON "public"."sellers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sellers_apiKey_key" ON "public"."sellers"("apiKey");

-- CreateIndex
CREATE UNIQUE INDEX "settings_sellerId_key" ON "public"."settings"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_clickId_key" ON "public"."transactions"("clickId");

-- CreateIndex
CREATE INDEX "_PresselPixels_B_index" ON "public"."_PresselPixels"("B");

-- CreateIndex
CREATE INDEX "_CheckoutPixels_B_index" ON "public"."_CheckoutPixels"("B");

-- AddForeignKey
ALTER TABLE "public"."settings" ADD CONSTRAINT "settings_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pixels" ADD CONSTRAINT "pixels_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bots" ADD CONSTRAINT "bots_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pressels" ADD CONSTRAINT "pressels_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."pressels" ADD CONSTRAINT "pressels_botId_fkey" FOREIGN KEY ("botId") REFERENCES "public"."bots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."checkouts" ADD CONSTRAINT "checkouts_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clicks" ADD CONSTRAINT "clicks_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clicks" ADD CONSTRAINT "clicks_presselId_fkey" FOREIGN KEY ("presselId") REFERENCES "public"."pressels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."clicks" ADD CONSTRAINT "clicks_checkoutId_fkey" FOREIGN KEY ("checkoutId") REFERENCES "public"."checkouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_clickId_fkey" FOREIGN KEY ("clickId") REFERENCES "public"."clicks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "public"."sellers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PresselPixels" ADD CONSTRAINT "_PresselPixels_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."pixels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_PresselPixels" ADD CONSTRAINT "_PresselPixels_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."pressels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CheckoutPixels" ADD CONSTRAINT "_CheckoutPixels_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."checkouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CheckoutPixels" ADD CONSTRAINT "_CheckoutPixels_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."pixels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
