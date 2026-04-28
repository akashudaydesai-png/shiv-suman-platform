import { BadRequestException, Injectable } from "@nestjs/common";
import { AccessStatus, RoleCode } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { hashPassword } from "../auth/password.util";

function text(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function role(value: unknown): RoleCode {
  const requested = text(value, "STUDENT").toUpperCase();
  if (!Object.values(RoleCode).includes(requested as RoleCode)) {
    throw new BadRequestException("Invalid role.");
  }
  return requested as RoleCode;
}

function optionalDate(value: unknown) {
  const raw = text(value);
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function list(value: unknown) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function validEmail(value: string) {
  if (!value) return true;
  if (/^\d+$/.test(value)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function staffRole(selectedRole: RoleCode) {
  return ["TRAINER", "RECEPTIONIST", "SUPERVISOR", "BRANCH_ADMIN", "ACCOUNTANT"].includes(selectedRole);
}

function salaryNumber(value: unknown) {
  const raw = text(value).replace(/[^0-9]/g, "");
  if (!raw) return null;
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : null;
}

function staffProfileMeta(body: Record<string, unknown>) {
  return {
    fatherFullName: text(body.fatherFullName) || null,
    bloodGroup: text(body.bloodGroup) || null,
    education: text(body.education) || null,
    salary: salaryNumber(body.salary),
    address: {
      addressLine1: text(body.addressLine1) || null,
      addressLine2: text(body.addressLine2) || null,
      state: text(body.state) || null,
      district: text(body.district) || null,
      tehsil: text(body.tehsil) || null,
      pincode: text(body.pincode) || null
    }
  };
}

const rolePrefix: Record<RoleCode, string> = {
  SUPER_ADMIN: "SUA",
  ADMIN: "ADM",
  BRANCH_ADMIN: "BRA",
  RECEPTIONIST: "REC",
  SUPERVISOR: "SUP",
  TRAINER: "TRN",
  STUDENT: "STD",
  ACCOUNTANT: "ACC"
};

function randomAlphaNum(length = 4) {
  let result = "";
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let i = 0; i < length; i += 1) result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(roleFilter?: string) {
    const requestedRole = roleFilter ? role(roleFilter) : undefined;
    return this.prisma.user.findMany({
      where: { deletedAt: null, role: requestedRole },
      orderBy: { createdAt: "desc" },
      include: { branch: true, student: true, staff: true }
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        branch: true,
        student: { include: { documents: { orderBy: { createdAt: "desc" } }, admissions: { orderBy: { createdAt: "desc" } } } },
        staff: true
      }
    });
    if (!user) throw new BadRequestException("User not found.");

    const planIds = user.student?.admissions.map((admission) => admission.planId) ?? [];
    const plans = planIds.length
      ? await this.prisma.plan.findMany({
          where: { id: { in: planIds } },
          include: { installments: { orderBy: { sequence: "asc" } } }
        })
      : [];
    const payments = user.student
      ? await this.prisma.payment.findMany({ where: { studentId: user.student.id }, orderBy: { createdAt: "desc" } })
      : [];

    return { ...user, plans, payments };
  }

  async create(body: Record<string, unknown>) {
    const fullName = text(body.fullName);
    const selectedRole = role(body.role);
    const phone = digitsOnly(text(body.phone));
    const explicitEmail = text(body.email);
    let accessUserId = text(body.userId).toUpperCase();
    if (!accessUserId) {
      accessUserId = `${rolePrefix[selectedRole]}${randomAlphaNum(4)}`;
    }
    let email = explicitEmail || `${accessUserId.toLowerCase()}@shivsuman.local`;
    while (await this.prisma.user.findUnique({ where: { email } })) {
      accessUserId = `${rolePrefix[selectedRole]}${randomAlphaNum(4)}`;
      if (!explicitEmail) email = `${accessUserId.toLowerCase()}@shivsuman.local`;
      else break;
    }
    if (!fullName || !email) throw new BadRequestException("Full name and email are required.");
    if (phone && !/^\d{10}$/.test(phone)) throw new BadRequestException("Mobile number must be exactly 10 digits.");
    if (text(body.email) && !validEmail(text(body.email))) throw new BadRequestException("Email must be a valid email address.");
    const rawPassword = text(body.password, `${rolePrefix[selectedRole]}@${(phone || randomAlphaNum(4)).slice(-4)}`);

    const user = await this.prisma.user.create({
      data: {
        fullName,
        email,
        phone: phone || null,
        passwordHash: hashPassword(rawPassword),
        role: selectedRole,
        branchId: text(body.branchId) || null
      }
    });

    if (selectedRole === "STUDENT") {
      const branch = text(body.branchId)
        ? await this.prisma.branch.findUnique({ where: { id: text(body.branchId) } })
        : null;
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const monthCount = await this.prisma.studentProfile.count({
        where: {
          createdAt: { gte: monthStart, lt: nextMonth },
          user: branch?.id ? { branchId: branch.id } : undefined
        }
      });
      const branchCode = (branch?.code ?? "SSM").replace(/[^A-Z0-9]/gi, "").slice(0, 3).toUpperCase().padEnd(3, "X");
      const yearMonth = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
      const studentCode = `ST-${branchCode}-${yearMonth}-${String(monthCount + 1).padStart(3, "0")}`;
      const nameParts = fullName.split(" ").filter(Boolean);
      const guardianRelation = text(body.guardianRelation);
      const guardianName = text(body.guardianName);
      const student = await this.prisma.studentProfile.create({
        data: {
          userId: user.id,
          studentCode,
          firstName: text(body.firstName, nameParts[0] ?? fullName),
          middleName: text(body.middleName) || null,
          lastName: text(body.lastName, nameParts.slice(1).join(" ") || "-"),
          relationName: guardianRelation && guardianName ? `${guardianRelation}: ${guardianName}` : guardianName || null,
          gender: text(body.gender) || null,
          dateOfBirth: optionalDate(body.dateOfBirth),
          bloodGroup: text(body.bloodGroup) || null,
          education: text(body.education) || null,
          occupation: text(body.occupation) || null,
          addressJson: {
            state: text(body.state),
            district: text(body.district),
            tehsil: text(body.tehsil),
            addressLine1: text(body.addressLine1),
            addressLine2: text(body.addressLine2),
            pincode: text(body.pincode)
          },
          learningLicenseNo: text(body.learningLicenseNo) || null,
          learningLicenseDate: optionalDate(body.learningLicenseDate),
          learningLicenseValidity: optionalDate(body.learningLicenseValidity)
        }
      });

      const planId = text(body.planId);
      const vehicleClasses = list(body.vehicleClasses);
      const additionalLmvTrLicense = body.additionalLmvTrLicense === true;
      if (planId && text(body.branchId)) {
        const installmentMode = body.installmentMode === false ? false : true;
        const admission = await this.prisma.admission.create({
          data: {
            studentId: student.id,
            source: text(body.source, "DIRECT"),
            branchId: text(body.branchId),
            slotId: text(body.slotTime) || null,
            planId,
            installmentMode,
            vehicleClasses,
            status: "ACTIVE"
          }
        });
        if (!installmentMode) {
          const selectedPlan = await this.prisma.plan.findUnique({ where: { id: planId } });
          if (selectedPlan) {
            await this.prisma.payment.create({
              data: {
                studentId: student.id,
                planInstallmentId: null,
                amount: selectedPlan.totalAmount,
                status: "LINK_CREATED",
                paymentLink: `pending-full-payment-${admission.id}`
              }
            });
          }
        } else {
          const firstInstallment = await this.prisma.planInstallment.findFirst({
            where: { planId },
            orderBy: { sequence: "asc" }
          });
          if (firstInstallment) {
            await this.prisma.payment.create({
              data: {
                studentId: student.id,
                planInstallmentId: firstInstallment.id,
                amount: firstInstallment.amount,
                status: "LINK_CREATED",
                paymentLink: `pending-first-installment-${admission.id}`
              }
            });
          }
        }
        if (additionalLmvTrLicense) {
          await this.prisma.payment.create({
            data: {
              studentId: student.id,
              planInstallmentId: null,
              amount: 1000,
              status: "LINK_CREATED",
              paymentLink: `pending-lmv-tr-after-learning-license-${admission.id}`
            }
          });
        }
      }
    }

    if (staffRole(selectedRole)) {
      await this.prisma.staffProfile.create({
        data: {
          userId: user.id,
          employeeCode: `EMP-${Date.now()}`,
          designation: text(body.designation, selectedRole),
          salaryMeta: staffProfileMeta(body)
        }
      });
    }

    const created = await this.prisma.user.findUnique({
      where: { id: user.id },
      include: { branch: true, student: true, staff: true }
    });
    return {
      ...created,
      credentials: {
        userId: accessUserId,
        password: rawPassword,
        loginId: accessUserId,
        email
      }
    };
  }

  update(id: string, body: Record<string, unknown>) {
    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: body.fullName === undefined ? undefined : text(body.fullName),
        phone: body.phone === undefined ? undefined : text(body.phone) || null,
        branchId: body.branchId === undefined ? undefined : text(body.branchId) || null,
        staff: body.role && staffRole(role(body.role))
          ? {
              upsert: {
                create: {
                  employeeCode: `EMP-${Date.now()}`,
                  designation: text(body.designation, role(body.role)),
                  salaryMeta: staffProfileMeta(body)
                },
                update: {
                  designation: text(body.designation, role(body.role)),
                  salaryMeta: staffProfileMeta(body)
                }
              }
            }
          : body.fatherFullName !== undefined ||
            body.bloodGroup !== undefined ||
            body.education !== undefined ||
            body.salary !== undefined ||
            body.addressLine1 !== undefined ||
            body.addressLine2 !== undefined ||
            body.state !== undefined ||
            body.district !== undefined ||
            body.tehsil !== undefined ||
            body.pincode !== undefined ||
            body.designation !== undefined
            ? {
                update: {
                  designation: text(body.designation) || undefined,
                  salaryMeta: staffProfileMeta(body)
                }
              }
            : undefined
      },
      include: { branch: true, student: true, staff: true }
    });
  }

  setAccess(id: string, accessStatus: AccessStatus) {
    return this.prisma.user.update({
      where: { id },
      data: { accessStatus },
      include: { branch: true, student: true, staff: true }
    });
  }

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), accessStatus: "REMOVED" },
      include: { branch: true, student: true, staff: true }
    });
  }
}
