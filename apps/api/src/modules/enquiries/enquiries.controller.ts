import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { EnquiriesService } from "./enquiries.service";

@ApiTags("enquiries")
@Controller("enquiries")
@UseGuards(AuthGuard)
export class EnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  findAll() {
    return this.enquiriesService.findAll();
  }

  @Post()
  create(@Body() body: Record<string, unknown>) {
    return this.enquiriesService.create(body, "Admin/Reception");
  }
}
