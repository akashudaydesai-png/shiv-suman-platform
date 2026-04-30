import { NestFactory } from "@nestjs/core";
import { configureApp } from "./app-bootstrap";
import { AppModule } from "./modules/app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

bootstrap();
