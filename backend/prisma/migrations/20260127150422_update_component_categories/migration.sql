-- AlterEnum: Update ComponentCategory enum with new values
-- Step 1: Create new enum type with all values (old + new)
CREATE TYPE "ComponentCategory_new" AS ENUM ('FOUNDATION', 'FORM_CONTROLS', 'BUTTONS', 'FEEDBACK', 'NAVIGATION', 'LAYOUT', 'DATA_DISPLAY', 'MEDIA', 'FUNDAMENTAIS', 'NAVEGACAO', 'DADOS');

-- Step 2: Migrate existing data to temporary new categories
ALTER TABLE "components" ALTER COLUMN "category" TYPE "ComponentCategory_new" USING ("category"::text::"ComponentCategory_new");

-- Step 3: Update old categories to new ones based on component names
-- FUNDAMENTAIS → categorize based on component name
UPDATE "components"
SET "category" = 'BUTTONS'
WHERE "category" = 'FUNDAMENTAIS' AND (
  LOWER("name") LIKE '%button%' OR
  LOWER("name") LIKE '%btn%'
);

UPDATE "components"
SET "category" = 'FORM_CONTROLS'
WHERE "category" = 'FUNDAMENTAIS' AND (
  LOWER("name") LIKE '%input%' OR
  LOWER("name") LIKE '%checkbox%' OR
  LOWER("name") LIKE '%switch%' OR
  LOWER("name") LIKE '%dropdown%' OR
  LOWER("name") LIKE '%select%' OR
  LOWER("name") LIKE '%radio%' OR
  LOWER("name") LIKE '%toggle%'
);

UPDATE "components"
SET "category" = 'FOUNDATION'
WHERE "category" = 'FUNDAMENTAIS' AND (
  LOWER("name") LIKE '%tipografia%' OR
  LOWER("name") LIKE '%typography%' OR
  LOWER("name") LIKE '%font%' OR
  LOWER("name") LIKE '%color%' OR
  LOWER("name") LIKE '%cor%'
);

UPDATE "components"
SET "category" = 'MEDIA'
WHERE "category" = 'FUNDAMENTAIS' AND (
  LOWER("name") LIKE '%icon%' OR
  LOWER("name") LIKE '%logo%' OR
  LOWER("name") LIKE '%image%'
);

-- Remaining FUNDAMENTAIS go to FORM_CONTROLS as default
UPDATE "components"
SET "category" = 'FORM_CONTROLS'
WHERE "category" = 'FUNDAMENTAIS';

-- NAVEGACAO → NAVIGATION
UPDATE "components"
SET "category" = 'NAVIGATION'
WHERE "category" = 'NAVEGACAO';

-- DADOS → DATA_DISPLAY
UPDATE "components"
SET "category" = 'DATA_DISPLAY'
WHERE "category" = 'DADOS';

-- Step 4: Drop old enum and rename new one
DROP TYPE "ComponentCategory";
ALTER TYPE "ComponentCategory_new" RENAME TO "ComponentCategory";
