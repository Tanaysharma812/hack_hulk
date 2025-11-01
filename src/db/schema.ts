import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull(), // 'admin', 'ngo', 'student'
  fullName: text('full_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const ngoProfiles = sqliteTable('ngo_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  ngoName: text('ngo_name').notNull(),
  description: text('description'),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone'),
  websiteUrl: text('website_url'),
  logoUrl: text('logo_url'),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ngoId: integer('ngo_id').notNull().references(() => ngoProfiles.id),
  title: text('title').notNull(),
  description: text('description'),
  eventDate: text('event_date').notNull(),
  location: text('location').notNull(),
  category: text('category').notNull(),
  registrationLink: text('registration_link'),
  imageUrl: text('image_url'),
  approved: integer('approved', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const chatHistory = sqliteTable('chat_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  sessionId: text('session_id').notNull(),
  message: text('message').notNull(),
  response: text('response').notNull(),
  language: text('language').notNull().default('en'),
  createdAt: text('created_at').notNull(),
});