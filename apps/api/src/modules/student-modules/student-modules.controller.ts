import { Body, Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { StudentModulesService } from "./student-modules.service";

@ApiTags("student-modules")
@Controller("student-modules")
@UseGuards(AuthGuard)
export class StudentModulesController {
  constructor(private readonly studentModulesService: StudentModulesService) {}

  @Get(":studentUserId/:module")
  listModuleRecords(@Param("studentUserId") studentUserId: string, @Param("module") module: string) {
    return this.studentModulesService.getModuleRecords(studentUserId, module);
  }

  @Post(":studentUserId/:module")
  upsertModuleRecord(
    @Param("studentUserId") studentUserId: string,
    @Param("module") module: string,
    @Body() body: Record<string, unknown>,
    @Req() request: { user?: { sub?: string } }
  ) {
    return this.studentModulesService.upsertModuleRecord(studentUserId, module, body, request.user?.sub);
  }

  @Get("admin-actions/:module")
  listAdminActionRecords(@Param("module") module: string) {
    return this.studentModulesService.getAdminActionRecords(module);
  }

  @Post(":studentUserId/admin-actions/:module")
  createAdminActionRecord(
    @Param("studentUserId") studentUserId: string,
    @Param("module") module: string,
    @Body() body: Record<string, unknown>,
    @Req() request: { user?: { sub?: string } }
  ) {
    return this.studentModulesService.createAdminActionRecord(studentUserId, module, body, request.user?.sub);
  }

  @Get(":studentUserId/sessions/list")
  listTrainingSessions(@Param("studentUserId") studentUserId: string) {
    return this.studentModulesService.getTrainingSessions(studentUserId);
  }
}
