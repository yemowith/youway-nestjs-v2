-- CreateTable
CREATE TABLE "youwayapp"."Question" (
    "id" UUID NOT NULL,
    "question" VARCHAR(255) NOT NULL,
    "answers" JSON NOT NULL,
    "group" VARCHAR(255) NOT NULL DEFAULT 'general',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);
