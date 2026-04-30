import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { join } from "node:path";

const express = require("express");

function allowedOrigins() {
  return [
    process.env.PUBLIC_WEB_URL,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3020",
    "http://127.0.0.1:3020",
    "http://localhost:3021",
    "http://127.0.0.1:3021",
    "https://web-puce-mu-86.vercel.app"
  ].filter(Boolean) as string[];
}

export function configureApp(app: INestApplication) {
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use("/uploads", express.static(join(process.cwd(), "uploads")));
  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins().includes(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true
  });
  app.setGlobalPrefix("api");

  const config = new DocumentBuilder()
    .setTitle("Shiv Suman Platform API")
    .setDescription("Driving school ERP, RTO CRM, automation, and fleet evidence API")
    .setVersion("0.1.0")
    .build();

  SwaggerModule.setup("api/docs", app, SwaggerModule.createDocument(app, config));
}
