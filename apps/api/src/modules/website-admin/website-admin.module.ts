import { Module } from "@nestjs/common";
import { PrismaModule } from "../prisma/prisma.module";
import { WebsiteAdminController } from "./website-admin.controller";
import { WebsiteAdminService } from "./website-admin.service";

@Module({
  imports: [PrismaModule],
  controllers: [WebsiteAdminController],
  providers: [WebsiteAdminService]
})
export class WebsiteAdminModule {}

