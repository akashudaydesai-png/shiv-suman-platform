import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { PublicService } from "./public.service";

@ApiTags("public")
@Controller("public")
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get("pages/:slug")
  page(@Param("slug") slug: string) {
    return this.publicService.page(slug);
  }

  @Get("blog")
  blogList() {
    return this.publicService.blogList();
  }

  @Get("blog/:slug")
  blogPost(@Param("slug") slug: string) {
    return this.publicService.blogPost(slug);
  }

  @Get("branches")
  branches() {
    return this.publicService.branches();
  }

  @Get("cars")
  cars() {
    return this.publicService.cars();
  }

  @Get("courses")
  courses() {
    return this.publicService.courses();
  }

  @Get("rto-services")
  rtoServices() {
    return this.publicService.rtoServices();
  }

  @Get("trainers")
  trainers() {
    return this.publicService.trainers();
  }

  @Post("enquiries")
  createEnquiry(@Body() body: Record<string, unknown>) {
    return this.publicService.createEnquiry(body);
  }

  @Post("advance-bookings")
  createAdvanceBooking(@Body() body: Record<string, unknown>) {
    return this.publicService.createAdvanceBooking(body);
  }
}
