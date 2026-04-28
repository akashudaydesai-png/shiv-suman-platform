import { Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { DashboardService } from "./dashboard.service";

@ApiTags("dashboards")
@Controller("dashboards")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get(":role")
  getDashboard(@Param("role") role: string) {
    return this.dashboardService.getDashboard(role);
  }
}
