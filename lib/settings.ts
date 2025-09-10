import { prisma } from "./prisma";

export type SettingsMap = Record<string, any>;

export async function getSettingsMap(): Promise<SettingsMap> {
  const rows = await prisma.setting.findMany();
  const map: SettingsMap = {};
  for (const r of rows) map[r.key] = r.value as any;
  return map;
}

export function read<T>(map: SettingsMap, key: string, fallback: T): T {
  return (map?.[key] as T) ?? fallback;
}
