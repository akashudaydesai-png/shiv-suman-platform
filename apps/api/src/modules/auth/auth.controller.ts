import { Body, Controller, Get, Post, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

type LoginBody = {
  identifier?: string;
  password?: string;
};

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() body: LoginBody) {
    if (!body.identifier || !body.password) {
      throw new UnauthorizedException("Email/phone and password are required.");
    }
    return this.authService.login(body.identifier, body.password);
  }

  @UseGuards(AuthGuard)
  @Get("me")
  me(@Req() request: { user?: Record<string, unknown> }) {
    return { user: request.user ?? null };
  }
}
