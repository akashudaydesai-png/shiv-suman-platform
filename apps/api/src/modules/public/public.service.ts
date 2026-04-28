import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const BRANCH_SCOPE_PREFIX = "__BRANCH_SCOPE__:";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function shortRef(id: string, size = 7) {
  const clean = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  let hash = 0;
  for (let index = 0; index < clean.length; index += 1) hash = (hash * 31 + clean.charCodeAt(index)) >>> 0;
  const base = hash.toString(36).toUpperCase();
  const tail = clean.slice(-Math.max(2, size - base.length));
  return `${base}${tail}`.slice(0, size).padEnd(size, "X");
}

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  async page(slug: string) {
    const page = await this.prisma.publicWebsitePage.findUnique({ where: { slug } });
    if (!page || !page.published) throw new NotFoundException("Page not found.");
    return page;
  }

  blogList() {
    return this.prisma.blogPost.findMany({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        slug: true,
        title: true,
        seoTitle: true,
        metaDescription: true,
        tags: true,
        featuredImageUrl: true,
        featuredVideoUrl: true,
        redirectUrl: true,
        publishedAt: true
      }
    });
  }

  async blogPost(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || !post.publishedAt) throw new NotFoundException("Blog post not found.");
    return post;
  }

  branches() {
    return this.prisma.branch.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, code: true, address: true, startTime: true, endTime: true }
    });
  }

  cars() {
    return this.prisma.$queryRawUnsafe<Array<{
      id: string;
      name: string;
      registrationNo: string;
      branchId: string;
      branchName: string;
      fleetDeviceId: string | null;
      cameraDeviceId: string | null;
      createdAt: Date;
    }>>(
      `
        SELECT
          v.id,
          v.name,
          v."registrationNo" as "registrationNo",
          v."branchId" as "branchId",
          b.name as "branchName",
          v."fleetDeviceId" as "fleetDeviceId",
          v."cameraDeviceId" as "cameraDeviceId",
          v."createdAt" as "createdAt"
        FROM "Vehicle" v
        INNER JOIN "Branch" b ON b.id = v."branchId"
        WHERE v.active = true
        ORDER BY v."createdAt" DESC
      `
    );
  }

  async courses() {
    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: [{ durationDays: "asc" }, { totalAmount: "asc" }],
      include: { installments: { orderBy: { sequence: "asc" } } }
    });

    const branches = await this.prisma.branch.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true }
    });
    const branchesById = new Map(branches.map((branch) => [branch.id, branch]));

    return plans.map((plan) => {
      const branchToken = plan.vehicleClasses.find((item) => item.startsWith(BRANCH_SCOPE_PREFIX));
      const branchId = branchToken ? branchToken.slice(BRANCH_SCOPE_PREFIX.length) : null;
      return {
        ...plan,
        branchId,
        branch: branchId ? branchesById.get(branchId) ?? null : null,
        vehicleClasses: plan.vehicleClasses.filter((item) => !item.startsWith(BRANCH_SCOPE_PREFIX))
      };
    });
  }

  rtoServices() {
    return this.prisma.rtoService.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, feeAmount: true, category: true }
    });
  }

  trainers() {
    return this.prisma.user.findMany({
      where: { role: "TRAINER", accessStatus: "ACTIVE", deletedAt: null },
      include: { branch: true, staff: true }
    });
  }

  async createEnquiry(body: Record<string, unknown>) {
    const fullName = text(body.fullName);
    const phone = text(body.phone);
    if (!fullName || !phone) throw new BadRequestException("Name and phone are required.");
    const row = await this.prisma.enquiry.create({
      data: {
        source: text(body.source, "Website"),
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

  async createAdvanceBooking(body: Record<string, unknown>) {
    const fullName = text(body.fullName);
    const phone = text(body.phone);
    const branchId = text(body.branchId);
    const slotId = text(body.slotId, `manual-${Date.now()}`);
    if (!fullName || !phone || !branchId) throw new BadRequestException("Name, phone, and branch are required.");
    const row = await this.prisma.advanceBooking.create({
      data: {
        fullName,
        phone,
        email: text(body.email) || null,
        branchId,
        slotId,
        amount: 500,
        status: text(body.planName, "BOOKED")
      }
    });
    return { ...row, bookingCode: shortRef(row.id, 7) };
  }
}
