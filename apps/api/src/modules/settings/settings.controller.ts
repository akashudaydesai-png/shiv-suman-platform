import { Body, Controller, Get, Param, Patch, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { SettingsService } from "./settings.service";

@ApiTags("settings")
@Controller("settings")
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  list() {
    return this.settingsService.listAll();
  }

  @Get(":key")
  getOne(@Param("key") key: string) {
    return this.settingsService.getOne(key);
  }

  @Patch(":key")
  upsert(
    @Param("key") key: string,
    @Body() body: { value?: unknown },
    @Req() request: { user?: { sub?: string } }
  ) {
    return this.settingsService.upsert(key, body?.value, request.user?.sub);
  }
}
