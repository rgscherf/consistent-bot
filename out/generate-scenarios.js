import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { addInputsToScenarios, addScenarioToDB } from "./database.js";
import { setTimeout } from "timers/promises";
const chatGPTPrompt = `
Create a 2-4 paragraph scenario of at least 300 words.
It must be similar to a legal case, where one party makes a claim against another.
The scenario's circumstances should be extremely ambiguous, such that strong arguments could easily be made for either party.
The scenario must end with a clear statement of the claim that is being made against one of the parties. You may include counterclaim(s).
Label the parties "Smith" and "Jones"--do not use unique names.

The scenario you write must include:
- numbers, such as dollar values or dates.
- a specific chain of events.
- lots of small details that complicate the scenario and add evidence for either side.

Although you should add lots of details, ensure they are relevant to the events at hand.
Also, ensure that every detail is consistent with the other details.
Finally, ensure that each detail contributes to the body of evidence for Smith or Jones.
Remember to keep the evidence balanced so a judge would have a hard time deciding who is at fault.

The scenario may be about money, but it could also be about whether one party is at fault for some event.

Only provide the sequence of events. Do not offer any commentary about the scenario. Do not include any headers such as "CLAIM:". Just the facts.
`;
const openai = new OpenAI();
const prisma = new PrismaClient();
async function getChunk() {
    let five = [];
    for (let i = 0; i < 5; i++) {
        five.push(openai.chat.completions.create({
            messages: [{ role: "system", content: chatGPTPrompt }],
            model: "gpt-4",
            max_tokens: 1000,
        }));
    }
    let completed = await Promise.all(five);
    let scenarios = completed.map((c) => {
        return c.choices[0].message.content;
    });
    let scenarioInsertions = scenarios.map(async (scenario) => {
        return addScenarioToDB(prisma, scenario);
    });
    await Promise.all(scenarioInsertions);
}
async function main() {
    for (let i = 0; i < 20; i++) {
        await getChunk();
        await setTimeout(60000);
    }
}
main().then(() => {
    addInputsToScenarios(prisma);
    prisma.$disconnect();
});
