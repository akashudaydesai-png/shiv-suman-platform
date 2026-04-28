import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { BranchesService } from "./branches.service";

@ApiTags("branches")
@Controller("branches")
@UseGuards(AuthGuard)
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  findAll() {
    return this.branchesService.findAll();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.branchesService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.branchesService.update(id, body);
  }

  @Delete(":id")
  softDelete(@Param("id") id: string) {
    return this.branchesService.softDelete(id);
  }

  @Get(":id/slot-availability")
  slotAvailability(@Param("id") id: string, @Query("time") time: string, @Query("date") date?: string) {
    return this.branchesService.slotAvailability(id, time, date);
  }
}
