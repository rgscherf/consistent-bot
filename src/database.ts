import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addScenariosToDB() {
  //todo : get scenarios in this format
  const scenarios = [
    {
      // id: "uui1-uuid-uuid-uuid",
      scenario: "this is scenario 1",
    },
    {
      // id: "uui2-uuid-uuid-uuid",
      scenario: "this is scenario 2",
    },
    {
      // id: "uui3-uuid-uuid-uuid",
      scenario: "this is scenario 3",
    },
    {
      // id: "uui4-uuid-uuid-uuid",
      scenario: "this is scenario 4",
    },
  ];

  await scenarios.forEach(async (scenario) => {
    await prisma.scenario.create({
      data: scenario,
    });
  });
}

export async function addInputsToScenarios(prisma: PrismaClient) {
  let scenarios = await prisma.scenario.findMany({});
  scenarios.forEach(async (scenario) => {
    var weeks = [1, 2, 3];
    weeks.forEach(async (week) => {
      await prisma.input.create({
        data: {
          scenarioId: scenario.id,
          week: week,
          decision: null,
          remember: false,
          inappropriate: false,
        },
      });
    });
  });
}

export async function scenariosWithEmptyInputForWeek(
  prisma: PrismaClient,
  week
) {
  let emptyInputs = await prisma.scenario.findMany({
    where: {
      Input: {
        some: {
          week: week,
          decision: null,
        },
      },
    },
  });
  return emptyInputs;
}

export async function addDecisionToDB(
  prisma: PrismaClient,
  { decision, scenarioId, week, remember, inappropriate }: Decision
) {
  const updated = await prisma.input.updateMany({
    where: { scenarioId, week },
    data: {
      decision,
      remember,
      inappropriate,
    },
  });
  return updated;
}

export type Decision = {
  week: number;
  scenarioId: string;
  decision: string;
  remember: boolean;
  inappropriate: boolean;
};

async function testAddingOneRecord() {
  const decision = {
    week: 1,
    scenarioId: "uui1-uuid-uuid-uuid",
    decision: "B",
    remember: false,
    inappropriate: false,
  };
  await addDecisionToDB(prisma, decision);
}

export async function getInputsForWeek(prisma: PrismaClient, week: number) {
  const ins = await prisma.input.findMany({
    where: {
      week: week,
    },
  });
  const ret = { complete: 0, incomplete: 0 };
  ins.forEach((i) => {
    if (i.decision === null) {
      ret.incomplete++;
    } else {
      ret.complete++;
    }
  });
  return ret;
}

async function main() {}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
