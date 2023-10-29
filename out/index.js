// using Chalk: https://www.npmjs.com/package/chalk
// using Commander: https://www.npmjs.com/package/commander
// https://github.com/enquirer/enquirer
import shuffle from "knuth-shuffle-seeded";
import pkg from "enquirer";
import { PrismaClient } from "@prisma/client";
import { addDecisionToDB, getInputsForWeek, scenariosWithEmptyInputForWeek, } from "./database.js";
const { Select } = pkg;
const prisma = new PrismaClient();
async function startup() {
    const p = new Select({
        name: "flow",
        message: "Begin judgement session or view stats?",
        choices: ["Begin", "Stats"],
    });
    const ans = await p.run().catch(console.error);
    return ans;
}
async function runExperiment(week, maxScenarios = 100) {
    let scenarios = await scenariosWithEmptyInputForWeek(prisma, week);
    shuffle(scenarios);
    let responded = 0;
    while (scenarios.length > 0 && responded < maxScenarios) {
        const scenario = scenarios.pop();
        const partialResponse = await respondToSingleScenario(scenario.scenario);
        const fullResponse = {
            decision: partialResponse.decision,
            remember: partialResponse.remember,
            inappropriate: partialResponse.inappropriate,
            scenarioId: scenario.id,
            week: week,
        };
        addDecisionToDB(prisma, fullResponse);
        console.log(fullResponse);
        responded++;
    }
}
async function respondToSingleScenario(scenario) {
    console.log("\n");
    const j = new Select({
        name: "judgement",
        message: scenario,
        choices: ["Jones", "Smith"],
    });
    const decision = await j.run().catch(console.error);
    const r = new Select({
        name: "remember",
        message: "Do you remember this scenario from a previous experiment?",
        choices: ["No", "Yes"],
        result: (v) => (v === "Yes" ? true : false),
    });
    const remember = await r.run().catch(console.error);
    const i = new Select({
        name: "inappropriate",
        message: "Was this scenario inappropriate?",
        choices: ["No", "Yes"],
        result: (v) => (v === "Yes" ? true : false),
    });
    const inappropriate = await i.run().catch(console.error);
    return { decision, remember, inappropriate };
}
async function getWeek() {
    // todo: fetch number of completed for each week
    const week1 = await getInputsForWeek(prisma, 1);
    const week2 = await getInputsForWeek(prisma, 2);
    const week3 = await getInputsForWeek(prisma, 3);
    const w = new Select({
        name: "week",
        message: ` Which week do you want to do?
    Week 1: ${week1.complete} complete, ${week1.incomplete} incomplete
    Week 2: ${week2.complete} complete, ${week2.incomplete} incomplete
    Week 3: ${week3.complete} complete, ${week3.incomplete} incomplete.`,
        choices: ["1", "2", "3"],
        result: (v) => Number(v),
    });
    let week = await w.run().catch(console.error);
    return week;
}
async function main() {
    const ans = await startup();
    const maxScenarios = 25;
    if (ans === "Begin") {
        const week = await getWeek();
        await runExperiment(week, maxScenarios);
    }
    else if (ans === "Stats") {
        const week1 = await getInputsForWeek(prisma, 1);
        const week2 = await getInputsForWeek(prisma, 2);
        const week3 = await getInputsForWeek(prisma, 3);
        console.log(`Completion log:
    Week 1: ${week1.complete} complete, ${week1.incomplete} incomplete
    Week 2: ${week2.complete} complete, ${week2.incomplete} incomplete
    Week 3: ${week3.complete} complete, ${week3.incomplete} incomplete.`);
        main();
    }
}
await main()
    .then(async () => {
    await prisma.$disconnect();
})
    .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
});
