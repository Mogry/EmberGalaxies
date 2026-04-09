-- CreateTable
CREATE TABLE "CombatReport" (
    "id" TEXT NOT NULL,
    "attackerId" TEXT NOT NULL,
    "defenderId" TEXT NOT NULL,
    "planetId" TEXT NOT NULL,
    "mission" "FleetMission" NOT NULL,
    "winner" TEXT NOT NULL,
    "attackerShips" JSONB NOT NULL,
    "defenderShips" JSONB NOT NULL,
    "loot" JSONB,
    "fuelCost" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CombatReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CombatReport_attackerId_idx" ON "CombatReport"("attackerId");
CREATE INDEX "CombatReport_defenderId_idx" ON "CombatReport"("defenderId");
CREATE INDEX "CombatReport_planetId_idx" ON "CombatReport"("planetId");

-- AddForeignKey
ALTER TABLE "CombatReport" ADD CONSTRAINT "CombatReport_attackerId_fkey" FOREIGN KEY ("attackerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CombatReport" ADD CONSTRAINT "CombatReport_defenderId_fkey" FOREIGN KEY ("defenderId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CombatReport" ADD CONSTRAINT "CombatReport_planetId_fkey" FOREIGN KEY ("planetId") REFERENCES "Planet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;