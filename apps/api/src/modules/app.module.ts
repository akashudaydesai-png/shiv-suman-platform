import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { BlueprintModule } from "./blueprint/blueprint.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { BranchesModule } from "./branches/branches.module";
import { UsersModule } from "./users/users.module";
import { PublicModule } from "./public/public.module";
import { PlansModule } from "./plans/plans.module";
import { VehiclesModule } from "./vehicles/vehicles.module";
import { EnquiriesModule } from "./enquiries/enquiries.module";
import { AdvanceBookingsModule } from "./advance-bookings/advance-bookings.module";
import { RtoModule } from "./rto/rto.module";
import { DocumentsModule } from "./documents/documents.module";
import { WebsiteAdminModule } from "./website-admin/website-admin.module";
import { StudentModulesModule } from "./student-modules/student-modules.module";
import { SettingsModule } from "./settings/settings.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    BranchesModule,
    UsersModule,
    PublicModule,
    PlansModule,
    VehiclesModule,
    EnquiriesModule,
    AdvanceBookingsModule,
    RtoModule,
    DocumentsModule,
    WebsiteAdminModule,
    StudentModulesModule,
    SettingsModule,
    BlueprintModule,
    DashboardModule
  ]
})
export class AppModule {}
