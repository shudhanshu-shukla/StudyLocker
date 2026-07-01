import { Router } from "express";
import { eq } from "drizzle-orm";

const router = Router();

function getDb() {
  if (!process.env.DATABASE_URL) return null;
  try {
    const { db, usersTable } = require("@workspace/db");
    return { db, usersTable };
  } catch {
    return null;
  }
}

router.post("/users/upsert", async (req, res) => {
  const store = getDb();
  if (!store) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }
  const { db, usersTable } = store;
  try {
    const { googleId, email, firstName, lastName, avatarUrl } = req.body;
    if (!googleId || !email) {
      res.status(400).json({ error: "googleId and email are required" });
      return;
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId)).limit(1);
    if (existing.length > 0) {
      res.json({ user: existing[0], isNew: false });
      return;
    }
    const [newUser] = await db.insert(usersTable).values({ googleId, email, firstName, lastName, avatarUrl, setupComplete: false }).returning();
    res.json({ user: newUser, isNew: true });
  } catch (err) {
    req.log.error({ err }, "Error upserting user");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/users/:googleId/profile", async (req, res) => {
  const store = getDb();
  if (!store) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }
  const { db, usersTable } = store;
  try {
    const { googleId } = req.params;
    const { firstName, lastName, examCategoryId, examCategoryLabel, examId, examName, boardName, className } = req.body;
    const [updated] = await db
      .update(usersTable)
      .set({ firstName, lastName, examCategoryId, examCategoryLabel, examId, examName, boardName, className, setupComplete: true, updatedAt: new Date() })
      .where(eq(usersTable.googleId, googleId))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: updated });
  } catch (err) {
    req.log.error({ err }, "Error updating user profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/users/:googleId", async (req, res) => {
  const store = getDb();
  if (!store) {
    res.status(503).json({ error: "Database not configured" });
    return;
  }
  const { db, usersTable } = store;
  try {
    const { googleId } = req.params;
    const users = await db.select().from(usersTable).where(eq(usersTable.googleId, googleId)).limit(1);
    if (users.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ user: users[0] });
  } catch (err) {
    req.log.error({ err }, "Error fetching user");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
