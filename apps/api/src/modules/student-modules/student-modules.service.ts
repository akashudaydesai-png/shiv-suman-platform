import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";

const allowedModules = new Set([
  "quiz",
  "attendance",
  "video_lectures",
  "trainer_feedback",
  "student_feedback",
  "fleet_device_data",
  "car_camera_recording"
]);
const allowedAdminModules = new Set([
  "swap-students",
  "change-trainer",
  "pause-students",
  "stop-students",
  "stop-refund",
  "extended-training"
]);

function parseDay(value: unknown) {
  const day = Number(value);
  if (!Number.isInteger(day) || day < 1 || day > 31) throw new BadRequestException("Day must be between 1 and 31.");
  return day;
}

@Injectable()
export class StudentModulesService {
  constructor(private readonly prisma: PrismaService) {}

  private validateModule(module: string) {
    if (!allowedModules.has(module)) throw new BadRequestException("Invalid module.");
  }

  private validateAdminModule(module: string) {
    if (!allowedAdminModules.has(module)) throw new BadRequestException("Invalid admin action module.");
  }

  async getModuleRecords(userId: string, module: string) {
    this.validateModule(module);
    const entityType = `STUDENT_MODULE:${module}`;
    const logs = await this.prisma.auditLog.findMany({
      where: {
        entityType,
        entityId: { startsWith: `${userId}:` }
      },
      orderBy: { createdAt: "desc" }
    });

    const byDay = new Map<number, { day: number; data: Record<string, unknown>; updatedAt: string }>();
    for (const log of logs) {
      const dayText = log.entityId.split(":")[1];
      const day = Number(dayText);
      if (!Number.isInteger(day) || byDay.has(day)) continue;
      byDay.set(day, {
        day,
        data: (log.afterJson as Record<string, unknown> | null) ?? {},
        updatedAt: log.createdAt.toISOString()
      });
    }

    return Array.from(byDay.values()).sort((a, b) => a.day - b.day);
  }

  async upsertModuleRecord(userId: string, module: string, body: Record<string, unknown>, actorUserId?: string) {
    this.validateModule(module);
    const day = parseDay(body.day);
    const data = typeof body.data === "object" && body.data ? (body.data as Prisma.InputJsonObject) : {};
    return this.prisma.auditLog.create({
      data: {
        actorUserId: actorUserId || null,
        entityType: `STUDENT_MODULE:${module}`,
        entityId: `${userId}:${day}`,
        action: "UPSERT",
        afterJson: data
      }
    });
  }

  async getAdminActionRecords(module: string) {
    this.validateAdminModule(module);
    const entityType = `STUDENT_ADMIN_ACTION:${module}`;
    const logs = await this.prisma.auditLog.findMany({
      where: { entityType },
      orderBy: { createdAt: "desc" }
    });

    const studentUserIds = Array.from(new Set(logs.map((log) => log.entityId)));
    const actorUserIds = Array.from(new Set(logs.map((log) => log.actorUserId).filter((value): value is string => Boolean(value))));

    const users = await this.prisma.user.findMany({
      where: { id: { in: Array.from(new Set([...studentUserIds, ...actorUserIds])) } },
      include: {
        branch: true,
        student: true
      }
    });

    const userById = new Map(users.map((user) => [user.id, user]));
    return logs.map((log) => {
      const student = userById.get(log.entityId);
      const actor = log.actorUserId ? userById.get(log.actorUserId) : null;
      const beforeJson = (log.beforeJson as Record<string, unknown> | null) ?? {};
      const afterJson = (log.afterJson as Record<string, unknown> | null) ?? {};

      return {
        id: log.id,
        studentUserId: log.entityId,
        studentName: student?.fullName ?? "Unknown Student",
        studentId: student?.student?.studentCode ?? "Pending",
        branch: student?.branch?.name ?? "Not assigned",
        changedAt: log.createdAt.toISOString(),
        changedBy: actor?.fullName ?? "Admin",
        reason: typeof afterJson.reason === "string" ? afterJson.reason : "",
        beforeValue: typeof beforeJson.value === "string" ? beforeJson.value : "",
        afterValue: typeof afterJson.value === "string" ? afterJson.value : "",
        status: typeof afterJson.status === "string" ? afterJson.status : "Saved"
      };
    });
  }

  async createAdminActionRecord(userId: string, module: string, body: Record<string, unknown>, actorUserId?: string) {
    this.validateAdminModule(module);
    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const beforeValue = typeof body.beforeValue === "string" ? body.beforeValue.trim() : "";
    const afterValue = typeof body.afterValue === "string" ? body.afterValue.trim() : "";
    const status = typeof body.status === "string" ? body.status.trim() : "Saved";

    if (!reason || !afterValue) {
      throw new BadRequestException("Reason and after value are required.");
    }

    return this.prisma.auditLog.create({
      data: {
        actorUserId: actorUserId || null,
        entityType: `STUDENT_ADMIN_ACTION:${module}`,
        entityId: userId,
        action: "CREATE",
        beforeJson: { value: beforeValue },
        afterJson: {
          value: afterValue,
          reason,
          status
        }
      }
    });
  }

  async getTrainingSessions(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { student: true }
    });
    const studentId = user?.student?.id;
    if (!studentId) return [];

    const sessions = await this.prisma.trainingSession.findMany({
      where: { studentId },
      orderBy: { startsAt: "asc" },
      include: { vehicle: true }
    });

    const dayByDate = new Map<string, number>();
    let counter = 0;
    return sessions.map((session) => {
      const dateKey = session.startsAt.toISOString().slice(0, 10);
      if (!dayByDate.has(dateKey)) {
        counter += 1;
        dayByDate.set(dateKey, counter);
      }
      const day = dayByDate.get(dateKey) || 1;
      const durationMinutes = session.endsAt
        ? Math.max(1, Math.round((session.endsAt.getTime() - session.startsAt.getTime()) / 60000))
        : 30;

      return {
        id: session.id,
        day,
        date: session.startsAt.toISOString(),
        startsAt: session.startsAt.toISOString(),
        endsAt: session.endsAt?.toISOString() ?? null,
        durationMinutes,
        status: session.status,
        vehicleName: session.vehicle.name,
        vehicleNo: session.vehicle.registrationNo,
        fleetTripId: session.fleetTripId,
        recordingId: session.recordingId
      };
    });
  }
}
