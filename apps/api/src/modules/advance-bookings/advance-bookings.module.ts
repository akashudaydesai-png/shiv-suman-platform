import { Module } from "@nestjs/common";
import { AdvanceBookingsController } from "./advance-bookings.controller";
import { AdvanceBookingsService } from "./advance-bookings.service";

@Module({
  controllers: [AdvanceBookingsController],
  providers: [AdvanceBookingsService]
})
export class AdvanceBookingsModule {}
