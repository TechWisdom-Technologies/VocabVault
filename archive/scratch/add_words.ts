
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const additionalWords = [
  { word: "resilient", definition: "Able to withstand or recover quickly from difficult conditions." },
  { word: "advocate", definition: "A person who publicly supports or recommends a particular cause or policy." },
  { word: "scrutinize", definition: "Examine or inspect closely and thoroughly." },
  { word: "meticulous", definition: "Showing great attention to detail; very careful and precise." },
  { word: "anomaly", definition: "Something that deviates from what is standard, normal, or expected." },
  { word: "cogent", definition: "Clear, logical, and convincing." },
  { word: "deference", definition: "Humble submission and respect." },
  { word: "equivocal", definition: "Open to more than one interpretation; ambiguous." },
  { word: "fastidious", definition: "Very attentive to and concerned about accuracy and detail." },
  { word: "garrulous", definition: "Excessively talkative, especially on trivial matters." },
  { word: "harangue", definition: "A lengthy and aggressive speech." },
  { word: "impetuous", definition: "Acting or done quickly and without thought or care." },
  { word: "juxtapose", definition: "Place or deal with close together for contrasting effect." },
  { word: "laconic", definition: "Using very few words." },
  { word: "magnanimous", definition: "Generous or forgiving, especially toward a rival or less powerful person." }
];

async function main() {
  const currentCount = await prisma.word.count();
  for (let i = 0; i < additionalWords.length; i++) {
    const w = additionalWords[i];
    await prisma.word.upsert({
      where: { word: w.word },
      update: {},
      create: {
        word: w.word,
        definition: w.definition,
        orderIndex: currentCount + i + 1,
        phonetic: "/.../",
        partOfSpeech: "Noun/Verb/Adj",
        tenseForms: [w.word],
        paragraph: `The word ${w.word} is very interesting in this context.`,
      }
    });
  }
  console.log("Added 15 more words.");
}

main().finally(() => prisma.$disconnect());
