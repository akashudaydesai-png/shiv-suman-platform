import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

const BRANCH_SCOPE_PREFIX = "__BRANCH_SCOPE__:";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function normalizedInstallments(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item, index) => ({
      sequence: Number((item as any).sequence ?? index + 1),
      purpose: text((item as any).purpose),
      amount: Number((item as any).amount ?? 0),
      automationEvent: text((item as any).automationEvent) || null
    }))
    .filter((item) => item.purpose && item.amount > 0)
    .sort((a, b) => a.sequence - b.sequence)
    .map((item, index) => ({ ...item, sequence: index + 1 }));
}

function boolLike(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value.toLowerCase() === "true";
  return false;
}

function extractBranchId(vehicleClasses: string[]) {
  const token = vehicleClasses.find((item) => item.startsWith(BRANCH_SCOPE_PREFIX));
  return token ? token.slice(BRANCH_SCOPE_PREFIX.length) : null;
}

function stripBranchScope(vehicleClasses: string[]) {
  return vehicleClasses.filter((item) => !item.startsWith(BRANCH_SCOPE_PREFIX));
}

function withBranchScope(vehicleClassesRaw: unknown, branchId: string | null) {
  const base = Array.isArray(vehicleClassesRaw)
    ? vehicleClassesRaw.map(String).map((item) => item.trim()).filter(Boolean)
    : ["LMV"];
  const withoutScope = stripBranchScope(base);
  if (!branchId) return withoutScope;
  return [...withoutScope, `${BRANCH_SCOPE_PREFIX}${branchId}`];
}

type SessionUser = {
  sub: string;
  role?: string;
  branchId?: string | null;
};

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(actor?: SessionUser, includeInactive = false) {
    const isAdmin = actor?.role === "ADMIN" || actor?.role === "SUPER_ADMIN";
    const plans = await this.prisma.plan.findMany({
      where: includeInactive && isAdmin ? undefined : { active: true },
      orderBy: [{ durationDays: "asc" }, { totalAmount: "asc" }],
      include: { installments: { orderBy: { sequence: "asc" } } }
    });

    const branches = await this.prisma.branch.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, code: true }
    });
    const branchesById = new Map(branches.map((branch) => [branch.id, branch]));

    return plans
      .map((plan) => {
        const branchId = extractBranchId(plan.vehicleClasses);
        return {
          ...plan,
          branchId,
          branch: branchId ? branchesById.get(branchId) ?? null : null,
          vehicleClasses: stripBranchScope(plan.vehicleClasses)
        };
      })
      .filter((plan) => {
        if (isAdmin) return true;
        if (!actor?.branchId) return plan.branchId === null;
        return plan.branchId === null || plan.branchId === actor.branchId;
      });
  }

  async create(body: Record<string, unknown>) {
    const name = text(body.name);
    if (!name) throw new BadRequestException("Plan name is required.");
    const totalAmount = Number(body.totalAmount ?? 0);
    const installments = normalizedInstallments(body.installments);
    if (!installments.length) throw new BadRequestException("At least one installment is required.");
    const branchId = text(body.branchId) || null;

    return this.prisma.plan.create({
      data: {
        name,
        durationDays: Number(body.durationDays ?? 12),
        vehicleClasses: withBranchScope(body.vehicleClasses, branchId),
        totalAmount,
        active: body.active === undefined ? true : boolLike(body.active),
        installments: {
          create: installments.map((item) => ({
            sequence: item.sequence,
            purpose: item.purpose,
            amount: item.amount,
            automationEvent: item.automationEvent
          }))
        }
      },
      include: { installments: { orderBy: { sequence: "asc" } } }
    });
  }

  async update(id: string, body: Record<string, unknown>) {
    const installments = body.installments === undefined ? undefined : normalizedInstallments(body.installments);
    if (Array.isArray(body.installments) && !installments?.length) {
      throw new BadRequestException("At least one installment is required.");
    }

    const existing = await this.prisma.plan.findUnique({ where: { id } });
    if (!existing) throw new BadRequestException("Plan not found.");

    if (installments) {
      await this.prisma.planInstallment.deleteMany({ where: { planId: id } });
      await this.prisma.planInstallment.createMany({
        data: installments.map((item) => ({
          planId: id,
          sequence: item.sequence,
          purpose: item.purpose,
          amount: item.amount,
          automationEvent: item.automationEvent
        }))
      });
    }

    const currentBranchId = extractBranchId(existing.vehicleClasses);
    const nextBranchId = body.branchId === undefined ? currentBranchId : text(body.branchId) || null;
    const nextVehicleClasses =
      body.vehicleClasses === undefined
        ? withBranchScope(stripBranchScope(existing.vehicleClasses), nextBranchId)
        : withBranchScope(body.vehicleClasses, nextBranchId);

    return this.prisma.plan.update({
      where: { id },
      data: {
        name: body.name === undefined ? undefined : text(body.name),
        durationDays: body.durationDays === undefined ? undefined : Number(body.durationDays),
        totalAmount: body.totalAmount === undefined ? undefined : Number(body.totalAmount),
        vehicleClasses: nextVehicleClasses,
        active: body.active === undefined ? undefined : boolLike(body.active)
      },
      include: { installments: { orderBy: { sequence: "asc" } } }
    });
  }

  pause(id: string) {
    return this.prisma.plan.update({ where: { id }, data: { active: false } });
  }

  resume(id: string) {
    return this.prisma.plan.update({ where: { id }, data: { active: true } });
  }

  deactivate(id: string) {
    return this.pause(id);
  }
}
