import { Module } from "@nestjs/common";
import { StudentModulesController } from "./student-modules.controller";
import { StudentModulesService } from "./student-modules.service";

@Module({
  controllers: [StudentModulesController],
  providers: [StudentModulesService]
})
export class StudentModulesModule {}

