import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// GET CURRENT USER
export const getUser = async (req, res) => {
    try {
        console.log("🚀 ~ getUser ~ req.user.userId:", req.user.userId)
        const [user] = await db
            .select({
                id: users.id,
                name: users.full_name,
                email: users.email,
                role: users.role,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.id, req.user.userId))
            .limit(1);
        console.log("🚀 ~ getUser ~ user:", user)

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

// DELETE CURRENT USER
export const deleteUser = async (req, res) => {
    try {
        const deletedUsers = await db
            .delete(users)
            .where(eq(users.id, req.user.userId))
            .returning({ id: users.id });

        if (deletedUsers.length === 0) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "User deleted successfully",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};