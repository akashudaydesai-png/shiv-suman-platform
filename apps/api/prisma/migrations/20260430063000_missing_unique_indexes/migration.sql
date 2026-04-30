CREATE UNIQUE INDEX IF NOT EXISTS "RtoService_name_key" ON "RtoService"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "NotificationTemplate_name_key" ON "NotificationTemplate"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "Receipt_paymentId_key" ON "Receipt"("paymentId");
