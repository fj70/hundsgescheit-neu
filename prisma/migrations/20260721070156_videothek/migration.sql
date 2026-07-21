-- CreateTable
CREATE TABLE "VideoProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "priceCents" INTEGER NOT NULL DEFAULT 0,
    "coverPath" TEXT,
    "videoUrl" TEXT NOT NULL DEFAULT '',
    "previewUrl" TEXT NOT NULL DEFAULT '',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "stripeSessionId" TEXT,
    "amountCents" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Purchase_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Purchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "VideoProduct" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VideoProduct_slug_key" ON "VideoProduct"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Purchase_customerId_productId_key" ON "Purchase"("customerId", "productId");
