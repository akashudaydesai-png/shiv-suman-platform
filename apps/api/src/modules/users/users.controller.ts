import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { UsersService } from "./users.service";

@ApiTags("users")
@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query("role") role?: string) {
    return this.usersService.findAll(role);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.usersService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.usersService.update(id, body);
  }

  @Post(":id/pause")
  pause(@Param("id") id: string) {
    return this.usersService.setAccess(id, "PAUSED");
  }

  @Post(":id/reactivate")
  reactivate(@Param("id") id: string) {
    return this.usersService.setAccess(id, "ACTIVE");
  }

  @Delete(":id")
  softDelete(@Param("id") id: string) {
    return this.usersService.softDelete(id);
  }
}
