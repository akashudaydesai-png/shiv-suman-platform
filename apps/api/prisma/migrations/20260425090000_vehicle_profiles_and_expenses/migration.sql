-- AlterTable
ALTER TABLE "Vehicle"
ADD COLUMN     "registrationValidFrom" TIMESTAMP(3),
ADD COLUMN     "registrationValidUpto" TIMESTAMP(3),
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "liveLatitude" TEXT,
ADD COLUMN     "liveLongitude" TEXT,
ADD COLUMN     "liveLocationText" TEXT,
ADD COLUMN     "dtcCodes" TEXT,
ADD COLUMN     "fuelLevelPercent" INTEGER,
ADD COLUMN     "harshBrakingCount" INTEGER,
ADD COLUMN     "harshAccelerationCount" INTEGER,
ADD COLUMN     "idleMinutes" INTEGER,
ADD COLUMN     "liveOdometerKm" INTEGER,
ADD COLUMN     "insuranceCompanyName" TEXT,
ADD COLUMN     "insurancePolicyNumber" TEXT,
ADD COLUMN     "insuranceValidFrom" TIMESTAMP(3),
ADD COLUMN     "insuranceValidUpto" TIMESTAMP(3),
ADD COLUMN     "pucCertificateNo" TEXT,
ADD COLUMN     "pucValidFrom" TIMESTAMP(3),
ADD COLUMN     "pucValidUpto" TIMESTAMP(3),
ADD COLUMN     "odometerKm" INTEGER,
ADD COLUMN     "healthStatus" TEXT,
ADD COLUMN     "healthNotes" TEXT;

-- CreateTable
CREATE TABLE "VehicleExpense" (
    "id" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "expenseDate" TIMESTAMP(3) NOT NULL,
    "odometerKm" INTEGER,
    "vendorName" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VehicleExpense" ADD CONSTRAINT "VehicleExpense_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
