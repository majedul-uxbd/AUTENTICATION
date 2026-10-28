import {
    pgTable,
    serial,
    varchar,
    timestamp,
    pgEnum,
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable("users", {
    id: serial("id").primaryKey(),

    full_name: varchar("full_name", { length: 100 }).notNull(),

    email: varchar("email", { length: 255 })
        .notNull()
        .unique(),
    role: roleEnum('role')
        .default('user')
        .notNull(),

    password: varchar("password", { length: 255 })
        .notNull(),

    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),
});