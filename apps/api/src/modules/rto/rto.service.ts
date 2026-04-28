import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

@Injectable()
export class RtoService {
  constructor(private readonly prisma: PrismaService) {}

  internalLicenseWork() {
    return this.prisma.user.findMany({
      where: { role: "STUDENT", deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: { branch: true, student: true }
    });
  }

  externalCases() {
    return this.prisma.rtoCase.findMany({
      where: { type: "EXTERNAL_CUSTOMER" },
      orderBy: { createdAt: "desc" },
      include: { service: true }
    });
  }

  async createExternalCase(body: Record<string, unknown>) {
    const fullName = text(body.fullName);
    const phone = text(body.phone);
    const serviceId = text(body.serviceId);
    if (!fullName || !phone || !serviceId) {
      throw new BadRequestException("Name, mobile number, and service are required.");
    }

    const branch = await this.prisma.branch.findFirst({ where: { deletedAt: null }, orderBy: { createdAt: "asc" } });
    if (!branch) throw new BadRequestException("Create a branch before adding RTO work.");

    return this.prisma.rtoCase.create({
      data: {
        type: "EXTERNAL_CUSTOMER",
        serviceId,
        branchId: text(body.branchId, branch.id),
        customerJson: {
          fullName,
          phone,
          rcNumber: text(body.rcNumber) || null,
          insurance: text(body.insurance) || null,
          puc: text(body.puc) || null,
          document1: text(body.document1) || null,
          document2: text(body.document2) || null,
          document3: text(body.document3) || null,
          document4: text(body.document4) || null,
          notes: text(body.notes) || null
        },
        statusHistory: []
      },
      include: { service: true }
    });
  }
}
