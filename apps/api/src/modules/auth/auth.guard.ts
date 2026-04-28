import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { verifySessionToken } from "./token.util";

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization as string | undefined;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
    const payload = token ? verifySessionToken(token, process.env.JWT_SECRET ?? "change-me-before-production") : null;

    if (!payload) {
      throw new UnauthorizedException("Login required.");
    }

    request.user = payload;
    return true;
  }
}
