import { PrismaClient } from "@prisma/client";
import { getInputsForScenario, getScenarioKeys } from "./database.js";
const prisma = new PrismaClient();
let keys = await getScenarioKeys(prisma);
let mappedOutputs = keys.map(async (k) => {
    let thisScenarioInputs = await getInputsForScenario(prisma, k.id);
    let week1 = thisScenarioInputs.filter((i) => i.week === 1)[0];
    let week2 = thisScenarioInputs.filter((i) => i.week === 2)[0];
    return {
        id: k.id,
        week1Decision: week1.decision,
        week2Decision: week2.decision,
    };
});
let returned = await Promise.all(mappedOutputs);
let differentDecisions = 0;
returned.forEach((element) => {
    if (element.week1Decision !== element.week2Decision) {
        differentDecisions++;
    }
    console.log(`${element.id}: ${element.week1Decision}, ${element.week2Decision} ${element.week1Decision === element.week2Decision ? "SAME" : "DIFFERENT"}`);
});
console.log(`Decided differently on ${differentDecisions} scenarios.`);
