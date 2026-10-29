const { pgTable, serial, varchar, timestamp, pgEnum } = require("drizzle-orm/pg-core");

const roleEnum = pgEnum('role', ['admin', 'user']);

const users = pgTable("users", {
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
    updatedAt: timestamp("updated_at"),
});

module.exports = {
    users,
    roleEnum
};