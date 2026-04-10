-- CreateEnum
CREATE TYPE "GameEventType" AS VALUE ('building_complete', 'ship_complete', 'research_complete', 'fleet_launch', 'fleet_arrival', 'fleet_return', 'combat_report', 'planet_colonized');

-- CreateTable
CREATE TABLE "GameEvent" (
    "id" TEXT NOT NULL,
    "type" "GameEventType" NOT NULL,
    "playerId" TEXT,
    "planetId" TEXT,
    "fleetId" TEXT,
    "data" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GameEvent_type_idx" ON "GameEvent"("type");

CREATE INDEX "GameEvent_playerId_idx" ON "GameEvent"("playerId");

CREATE INDEX "GameEvent_createdAt_idx" ON "GameEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "GameEvent" ADD CONSTRAINT "GameEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;