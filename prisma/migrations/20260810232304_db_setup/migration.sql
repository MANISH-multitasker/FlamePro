-- CreateTable
CREATE TABLE "test" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "test_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "test_email_key" ON "test"("email");
