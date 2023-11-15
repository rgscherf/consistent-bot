import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function addScenarioToDB(prisma, scenario) {
    await prisma.scenario.create({
        data: { scenario: scenario },
    });
}
export async function addInputsToScenarios(prisma) {
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
export async function scenariosWithEmptyInputForWeek(prisma, week) {
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
export async function addDecisionToDB(prisma, { decision, scenarioId, week, remember, inappropriate }) {
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
export async function getInputsForWeek(prisma, week) {
    const ins = await prisma.input.findMany({
        where: {
            week: week,
        },
    });
    const ret = { complete: 0, incomplete: 0 };
    ins.forEach((i) => {
        if (i.decision === null) {
            ret.incomplete++;
        }
        else {
            ret.complete++;
        }
    });
    return ret;
}
export async function getInputsForScenario(prisma, scenarioId) {
    const ret = await prisma.input.findMany({
        where: {
            scenarioId: scenarioId,
        },
    });
    return ret;
}
export async function getScenarioKeys(prisma) {
    const ret = await prisma.scenario.findMany({
        select: {
            id: true,
        },
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
