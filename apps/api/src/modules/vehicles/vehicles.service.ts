import { BadRequestException, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";

type VehicleExpenseRow = {
  id: string;
  type: string;
  amount: number;
  expenseDate: Date;
  odometerKm: number | null;
  vendorName: string | null;
  note: string | null;
};

type VehicleRow = {
  id: string;
  branchId: string;
  branchName: string;
  registrationNo: string;
  name: string;
  fuelType: string | null;
  fleetDeviceId: string | null;
  cameraDeviceId: string | null;
  liveLatitude: string | null;
  liveLongitude: string | null;
  liveLocationText: string | null;
  dtcCodes: string | null;
  fuelLevelPercent: number | null;
  harshBrakingCount: number | null;
  harshAccelerationCount: number | null;
  idleMinutes: number | null;
  liveOdometerKm: number | null;
  registrationValidFrom: Date | null;
  registrationValidUpto: Date | null;
  insuranceCompanyName: string | null;
  insurancePolicyNumber: string | null;
  insuranceValidFrom: Date | null;
  insuranceValidUpto: Date | null;
  pucCertificateNo: string | null;
  pucValidFrom: Date | null;
  pucValidUpto: Date | null;
  odometerKm: number | null;
  healthStatus: string | null;
  healthNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function upperText(value: unknown, fallback = "") {
  return text(value, fallback).toUpperCase();
}

function nullableText(value: unknown) {
  return text(value) || null;
}

function nullableUpperText(value: unknown) {
  const normalized = upperText(value);
  return normalized || null;
}

function optionalDate(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) throw new BadRequestException(`Invalid date value: ${raw}`);
  return parsed;
}

function optionalInt(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) throw new BadRequestException("Expected a whole number value.");
  return parsed;
}

function normalizeRegistrationNo(value: unknown) {
  const normalized = upperText(value).replace(/\s+/g, "");
  if (!/^MH\d{2}[A-Z]{2}\d{4}$/.test(normalized)) {
    throw new BadRequestException("Registration number must be in MH09DX6256 format.");
  }
  return normalized;
}

function toIsoOrNull(value: Date | null) {
  return value ? value.toISOString() : null;
}

function isSchemaCompatibilityError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  return (
    message.includes("column") ||
    message.includes("VehicleExpense") ||
    message.includes("does not exist") ||
    message.includes("Invalid `this.prisma.vehicle")
  );
}

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  private async loadLegacyVehicles(whereSql: string, params: unknown[]) {
    const vehicles = await this.prisma.$queryRawUnsafe<Array<{
      id: string;
      branchId: string;
      branchName: string;
      registrationNo: string;
      name: string;
      fleetDeviceId: string | null;
      cameraDeviceId: string | null;
      active: boolean;
      createdAt: Date;
      updatedAt: Date;
    }>>(
      `
        SELECT
          v.id,
          v."branchId" as "branchId",
          b.name as "branchName",
          v."registrationNo" as "registrationNo",
          v.name,
          v."fleetDeviceId" as "fleetDeviceId",
          v."cameraDeviceId" as "cameraDeviceId",
          v.active,
          v."createdAt" as "createdAt",
          v."updatedAt" as "updatedAt"
        FROM "Vehicle" v
        INNER JOIN "Branch" b ON b.id = v."branchId"
        ${whereSql}
        ORDER BY v."createdAt" DESC
      `,
      ...params
    );

    return vehicles.map((vehicle) =>
      this.mapLegacyVehicle({
        ...vehicle,
        branch: { name: vehicle.branchName }
      })
    );
  }

  private mapLegacyVehicle(vehicle: {
    id: string;
    branchId: string;
    registrationNo: string;
    name: string;
    fleetDeviceId: string | null;
    cameraDeviceId: string | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    branch: { name: string };
  }) {
    return {
      id: vehicle.id,
      branchId: vehicle.branchId,
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      fuelType: null,
      fleetDeviceId: vehicle.fleetDeviceId,
      cameraDeviceId: vehicle.cameraDeviceId,
      liveLatitude: null,
      liveLongitude: null,
      liveLocationText: null,
      dtcCodes: null,
      fuelLevelPercent: null,
      harshBrakingCount: null,
      harshAccelerationCount: null,
      idleMinutes: null,
      liveOdometerKm: null,
      registrationValidFrom: null,
      registrationValidUpto: null,
      insuranceCompanyName: null,
      insurancePolicyNumber: null,
      insuranceValidFrom: null,
      insuranceValidUpto: null,
      pucCertificateNo: null,
      pucValidFrom: null,
      pucValidUpto: null,
      odometerKm: null,
      healthStatus: null,
      healthNotes: null,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
      branch: { id: vehicle.branchId, name: vehicle.branch.name },
      expenses: [] as Array<{
        id: string;
        type: string;
        amount: number;
        expenseDate: string;
        odometerKm: number | null;
        vendorName: string | null;
        note: string | null;
      }>
    };
  }

  private async findAllLegacy() {
    return this.loadLegacyVehicles(`WHERE v.active = true`, []);
  }

  private async findOneLegacy(id: string) {
    const [vehicle] = await this.loadLegacyVehicles(`WHERE v.id = $1`, [id]);
    if (!vehicle) throw new BadRequestException("Car not found.");
    return vehicle;
  }

  private mapVehicle(vehicle: VehicleRow, expenses: VehicleExpenseRow[]) {
    return {
      id: vehicle.id,
      branchId: vehicle.branchId,
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      fuelType: vehicle.fuelType,
      fleetDeviceId: vehicle.fleetDeviceId,
      cameraDeviceId: vehicle.cameraDeviceId,
      liveLatitude: vehicle.liveLatitude,
      liveLongitude: vehicle.liveLongitude,
      liveLocationText: vehicle.liveLocationText,
      dtcCodes: vehicle.dtcCodes,
      fuelLevelPercent: vehicle.fuelLevelPercent,
      harshBrakingCount: vehicle.harshBrakingCount,
      harshAccelerationCount: vehicle.harshAccelerationCount,
      idleMinutes: vehicle.idleMinutes,
      liveOdometerKm: vehicle.liveOdometerKm,
      registrationValidFrom: toIsoOrNull(vehicle.registrationValidFrom),
      registrationValidUpto: toIsoOrNull(vehicle.registrationValidUpto),
      insuranceCompanyName: vehicle.insuranceCompanyName,
      insurancePolicyNumber: vehicle.insurancePolicyNumber,
      insuranceValidFrom: toIsoOrNull(vehicle.insuranceValidFrom),
      insuranceValidUpto: toIsoOrNull(vehicle.insuranceValidUpto),
      pucCertificateNo: vehicle.pucCertificateNo,
      pucValidFrom: toIsoOrNull(vehicle.pucValidFrom),
      pucValidUpto: toIsoOrNull(vehicle.pucValidUpto),
      odometerKm: vehicle.odometerKm,
      healthStatus: vehicle.healthStatus,
      healthNotes: vehicle.healthNotes,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
      branch: { id: vehicle.branchId, name: vehicle.branchName },
      expenses: expenses.map((expense) => ({
        id: expense.id,
        type: expense.type,
        amount: expense.amount,
        expenseDate: expense.expenseDate.toISOString(),
        odometerKm: expense.odometerKm,
        vendorName: expense.vendorName,
        note: expense.note
      }))
    };
  }

  private async loadExpenses(vehicleIds: string[]) {
    if (!vehicleIds.length) return new Map<string, VehicleExpenseRow[]>();

    const rows = await this.prisma.$queryRawUnsafe<VehicleExpenseRow[]>(
      `
        SELECT
          id,
          "vehicleId" as "vehicleId",
          type,
          amount,
          "expenseDate" as "expenseDate",
          "odometerKm" as "odometerKm",
          "vendorName" as "vendorName",
          note
        FROM "VehicleExpense"
        WHERE "vehicleId" = ANY($1::text[])
        ORDER BY "expenseDate" DESC, "createdAt" DESC
      `,
      vehicleIds
    ) as Array<VehicleExpenseRow & { vehicleId: string }>;

    const grouped = new Map<string, VehicleExpenseRow[]>();
    rows.forEach((row) => {
      const current = grouped.get(row.vehicleId) ?? [];
      current.push({
        id: row.id,
        type: row.type,
        amount: row.amount,
        expenseDate: new Date(row.expenseDate),
        odometerKm: row.odometerKm,
        vendorName: row.vendorName,
        note: row.note
      });
      grouped.set(row.vehicleId, current);
    });
    return grouped;
  }

  private async loadVehicles(whereSql: string, params: unknown[]) {
    const vehicles = await this.prisma.$queryRawUnsafe<VehicleRow[]>(
      `
        SELECT
          v.id,
          v."branchId" as "branchId",
          b.name as "branchName",
          v."registrationNo" as "registrationNo",
          v.name,
          v."fuelType" as "fuelType",
          v."fleetDeviceId" as "fleetDeviceId",
          v."cameraDeviceId" as "cameraDeviceId",
          v."liveLatitude" as "liveLatitude",
          v."liveLongitude" as "liveLongitude",
          v."liveLocationText" as "liveLocationText",
          v."dtcCodes" as "dtcCodes",
          v."fuelLevelPercent" as "fuelLevelPercent",
          v."harshBrakingCount" as "harshBrakingCount",
          v."harshAccelerationCount" as "harshAccelerationCount",
          v."idleMinutes" as "idleMinutes",
          v."liveOdometerKm" as "liveOdometerKm",
          v."registrationValidFrom" as "registrationValidFrom",
          v."registrationValidUpto" as "registrationValidUpto",
          v."insuranceCompanyName" as "insuranceCompanyName",
          v."insurancePolicyNumber" as "insurancePolicyNumber",
          v."insuranceValidFrom" as "insuranceValidFrom",
          v."insuranceValidUpto" as "insuranceValidUpto",
          v."pucCertificateNo" as "pucCertificateNo",
          v."pucValidFrom" as "pucValidFrom",
          v."pucValidUpto" as "pucValidUpto",
          v."odometerKm" as "odometerKm",
          v."healthStatus" as "healthStatus",
          v."healthNotes" as "healthNotes",
          v."createdAt" as "createdAt",
          v."updatedAt" as "updatedAt"
        FROM "Vehicle" v
        INNER JOIN "Branch" b ON b.id = v."branchId"
        ${whereSql}
        ORDER BY v."createdAt" DESC
      `,
      ...params
    );

    const expenseMap = await this.loadExpenses(vehicles.map((vehicle) => vehicle.id));
    return vehicles.map((vehicle) => this.mapVehicle(vehicle, expenseMap.get(vehicle.id) ?? []));
  }

  private async findOne(id: string) {
    const [vehicle] = await this.loadVehicles(`WHERE v.id = $1`, [id]);
    if (!vehicle) throw new BadRequestException("Car not found.");
    return vehicle;
  }

  findAll() {
    return this.loadVehicles(`WHERE v.active = true`, []).catch((error) => {
      if (isSchemaCompatibilityError(error)) return this.findAllLegacy();
      throw error;
    });
  }

  async create(body: Record<string, unknown>) {
    const branchId = text(body.branchId);
    const registrationNo = normalizeRegistrationNo(body.registrationNo);
    const name = upperText(body.name);

    if (!branchId || !registrationNo || !name) {
      throw new BadRequestException("Branch, car name, and registration number are required.");
    }

    const vehicleId = `veh_${randomUUID().replace(/-/g, "")}`;
    try {
      const result = await this.prisma.$queryRawUnsafe<Array<{ id: string }>>(
        `
        INSERT INTO "Vehicle" (
          "branchId",
          "registrationNo",
          "name",
          "fuelType",
          "fleetDeviceId",
          "cameraDeviceId",
          "liveLatitude",
          "liveLongitude",
          "liveLocationText",
          "dtcCodes",
          "fuelLevelPercent",
          "harshBrakingCount",
          "harshAccelerationCount",
          "idleMinutes",
          "liveOdometerKm",
          "registrationValidFrom",
          "registrationValidUpto",
          "insuranceCompanyName",
          "insurancePolicyNumber",
          "insuranceValidFrom",
          "insuranceValidUpto",
          "pucCertificateNo",
          "pucValidFrom",
          "pucValidUpto",
          "odometerKm",
          "healthStatus",
          "healthNotes",
          "createdAt",
          "updatedAt",
          "active",
          "id"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, NOW(), NOW(), true, $28
        )
        RETURNING id
      `,
      branchId,
      registrationNo,
      name,
      nullableUpperText(body.fuelType),
      nullableUpperText(body.fleetDeviceId),
      nullableUpperText(body.cameraDeviceId),
      nullableText(body.liveLatitude),
      nullableText(body.liveLongitude),
      nullableUpperText(body.liveLocationText),
      nullableUpperText(body.dtcCodes),
      optionalInt(body.fuelLevelPercent),
      optionalInt(body.harshBrakingCount),
      optionalInt(body.harshAccelerationCount),
      optionalInt(body.idleMinutes),
      optionalInt(body.liveOdometerKm),
      optionalDate(body.registrationValidFrom),
      optionalDate(body.registrationValidUpto),
      nullableUpperText(body.insuranceCompanyName),
      nullableUpperText(body.insurancePolicyNumber),
      optionalDate(body.insuranceValidFrom),
      optionalDate(body.insuranceValidUpto),
      nullableUpperText(body.pucCertificateNo),
      optionalDate(body.pucValidFrom),
      optionalDate(body.pucValidUpto),
      optionalInt(body.odometerKm),
      nullableUpperText(body.healthStatus),
      nullableUpperText(body.healthNotes),
      vehicleId
      );

      return this.findOne(result[0].id);
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) throw error;

      await this.prisma.$executeRawUnsafe(
        `
          INSERT INTO "Vehicle" (
            "id",
            "branchId",
            "registrationNo",
            "name",
            "fleetDeviceId",
            "cameraDeviceId",
            "active",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
        `,
        vehicleId,
        branchId,
        registrationNo,
        name,
        nullableUpperText(body.fleetDeviceId),
        nullableUpperText(body.cameraDeviceId)
      );
      return this.findOneLegacy(vehicleId);
    }
  }

  async update(id: string, body: Record<string, unknown>) {
    try {
      const currentRows = await this.prisma.$queryRawUnsafe<VehicleRow[]>(
        `
        SELECT
          id,
          "branchId" as "branchId",
          "registrationNo" as "registrationNo",
          name,
          "fuelType" as "fuelType",
          "fleetDeviceId" as "fleetDeviceId",
          "cameraDeviceId" as "cameraDeviceId",
          "liveLatitude" as "liveLatitude",
          "liveLongitude" as "liveLongitude",
          "liveLocationText" as "liveLocationText",
          "dtcCodes" as "dtcCodes",
          "fuelLevelPercent" as "fuelLevelPercent",
          "harshBrakingCount" as "harshBrakingCount",
          "harshAccelerationCount" as "harshAccelerationCount",
          "idleMinutes" as "idleMinutes",
          "liveOdometerKm" as "liveOdometerKm",
          "registrationValidFrom" as "registrationValidFrom",
          "registrationValidUpto" as "registrationValidUpto",
          "insuranceCompanyName" as "insuranceCompanyName",
          "insurancePolicyNumber" as "insurancePolicyNumber",
          "insuranceValidFrom" as "insuranceValidFrom",
          "insuranceValidUpto" as "insuranceValidUpto",
          "pucCertificateNo" as "pucCertificateNo",
          "pucValidFrom" as "pucValidFrom",
          "pucValidUpto" as "pucValidUpto",
          "odometerKm" as "odometerKm",
          "healthStatus" as "healthStatus",
          "healthNotes" as "healthNotes",
          "createdAt" as "createdAt",
          "updatedAt" as "updatedAt",
          '' as "branchName"
        FROM "Vehicle"
        WHERE id = $1
      `,
        id
      );

      const current = currentRows[0];
      if (!current) throw new BadRequestException("Car not found.");

      const nextBranchId = body.branchId === undefined ? current.branchId : text(body.branchId);
      const nextRegistrationNo = body.registrationNo === undefined ? current.registrationNo : normalizeRegistrationNo(body.registrationNo);
      const nextName = body.name === undefined ? current.name : upperText(body.name);

      if (!nextBranchId || !nextRegistrationNo || !nextName) {
        throw new BadRequestException("Branch, car name, and registration number are required.");
      }

      await this.prisma.$executeRawUnsafe(
        `
        UPDATE "Vehicle"
        SET
          "branchId" = $2,
          "registrationNo" = $3,
          "name" = $4,
          "fuelType" = $5,
          "fleetDeviceId" = $6,
          "cameraDeviceId" = $7,
          "liveLatitude" = $8,
          "liveLongitude" = $9,
          "liveLocationText" = $10,
          "dtcCodes" = $11,
          "fuelLevelPercent" = $12,
          "harshBrakingCount" = $13,
          "harshAccelerationCount" = $14,
          "idleMinutes" = $15,
          "liveOdometerKm" = $16,
          "registrationValidFrom" = $17,
          "registrationValidUpto" = $18,
          "insuranceCompanyName" = $19,
          "insurancePolicyNumber" = $20,
          "insuranceValidFrom" = $21,
          "insuranceValidUpto" = $22,
          "pucCertificateNo" = $23,
          "pucValidFrom" = $24,
          "pucValidUpto" = $25,
          "odometerKm" = $26,
          "healthStatus" = $27,
          "healthNotes" = $28,
          "updatedAt" = NOW()
        WHERE id = $1
      `,
      id,
      nextBranchId,
      nextRegistrationNo,
      nextName,
      body.fuelType === undefined ? current.fuelType : nullableUpperText(body.fuelType),
      body.fleetDeviceId === undefined ? current.fleetDeviceId : nullableUpperText(body.fleetDeviceId),
      body.cameraDeviceId === undefined ? current.cameraDeviceId : nullableUpperText(body.cameraDeviceId),
      body.liveLatitude === undefined ? current.liveLatitude : nullableText(body.liveLatitude),
      body.liveLongitude === undefined ? current.liveLongitude : nullableText(body.liveLongitude),
      body.liveLocationText === undefined ? current.liveLocationText : nullableUpperText(body.liveLocationText),
      body.dtcCodes === undefined ? current.dtcCodes : nullableUpperText(body.dtcCodes),
      body.fuelLevelPercent === undefined ? current.fuelLevelPercent : optionalInt(body.fuelLevelPercent),
      body.harshBrakingCount === undefined ? current.harshBrakingCount : optionalInt(body.harshBrakingCount),
      body.harshAccelerationCount === undefined ? current.harshAccelerationCount : optionalInt(body.harshAccelerationCount),
      body.idleMinutes === undefined ? current.idleMinutes : optionalInt(body.idleMinutes),
      body.liveOdometerKm === undefined ? current.liveOdometerKm : optionalInt(body.liveOdometerKm),
      body.registrationValidFrom === undefined ? current.registrationValidFrom : optionalDate(body.registrationValidFrom),
      body.registrationValidUpto === undefined ? current.registrationValidUpto : optionalDate(body.registrationValidUpto),
      body.insuranceCompanyName === undefined ? current.insuranceCompanyName : nullableUpperText(body.insuranceCompanyName),
      body.insurancePolicyNumber === undefined ? current.insurancePolicyNumber : nullableUpperText(body.insurancePolicyNumber),
      body.insuranceValidFrom === undefined ? current.insuranceValidFrom : optionalDate(body.insuranceValidFrom),
      body.insuranceValidUpto === undefined ? current.insuranceValidUpto : optionalDate(body.insuranceValidUpto),
      body.pucCertificateNo === undefined ? current.pucCertificateNo : nullableUpperText(body.pucCertificateNo),
      body.pucValidFrom === undefined ? current.pucValidFrom : optionalDate(body.pucValidFrom),
      body.pucValidUpto === undefined ? current.pucValidUpto : optionalDate(body.pucValidUpto),
      body.odometerKm === undefined ? current.odometerKm : optionalInt(body.odometerKm),
      body.healthStatus === undefined ? current.healthStatus : nullableUpperText(body.healthStatus),
      body.healthNotes === undefined ? current.healthNotes : nullableUpperText(body.healthNotes)
      );

      return this.findOne(id);
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) throw error;

      const legacyCurrentRows = await this.prisma.$queryRawUnsafe<Array<{
        id: string;
        branchId: string;
        registrationNo: string;
        name: string;
        fleetDeviceId: string | null;
        cameraDeviceId: string | null;
      }>>(
        `
          SELECT
            id,
            "branchId" as "branchId",
            "registrationNo" as "registrationNo",
            name,
            "fleetDeviceId" as "fleetDeviceId",
            "cameraDeviceId" as "cameraDeviceId"
          FROM "Vehicle"
          WHERE id = $1
        `,
        id
      );
      const legacyCurrent = legacyCurrentRows[0];
      if (!legacyCurrent) throw new BadRequestException("Car not found.");

      await this.prisma.$executeRawUnsafe(
        `
          UPDATE "Vehicle"
          SET
            "branchId" = $2,
            "registrationNo" = $3,
            "name" = $4,
            "fleetDeviceId" = $5,
            "cameraDeviceId" = $6,
            "updatedAt" = NOW()
          WHERE id = $1
        `,
        id,
        body.branchId === undefined ? legacyCurrent.branchId : text(body.branchId),
        body.registrationNo === undefined ? legacyCurrent.registrationNo : normalizeRegistrationNo(body.registrationNo),
        body.name === undefined ? legacyCurrent.name : upperText(body.name),
        body.fleetDeviceId === undefined ? legacyCurrent.fleetDeviceId : nullableUpperText(body.fleetDeviceId),
        body.cameraDeviceId === undefined ? legacyCurrent.cameraDeviceId : nullableUpperText(body.cameraDeviceId)
      );
      return this.findOneLegacy(id);
    }
  }

  async addExpense(vehicleId: string, body: Record<string, unknown>) {
    const type = upperText(body.type);
    const amount = optionalInt(body.amount);
    const expenseDate = optionalDate(body.expenseDate);

    if (!type || amount === null || amount <= 0 || !expenseDate) {
      throw new BadRequestException("Expense type, amount, and expense date are required.");
    }

    const expenseId = `vexp_${randomUUID().replace(/-/g, "")}`;
    try {
      await this.prisma.$executeRawUnsafe(
        `
        INSERT INTO "VehicleExpense" (
          "id",
          "vehicleId",
          "type",
          "amount",
          "expenseDate",
          "odometerKm",
          "vendorName",
          "note",
          "createdAt",
          "updatedAt"
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
        )
      `,
      expenseId,
      vehicleId,
      type,
      amount,
      expenseDate,
      optionalInt(body.odometerKm),
      nullableUpperText(body.vendorName),
      nullableUpperText(body.note)
      );

      return { ok: true };
    } catch (error) {
      if (isSchemaCompatibilityError(error)) {
        throw new BadRequestException("Vehicle expense table is not ready yet. Please run the latest database migration.");
      }
      throw error;
    }
  }

  async deactivate(id: string) {
    try {
      await this.prisma.$executeRawUnsafe(`UPDATE "Vehicle" SET active = false, "updatedAt" = NOW() WHERE id = $1`, id);
      return this.findOne(id);
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) throw error;
      await this.prisma.$executeRawUnsafe(`UPDATE "Vehicle" SET active = false, "updatedAt" = NOW() WHERE id = $1`, id);
      return this.findOneLegacy(id);
    }
  }
}
