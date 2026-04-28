import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { join } from "node:path";
import { AppModule } from "./modules/app.module";

const express = require("express");

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  app.enableCors({
    origin: [
      process.env.PUBLIC_WEB_URL ?? "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:3020",
      "http://127.0.0.1:3020",
      "http://localhost:3021",
      "http://127.0.0.1:3021"
    ],
    credentials: true
  });
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Shiv Suman Platform API")
    .setDescription("Driving school ERP, RTO CRM, automation, and fleet evidence API")
    .setVersion("0.1.0")
    .build();

  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 4000);
}

bootstrap();
