-- CreateEnum
CREATE TYPE "public"."PropertyStatus" AS ENUM ('UPCOMING', 'UNDER_CONSTRUCTION', 'READY', 'COMPLETED', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "public"."SalesStatus" AS ENUM ('AVAILABLE', 'LIMITED_AVAILABILITY', 'SOLD_OUT', 'COMING_SOON');

-- CreateEnum
CREATE TYPE "public"."PropertyType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INDUSTRIAL');

-- CreateEnum
CREATE TYPE "public"."UnitStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'SOLD', 'NOT_AVAILABLE');

-- CreateEnum
CREATE TYPE "public"."ImageTag" AS ENUM ('HERO', 'GALLERY', 'AMENITY', 'LOCATION', 'FLOOR_PLAN', 'EXTERIOR', 'INTERIOR', 'LIFESTYLE', 'MASTER_PLAN');

-- CreateTable
CREATE TABLE "public"."developers" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo" TEXT,
    "description" TEXT,
    "website" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "headquarters" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cities" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_ar" TEXT,
    "country" TEXT NOT NULL DEFAULT 'UAE',
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."districts" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_ar" TEXT,
    "city_id" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."properties" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "developer_id" TEXT NOT NULL,
    "city_id" TEXT NOT NULL,
    "district_id" TEXT,
    "status" "public"."PropertyStatus" NOT NULL DEFAULT 'UPCOMING',
    "salesStatus" "public"."SalesStatus" NOT NULL DEFAULT 'AVAILABLE',
    "propertyType" "public"."PropertyType" NOT NULL DEFAULT 'RESIDENTIAL',
    "address" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'AED',
    "min_area" DOUBLE PRECISION,
    "max_area" DOUBLE PRECISION,
    "area_unit" TEXT NOT NULL DEFAULT 'sqft',
    "launch_date" TIMESTAMP(3),
    "delivery_date" TIMESTAMP(3),
    "handover_year" INTEGER,
    "handover_quarter" INTEGER,
    "hero_image" TEXT,
    "brochure_url" TEXT,
    "video_url" TEXT,
    "amenities" TEXT[],
    "facilities" TEXT[],
    "payment_plans" TEXT[],
    "meta_title" TEXT,
    "meta_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."units" (
    "id" TEXT NOT NULL,
    "external_id" INTEGER,
    "property_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "unit_type" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "price" DOUBLE PRECISION,
    "price_per_sqft" DOUBLE PRECISION,
    "floor" INTEGER,
    "view" TEXT,
    "orientation" TEXT,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "maid_room" BOOLEAN NOT NULL DEFAULT false,
    "study_room" BOOLEAN NOT NULL DEFAULT false,
    "laundry_room" BOOLEAN NOT NULL DEFAULT false,
    "status" "public"."UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "availability" INTEGER NOT NULL DEFAULT 1,
    "service_charge" DOUBLE PRECISION,
    "payment_plan" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."floor_plans" (
    "id" TEXT NOT NULL,
    "property_id" TEXT,
    "unit_id" TEXT,
    "title" TEXT NOT NULL,
    "plan_type" TEXT NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" DOUBLE PRECISION,
    "size" DOUBLE PRECISION,
    "image_url" TEXT,
    "pdf_url" TEXT,
    "pages" JSONB,
    "width" INTEGER,
    "height" INTEGER,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floor_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."property_images" (
    "id" TEXT NOT NULL,
    "property_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "tag" "public"."ImageTag" NOT NULL DEFAULT 'GALLERY',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "property_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."unit_images" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "caption" TEXT,
    "tag" "public"."ImageTag" NOT NULL DEFAULT 'GALLERY',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "width" INTEGER,
    "height" INTEGER,
    "file_size" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_images_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "developers_external_id_key" ON "public"."developers"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "developers_slug_key" ON "public"."developers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cities_external_id_key" ON "public"."cities"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "cities_slug_key" ON "public"."cities"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "districts_external_id_key" ON "public"."districts"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "districts_slug_key" ON "public"."districts"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "properties_external_id_key" ON "public"."properties"("external_id");

-- CreateIndex
CREATE UNIQUE INDEX "properties_slug_key" ON "public"."properties"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "units_external_id_key" ON "public"."units"("external_id");

-- AddForeignKey
ALTER TABLE "public"."districts" ADD CONSTRAINT "districts_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."properties" ADD CONSTRAINT "properties_developer_id_fkey" FOREIGN KEY ("developer_id") REFERENCES "public"."developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."properties" ADD CONSTRAINT "properties_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."properties" ADD CONSTRAINT "properties_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "public"."districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."units" ADD CONSTRAINT "units_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."floor_plans" ADD CONSTRAINT "floor_plans_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."floor_plans" ADD CONSTRAINT "floor_plans_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."property_images" ADD CONSTRAINT "property_images_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."unit_images" ADD CONSTRAINT "unit_images_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "public"."units"("id") ON DELETE CASCADE ON UPDATE CASCADE;
