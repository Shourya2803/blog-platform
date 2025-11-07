import { pgTable, serial, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  published: boolean("published").default(false).notNull(),
  image_url: varchar("image_url", { length: 500 }).default("").notNull(), 
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").default("")
});

export const post_categories = pgTable("post_categories", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").references(() => posts.id).notNull(),
  category_id: integer("category_id").references(() => categories.id).notNull()
});
