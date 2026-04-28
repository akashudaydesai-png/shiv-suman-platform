import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../auth/auth.guard";
import { WebsiteAdminService } from "./website-admin.service";

@ApiTags("website-admin")
@Controller("website-admin")
@UseGuards(AuthGuard)
export class WebsiteAdminController {
  constructor(private readonly websiteAdminService: WebsiteAdminService) {}

  @Get("blogs")
  blogs() {
    return this.websiteAdminService.blogs();
  }

  @Post("blogs")
  createBlog(@Body() body: Record<string, unknown>) {
    return this.websiteAdminService.createBlog(body);
  }

  @Patch("blogs/:id")
  updateBlog(@Param("id") id: string, @Body() body: Record<string, unknown>) {
    return this.websiteAdminService.updateBlog(id, body);
  }

  @Post("blogs/:id/publish")
  publishBlog(@Param("id") id: string) {
    return this.websiteAdminService.publishBlog(id);
  }

  @Post("blogs/:id/unpublish")
  unpublishBlog(@Param("id") id: string) {
    return this.websiteAdminService.unpublishBlog(id);
  }

  @Get("pages/:slug")
  page(@Param("slug") slug: string) {
    return this.websiteAdminService.page(slug);
  }

  @Patch("pages/:slug")
  upsertPage(@Param("slug") slug: string, @Body() body: Record<string, unknown>) {
    return this.websiteAdminService.upsertPage(slug, body);
  }
}

