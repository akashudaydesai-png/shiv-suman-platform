import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

@Injectable()
export class BranchesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.branch.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { users: true, slots: true, vehicles: true }
        }
      }
    });
  }

  create(body: Record<string, unknown>) {
    const name = text(body.name);
    const code = text(body.code, name.toUpperCase().replace(/[^A-Z0-9]+/g, "_"));
    if (!name || !code) throw new BadRequestException("Branch name and code are required.");

    return this.prisma.branch.create({
      data: {
        name,
        code,
        address: text(body.address) || null,
        startTime: text(body.startTime, "07:00"),
        endTime: text(body.endTime, "20:00"),
        lunchStartTime: text(body.lunchStartTime) || null,
        lunchEndTime: text(body.lunchEndTime) || null,
        slotDurationMin: Number(body.slotDurationMin ?? 30)
      }
    });
  }

  update(id: string, body: Record<string, unknown>) {
    return this.prisma.branch.update({
      where: { id },
      data: {
        name: body.name === undefined ? undefined : text(body.name),
        address: body.address === undefined ? undefined : text(body.address) || null,
        startTime: body.startTime === undefined ? undefined : text(body.startTime, "07:00"),
        endTime: body.endTime === undefined ? undefined : text(body.endTime, "20:00"),
        lunchStartTime: body.lunchStartTime === undefined ? undefined : text(body.lunchStartTime) || null,
        lunchEndTime: body.lunchEndTime === undefined ? undefined : text(body.lunchEndTime) || null,
        slotDurationMin: body.slotDurationMin === undefined ? undefined : Number(body.slotDurationMin)
      }
    });
  }

  softDelete(id: string) {
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  async slotAvailability(id: string, time: string, date?: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id, deletedAt: null } });
    if (!branch) throw new NotFoundException("Branch not found.");
    if (!time || !/^\d{2}:\d{2}$/.test(time)) throw new BadRequestException("Time must be HH:mm.");

    const selectedDate = date ? new Date(`${date}T00:00:00`) : new Date();
    const yyyy = selectedDate.getFullYear();
    const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const dd = String(selectedDate.getDate()).padStart(2, "0");
    const startsAt = new Date(`${yyyy}-${mm}-${dd}T${time}:00`);

    const slot = await this.prisma.slot.findFirst({
      where: { branchId: id, startsAt },
      orderBy: { createdAt: "desc" }
    });

    if (!slot || slot.status === "AVAILABLE" || slot.status === "ON_LEAVE_TODAY" || slot.status === "CANCELLED") {
      return {
        branchId: id,
        branchName: branch.name,
        time,
        status: "OPEN",
        message: "This slot is open for booking.",
        remainingDays: 0
      };
    }

    const remainingDays = slot.status === "RUNNING" || slot.status === "ADMITTED" ? 12 : null;
    return {
      branchId: id,
      branchName: branch.name,
      time,
      status: slot.status,
      message: remainingDays
        ? `This slot is occupied. Estimated ${remainingDays} training days remaining before reopening.`
        : "This slot is not currently open.",
      remainingDays
    };
  }
}
