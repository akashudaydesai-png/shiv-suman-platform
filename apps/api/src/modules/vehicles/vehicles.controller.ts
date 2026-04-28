import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { VehiclesService } from "./vehicles.service";

@ApiTags("vehicles")
@Controller("vehicles")
@UseGuards(AuthGuard)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.vehiclesService.create(body);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.vehiclesService.update(id, body);
  }

  @Post(":id/expenses")
  addExpense(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.vehiclesService.addExpense(id, body);
  }

  @Delete(":id")
  deactivate(@Param("id") id: string) {
    return this.vehiclesService.deactivate(id);
  }
}
