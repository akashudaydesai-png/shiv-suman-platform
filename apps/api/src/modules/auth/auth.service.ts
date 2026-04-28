import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { signSessionToken } from "./token.util";
import { verifyPassword } from "./password.util";

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async login(identifier: string, password: string) {
    const normalizedIdentifier = identifier.trim();
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { phone: normalizedIdentifier },
          { email: { startsWith: `${normalizedIdentifier.toLowerCase()}@` } }
        ]
      },
      include: { branch: true }
    });

    if (!user || user.accessStatus !== "ACTIVE" || !verifyPassword(password, user.passwordHash)) {
      throw new UnauthorizedException("Invalid login details.");
    }

    const token = signSessionToken(
      {
        sub: user.id,
        role: user.role,
        branchId: user.branchId
      },
      process.env.JWT_SECRET ?? "change-me-before-production"
    );

    return {
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch ? { id: user.branch.id, name: user.branch.name } : null
      }
    };
  }
}
