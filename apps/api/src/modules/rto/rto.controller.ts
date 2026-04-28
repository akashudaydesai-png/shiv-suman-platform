import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { RtoService } from "./rto.service";

@ApiTags("rto")
@Controller("rto")
@UseGuards(AuthGuard)
export class RtoController {
  constructor(private readonly rtoService: RtoService) {}

  @Get("internal")
  internalLicenseWork() {
    return this.rtoService.internalLicenseWork();
  }

  @Get("external")
  externalCases() {
    return this.rtoService.externalCases();
  }

  @Post("external")
  createExternalCase(@Body() body: Record<string, unknown>) {
    return this.rtoService.createExternalCase(body);
  }
}
