// using Chalk: https://www.npmjs.com/package/chalk
// using Commander: https://www.npmjs.com/package/commander
// https://github.com/enquirer/enquirer
import shuffle from "knuth-shuffle-seeded";
import pkg from "enquirer";
import { clearScreen } from "./utils.js";
const { prompt, Select, Survey } = pkg;
const dummyScenarios = {
    "1": "This is the first scenario. A or B?",
    "2": "This is the second scenario. A or B?",
    "3": "This is the third scenario. A or B?",
    "4": "This is the fourth scenario. A or B?",
    "5": "This is the fifth scenario. A or B?",
    "6": "This is the sixth scenario. A or B?",
};
async function startup() {
    const p = new Select({
        name: "flow",
        message: "Begin judgement session or view stats?",
        choices: ["Begin", "Stats"],
    });
    const ans = await p.run().catch(console.error);
    return ans;
}
async function runExperiment() {
    var ks = Object.keys(dummyScenarios);
    shuffle(ks);
    const responses = {};
    while (ks.length > 0) {
        clearScreen();
        const k = ks.pop();
        const scenario = dummyScenarios[k];
        responses[k] = await respondToSingleScenario(scenario);
    }
    return responses;
}
async function respondToSingleScenario(scenario) {
    const ret = {
        judgement: undefined,
        remember: undefined,
        inappropriate: undefined,
    };
    const j = new Select({
        name: "judgement",
        message: scenario,
        choices: ["A", "B"],
    });
    ret.judgement = await j.run().catch(console.error);
    const r = new Select({
        name: "remember",
        message: "Do you remember this scenario from a previous experiment?",
        choices: ["No", "Yes"],
        result: (v) => (v === "Yes" ? true : false),
    });
    ret.remember = await r.run().catch(console.error);
    const i = new Select({
        name: "inappropriate",
        message: "Was this scenario inappropriate?",
        choices: ["No", "Yes"],
        result: (v) => (v === "Yes" ? true : false),
    });
    ret.inappropriate = await i.run().catch(console.error);
    return ret;
}
async function getWeek() {
    // todo: fetch number of completed for each week
    const w = new Select({
        name: "week",
        message: "Which week do you want to do?",
        choices: ["1", "2", "3"],
        result: (v) => Number(v),
    });
    let week = await w.run().catch(console.error);
    return week;
}
async function main() {
    const ans = await startup();
    if (ans === "Begin") {
        const week = await getWeek();
        const results = await runExperiment();
        console.dir(results);
        console.log(`Week was ${week}`);
    }
    else if (ans === "Stats") {
        console.dir(dummyScenarios);
        main();
    }
}
await main();
