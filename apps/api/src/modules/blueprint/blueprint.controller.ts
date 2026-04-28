import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { BlueprintService } from "./blueprint.service";

@ApiTags("blueprint")
@Controller("blueprint")
export class BlueprintController {
  constructor(private readonly blueprintService: BlueprintService) {}

  @Get()
  getBlueprint() {
    return this.blueprintService.getBlueprint();
  }
}
