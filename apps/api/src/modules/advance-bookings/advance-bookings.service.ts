import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function shortRef(id: string, size = 7) {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let hash = 0;
  for (let index = 0; index < clean.length; index += 1) hash = (hash * 33 + clean.charCodeAt(index)) >>> 0;
  const base = hash.toString(36).toUpperCase();
  const tail = clean.slice(-Math.max(2, size - base.length));
  return `${base}${tail}`.slice(0, size).padEnd(size, "X");
}

@Injectable()
export class AdvanceBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.advanceBooking.findMany({
      orderBy: { createdAt: "desc" }
    });
    return rows.map((item) => ({ ...item, bookingCode: shortRef(item.id, 7) }));
  }
}
