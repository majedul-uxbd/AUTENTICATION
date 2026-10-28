import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";

const registerSchema = z.object({
    full_name: z
        .string({ message: "Name is required" })
        .trim()
        .min(3, "Name must be at least 3 characters long"),
    email: z
        .string({ message: "Email is required" })
        .email("Invalid email address format"),
    role: z
        .enum(["admin", "user"], {
            message: "Role must be either 'admin' or 'user'",
        })
        .default("user"),
    password: z
        .string({ message: "Password is required" })
        .min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
    email: z
        .string({ message: "Email is required" })
        .email("Invalid email address format"),
    password: z
        .string({ message: "Password is required" })
        .min(1, "Password is required"),
});

// REGISTER
export const register = async (req, res) => {
    try {
        const result = registerSchema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                message: errors[0]?.message || "Validation failed",
                errors,
            });
        }

        const { full_name, email, password, role } = result.data;
        const normalizedEmail = email.toLowerCase();

        const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, normalizedEmail))
            .limit(1);

        if (existingUser.length > 0) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const [newUser] = await db
            .insert(users)
            .values({
                full_name: full_name,
                email: normalizedEmail,
                password: hashedPassword,
                ...(role ? { role } : {}),
            })
            .returning({
                id: users.id,
                full_name: users.full_name,
                email: users.email,
                role: users.role,
            });

        return res.status(201).json({
            message: "User registered successfully",
            user: newUser,
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// LOGIN
export const login = async (req, res) => {
    try {
        const result = loginSchema.safeParse(req.body);

        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join("."),
                message: issue.message,
            }));

            return res.status(400).json({
                message: errors[0]?.message || "Validation failed",
                errors,
            });
        }

        const { email, password } = result.data;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (!user) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};