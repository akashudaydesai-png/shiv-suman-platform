ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "staffId" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "mimeType" TEXT;
ALTER TABLE "Document" ADD COLUMN IF NOT EXISTS "sizeBytes" INTEGER;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Document_staffId_fkey'
  ) THEN
    ALTER TABLE "Document"
      ADD CONSTRAINT "Document_staffId_fkey"
      FOREIGN KEY ("staffId") REFERENCES "StaffProfile"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
