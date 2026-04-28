import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { PrismaService } from "../prisma/prisma.service";
import { settingsDefaults, SETTINGS_KEYS, type SettingsKey } from "./settings.defaults";

type SettingRow = {
  key: string;
  value: unknown;
  updatedAt: Date;
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateKey(key: string): asserts key is SettingsKey {
    if (!SETTINGS_KEYS.includes(key as SettingsKey)) {
      throw new BadRequestException("Invalid settings key.");
    }
  }

  async listAll() {
    const rows = await this.prisma.$queryRaw<SettingRow[]>(Prisma.sql`
      SELECT key, value, "updatedAt"
      FROM "SystemSetting"
    `);
    const byKey = new Map(rows.filter((row) => SETTINGS_KEYS.includes(row.key as SettingsKey)).map((row) => [row.key, row]));

    return SETTINGS_KEYS.map((key) => ({
      key,
      value: byKey.get(key)?.value ?? settingsDefaults[key],
      updatedAt: byKey.get(key)?.updatedAt ?? null
    }));
  }

  async getOne(key: string) {
    this.validateKey(key);
    const rows = await this.prisma.$queryRaw<SettingRow[]>(Prisma.sql`
      SELECT key, value, "updatedAt"
      FROM "SystemSetting"
      WHERE key = ${key}
      LIMIT 1
    `);
    const row = rows[0];
    return {
      key,
      value: row?.value ?? settingsDefaults[key],
      updatedAt: row?.updatedAt ?? null
    };
  }

  async upsert(key: string, value: unknown, actorUserId?: string) {
    this.validateKey(key);
    const jsonValue = value as Prisma.JsonValue;
    const id = randomUUID();
    const rows = await this.prisma.$queryRaw<SettingRow[]>(Prisma.sql`
      INSERT INTO "SystemSetting" (id, key, value, "createdAt", "updatedAt")
      VALUES (${id}, ${key}, ${jsonValue}, NOW(), NOW())
      ON CONFLICT (key)
      DO UPDATE SET value = EXCLUDED.value, "updatedAt" = NOW()
      RETURNING key, value, "updatedAt"
    `);

    await this.prisma.auditLog.create({
      data: {
        actorUserId: actorUserId || null,
        entityType: "SYSTEM_SETTING",
        entityId: key,
        action: "UPSERT",
        afterJson: { value: jsonValue } as Prisma.InputJsonObject
      }
    });

    return rows[0];
  }
}
