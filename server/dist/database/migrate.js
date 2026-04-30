"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = void 0;
const pool_1 = __importDefault(require("./pool"));
const statements = [
    `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
    `CREATE TABLE IF NOT EXISTS study_plans (
    id SERIAL PRIMARY KEY,
    creator_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    duration_days INTEGER NOT NULL,
    average_rating NUMERIC(3,2) DEFAULT 0,
    follower_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  )`,
    `CREATE TABLE IF NOT EXISTS plan_tasks (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0
  )`,
    `CREATE TABLE IF NOT EXISTS followers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, plan_id)
  )`,
    `CREATE TABLE IF NOT EXISTS progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    completed_task_ids INTEGER[] NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, plan_id)
  )`,
    `CREATE TABLE IF NOT EXISTS ratings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INTEGER NOT NULL REFERENCES study_plans(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, plan_id)
  )`,
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
  )`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2) DEFAULT 0`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS subject TEXT`,
    `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'study_plans' AND column_name = 'category'
    ) THEN
      UPDATE study_plans SET subject = category WHERE subject IS NULL AND category IS NOT NULL;
    END IF;
  END $$`,
    `UPDATE study_plans SET subject = 'Other' WHERE subject IS NULL`,
    `ALTER TABLE study_plans ALTER COLUMN subject SET NOT NULL`,
    `ALTER TABLE study_plans ADD COLUMN IF NOT EXISTS duration_days INTEGER`,
    `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'study_plans' AND column_name = 'duration'
    ) THEN
      UPDATE study_plans SET duration_days = duration WHERE duration_days IS NULL AND duration IS NOT NULL;
    END IF;
  END $$`,
    `UPDATE study_plans SET duration_days = 1 WHERE duration_days IS NULL`,
    `ALTER TABLE study_plans ALTER COLUMN duration_days SET NOT NULL`,
    `ALTER TABLE plan_tasks ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0`,
    `ALTER TABLE plan_tasks ADD COLUMN IF NOT EXISTS day_number INTEGER`,
    `DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'plan_tasks' AND column_name = 'day'
    ) THEN
      UPDATE plan_tasks SET day_number = day WHERE day_number IS NULL AND day IS NOT NULL;
    END IF;
  END $$`,
    `UPDATE plan_tasks SET day_number = 1 WHERE day_number IS NULL`,
    `ALTER TABLE plan_tasks ALTER COLUMN day_number SET NOT NULL`,
    `CREATE INDEX IF NOT EXISTS idx_plans_subject ON study_plans(subject)`,
    `CREATE INDEX IF NOT EXISTS idx_plans_duration ON study_plans(duration_days)`,
    `CREATE INDEX IF NOT EXISTS idx_followers_plan ON followers(plan_id)`,
    `CREATE INDEX IF NOT EXISTS idx_ratings_plan ON ratings(plan_id)`,
    `CREATE INDEX IF NOT EXISTS idx_progress_user_plan ON progress(user_id, plan_id)`,
];
const initializeDatabase = async () => {
    for (const statement of statements) {
        await pool_1.default.query(statement);
    }
};
exports.initializeDatabase = initializeDatabase;
