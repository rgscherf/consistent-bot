-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Input" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "decision" TEXT,
    "remember" BOOLEAN NOT NULL,
    "inappropriate" BOOLEAN NOT NULL,
    "scenarioId" TEXT NOT NULL,
    CONSTRAINT "Input_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "Scenario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Input" ("decision", "id", "inappropriate", "remember", "scenarioId", "week") SELECT "decision", "id", "inappropriate", "remember", "scenarioId", "week" FROM "Input";
DROP TABLE "Input";
ALTER TABLE "new_Input" RENAME TO "Input";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
