import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function addScenarioToDB(prisma: PrismaClient, scenario: string) {
  await prisma.scenario.create({
    data: { scenario: scenario },
  });
}

export async function addInputsToScenarios(prisma: PrismaClient) {
  // Querying for an empty association: https://github.com/prisma/prisma/issues/3888
  let scenarios = await prisma.scenario.findMany({
    where: { Input: { none: {} } },
  });
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

// async function main() {
//   addScenariosToDB();
//   setTimeout(() => {
//     addInputsToScenarios(prisma);
//   }, 3000);
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });
