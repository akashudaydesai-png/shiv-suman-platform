import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { PlansService } from "./plans.service";

@ApiTags("plans")
@Controller("plans")
@UseGuards(AuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  findAll(
    @Req() request: { user?: { sub: string; role?: string; branchId?: string | null } },
    @Query("includeInactive") includeInactive?: string
  ) {
    return this.plansService.findAll(request.user, includeInactive === "true");
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.plansService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.plansService.update(id, body);
  }

  @Post(":id/pause")
  pause(@Param("id") id: string) {
    return this.plansService.pause(id);
  }

  @Post(":id/resume")
  resume(@Param("id") id: string) {
    return this.plansService.resume(id);
  }

  @Delete(":id")
  deactivate(@Param("id") id: string) {
    return this.plansService.deactivate(id);
  }
}
