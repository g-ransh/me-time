import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url({ message: "DATABASE_URL must be a valid connection string." }),
  JWT_SECRET: z.string().min(32, { message: "JWT_SECRET must be at least 32 characters long." }),
  // New Supabase Vault Validation Gates
  SUPABASE_URL: z.string().url({ message: "SUPABASE_URL must be a valid URL string." }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, { message: "SUPABASE_SERVICE_ROLE_KEY is required." }),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ CRITICAL CONFIGURATION ERROR: Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1); 
  }
  return result.data;
};

export const env = parseEnv();