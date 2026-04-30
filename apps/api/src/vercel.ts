import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import { configureApp } from "./app-bootstrap";
import { AppModule } from "./modules/app.module";

const express = require("express");

const server = express();
let appReady: Promise<void> | null = null;

async function bootstrap() {
  if (!appReady) {
    appReady = NestFactory.create(AppModule, new ExpressAdapter(server)).then(async (app) => {
      configureApp(app);
      await app.init();
    });
  }
  await appReady;
}

export default async function handler(request: unknown, response: unknown) {
  await bootstrap();
  return server(request, response);
}
