import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string()
    .min(1, "Obrigatória")
    .url("Deve ser uma URL válida"),
  BETTER_AUTH_SECRET: z
    .string()
    .min(1, "Obrigatória"),
  BETTER_AUTH_URL: z
    .string()
    .min(1, "Obrigatória")
    .url("Deve ser uma URL válida"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error("\n\x1b[31m❌ VARIÁVEIS DE AMBIENTE INVÁLIDAS:\x1b[0m\n");

  for (const issue of _env.error.issues) {
    const key = issue.path.join(".") || "ENV";
    const msg =
      issue.code === "invalid_type" && issue.message.includes("undefined")
        ? "Obrigatória"
        : issue.message;

    console.error(`  • ${key}: \x1b[31m${msg}\x1b[0m`);
  }

  console.error();
  process.exit(1);
}

export const env = _env.data;
