import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function shortRef(id: string, size = 6) {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let hash = 0;
  for (let index = 0; index < clean.length; index += 1) hash = (hash * 31 + clean.charCodeAt(index)) >>> 0;
  const base = hash.toString(36).toUpperCase();
  const tail = clean.slice(-Math.max(2, size - base.length));
  return `${base}${tail}`.slice(0, size).padEnd(size, "X");
}

@Injectable()
export class EnquiriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const rows = await this.prisma.enquiry.findMany({
      orderBy: { createdAt: "desc" }
    });
    return rows.map((item) => ({ ...item, enquiryCode: shortRef(item.id, 7) }));
  }

  async create(body: Record<string, unknown>, defaultSource = "Website") {
    const fullName = text(body.fullName);
    const phone = text(body.phone);
    if (!fullName || !phone) throw new BadRequestException("Name and phone are required.");
    const row = await this.prisma.enquiry.create({
      data: {
        source: text(body.source, defaultSource),
        type: text(body.type, "learning_car"),
        fullName,
        phone,
        email: text(body.email) || null,
        preferredBranchId: text(body.preferredBranchId) || null,
        preferredSlotId: text(body.preferredSlotTime) || text(body.preferredSlotId) || null,
        courseOrService: text(body.courseOrService) || null,
        notes: text(body.notes) || null
      }
    });
    return { ...row, enquiryCode: shortRef(row.id, 7) };
  }
}
