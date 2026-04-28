import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { AdvanceBookingsService } from "./advance-bookings.service";

@ApiTags("advance-bookings")
@Controller("advance-bookings")
@UseGuards(AuthGuard)
export class AdvanceBookingsController {
  constructor(private readonly advanceBookingsService: AdvanceBookingsService) {}

  @Get()
  findAll() {
    return this.advanceBookingsService.findAll();
  }
}
