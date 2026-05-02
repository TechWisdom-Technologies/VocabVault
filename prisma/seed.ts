import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleWords = [
  {
    word: "ubiquitous",
    phonetic: "/juːˈbɪkwɪtəs/",
    partOfSpeech: "Adjective",
    definition: "Present, appearing, or found everywhere.",
    tenseForms: ["ubiquitous", "ubiquitously", "ubiquity"],
    pronunciationAudioUrl: "https://example.com/audio/ubiquitous-pronunciation.mp3",
    definitionAudioUrl: "https://example.com/audio/ubiquitous-definition.mp3",
    synonyms: [
      { word: "omnipresent", sentence: "Smartphones have become omnipresent in modern society." },
      { word: "pervasive", sentence: "The pervasive influence of social media is undeniable." },
      { word: "universal", sentence: "Music is a universal language." }
    ],
    antonyms: [
      { word: "rare", sentence: "Such genuine kindness is rare." },
      { word: "scarce", sentence: "Food was scarce during the winter." },
      { word: "uncommon", sentence: "It is uncommon to see snow in this region." }
    ],
    sentences: [
      { tense: "Present Simple", sentence: "Coffee shops are ubiquitous in this city." },
      { tense: "Present Continuous", sentence: "AI is becoming ubiquitous in our daily lives." },
      { tense: "Past Simple", sentence: "Before the internet, encyclopedias were ubiquitous in libraries." },
      { tense: "Past Continuous", sentence: "The new fashion trend was becoming ubiquitous last summer." },
      { tense: "Present Perfect", sentence: "Mobile phones have become ubiquitous." },
      { tense: "Future Simple", sentence: "Electric cars will be ubiquitous in the next decade." }
    ],
    articles: [
      { title: "The Rise of Smartphones", content: "Smartphones are now ubiquitous. Almost everyone has one, fundamentally changing how we communicate." },
      { title: "Plastic Pollution", content: "Plastic waste is a ubiquitous problem. It is found in oceans, forests, and cities around the world." },
      { title: "Digital Advertising", content: "Online ads are ubiquitous. You cannot browse the web without encountering them on almost every page." }
    ],
    paragraph: "In the modern age, technology has become completely ubiquitous. From the moment we wake up, we are surrounded by smart devices. This ubiquitous connectivity allows us to stay in touch with friends and family across the globe. However, the omnipresent nature of screens can also be overwhelming. The pervasive influence of social media, a ubiquitous force in youth culture, shapes opinions and trends. While this universal access to information is beneficial, we must be mindful of the rare moments when we can disconnect. Finding a balance in a world where digital interaction is ubiquitous is a modern challenge.",
    audioClipUrls: [
      { accent: "US", url: "https://example.com/audio/ubiquitous-us.mp3" },
      { accent: "UK", url: "https://example.com/audio/ubiquitous-uk.mp3" },
      { accent: "AU", url: "https://example.com/audio/ubiquitous-au.mp3" }
    ],
    correctAudioCounts: [
      { accent: "US", count: 2 },
      { accent: "UK", count: 1 },
      { accent: "AU", count: 1 }
    ],
    paragraphTargetCount: 5,
    paragraphSynonymCount: 2,
    paragraphAntonymCount: 1,
  },
  {
    word: "ephemeral",
    phonetic: "/ɪˈfem(ə)rəl/",
    partOfSpeech: "Adjective",
    definition: "Lasting for a very short time.",
    tenseForms: ["ephemeral", "ephemerally", "ephemerality"],
    pronunciationAudioUrl: "https://example.com/audio/ephemeral-pronunciation.mp3",
    definitionAudioUrl: "https://example.com/audio/ephemeral-definition.mp3",
    synonyms: [
      { word: "fleeting", sentence: "She caught a fleeting glimpse of the deer." },
      { word: "transient", sentence: "The transient nature of youth is a common theme in poetry." },
      { word: "momentary", sentence: "He experienced a momentary lapse in concentration." }
    ],
    antonyms: [
      { word: "permanent", sentence: "The injury caused permanent damage." },
      { word: "enduring", sentence: "Their enduring friendship survived many challenges." },
      { word: "eternal", sentence: "Some believe in eternal life." }
    ],
    sentences: [
      { tense: "Present Simple", sentence: "Fame is often ephemeral." },
      { tense: "Present Continuous", sentence: "The beauty of the sunset is proving ephemeral as night falls." },
      { tense: "Past Simple", sentence: "The spring flowers were beautiful but ephemeral." },
      { tense: "Past Continuous", sentence: "His sudden surge of energy was feeling ephemeral." },
      { tense: "Present Perfect", sentence: "The joy of victory has always been ephemeral." },
      { tense: "Future Simple", sentence: "The effects of the medication will be ephemeral." }
    ],
    articles: [
      { title: "Spring Blossoms", content: "Cherry blossoms are famous for their ephemeral beauty. They bloom brilliantly but only last a few days." },
      { title: "Internet Trends", content: "Viral memes are highly ephemeral. What is popular today will likely be forgotten tomorrow." },
      { title: "Youth", content: "Many writers focus on the ephemeral nature of youth, urging people to appreciate it before it fades." }
    ],
    paragraph: "The beauty of a sunset is inherently ephemeral. The brilliant colors paint the sky for only a fleeting moment before fading into darkness. We often try to capture these transient scenes with photographs, hoping to make an ephemeral experience permanent. However, part of the charm lies in its momentary existence. Unlike an enduring monument, an ephemeral event forces us to be present. While we might wish for eternal daylight, the ephemeral twilight reminds us to appreciate the passing of time.",
    audioClipUrls: [
      { accent: "US", url: "https://example.com/audio/ephemeral-us.mp3" },
      { accent: "UK", url: "https://example.com/audio/ephemeral-uk.mp3" },
      { accent: "AU", url: "https://example.com/audio/ephemeral-au.mp3" }
    ],
    correctAudioCounts: [
      { accent: "US", count: 1 },
      { accent: "UK", count: 2 },
      { accent: "AU", count: 1 }
    ],
    paragraphTargetCount: 5,
    paragraphSynonymCount: 2,
    paragraphAntonymCount: 2,
  },
  {
    word: "mitigate",
    phonetic: "/ˈmɪtɪɡeɪt/",
    partOfSpeech: "Verb",
    definition: "Make (something bad) less severe, serious, or painful.",
    tenseForms: ["mitigate", "mitigates", "mitigating", "mitigated"],
    pronunciationAudioUrl: "https://example.com/audio/mitigate-pronunciation.mp3",
    definitionAudioUrl: "https://example.com/audio/mitigate-definition.mp3",
    synonyms: [
      { word: "alleviate", sentence: "The medicine helped alleviate the pain." },
      { word: "reduce", sentence: "We need to reduce our carbon footprint." },
      { word: "lessen", sentence: "The new rules should lessen the traffic congestion." }
    ],
    antonyms: [
      { word: "aggravate", sentence: "Scratching will only aggravate the rash." },
      { word: "exacerbate", sentence: "His angry comments exacerbated the situation." },
      { word: "intensify", sentence: "The wind began to intensify." }
    ],
    sentences: [
      { tense: "Present Simple", sentence: "Trees mitigate the effects of pollution." },
      { tense: "Present Continuous", sentence: "The government is mitigating the economic crisis." },
      { tense: "Past Simple", sentence: "They mitigated the risk by diversifying their investments." },
      { tense: "Past Continuous", sentence: "We were mitigating the damage when the second storm hit." },
      { tense: "Present Perfect", sentence: "New technologies have mitigated the environmental impact." },
      { tense: "Future Simple", sentence: "This plan will mitigate future losses." }
    ],
    articles: [
      { title: "Climate Change", content: "We must take immediate action to mitigate the effects of global warming. Planting trees is one effective strategy." },
      { title: "Risk Management", content: "Businesses use insurance to mitigate financial risks. It provides a safety net against unexpected events." },
      { title: "Healthcare", content: "Vaccines are crucial to mitigate the spread of infectious diseases, protecting vulnerable populations." }
    ],
    paragraph: "The city council implemented new policies to mitigate traffic congestion. By improving public transport, they hope to alleviate the daily gridlock. However, construction work on the main highway threatened to exacerbate the problem temporarily. To mitigate this, they opened alternative routes to reduce the burden on local roads. While it's impossible to completely eliminate traffic, these measures should significantly lessen the delay for commuters. If they hadn't acted, the situation would have continued to aggravate.",
    audioClipUrls: [
      { accent: "US", url: "https://example.com/audio/mitigate-us.mp3" },
      { accent: "UK", url: "https://example.com/audio/mitigate-uk.mp3" },
      { accent: "AU", url: "https://example.com/audio/mitigate-au.mp3" }
    ],
    correctAudioCounts: [
      { accent: "US", count: 1 },
      { accent: "UK", count: 1 },
      { accent: "AU", count: 2 }
    ],
    paragraphTargetCount: 3,
    paragraphSynonymCount: 2,
    paragraphAntonymCount: 2,
  },
  {
    word: "pragmatic",
    phonetic: "/præɡˈmætɪk/",
    partOfSpeech: "Adjective",
    definition: "Dealing with things sensibly and realistically in a way that is based on practical rather than theoretical considerations.",
    tenseForms: ["pragmatic", "pragmatically", "pragmatism"],
    pronunciationAudioUrl: "https://example.com/audio/pragmatic-pronunciation.mp3",
    definitionAudioUrl: "https://example.com/audio/pragmatic-definition.mp3",
    synonyms: [
      { word: "practical", sentence: "We need a practical solution to this problem." },
      { word: "realistic", sentence: "Be realistic about what you can achieve in a day." },
      { word: "sensible", sentence: "Wearing a coat in winter is a sensible decision." }
    ],
    antonyms: [
      { word: "idealistic", sentence: "His idealistic views often clashed with reality." },
      { word: "impractical", sentence: "The proposed design was completely impractical." },
      { word: "unrealistic", sentence: "Expecting perfection is unrealistic." }
    ],
    sentences: [
      { tense: "Present Simple", sentence: "She takes a pragmatic approach to management." },
      { tense: "Present Continuous", sentence: "The team is being pragmatic about the deadline." },
      { tense: "Past Simple", sentence: "He made a pragmatic decision to accept the lower offer." },
      { tense: "Past Continuous", sentence: "They were being pragmatic when they canceled the event." },
      { tense: "Present Perfect", sentence: "We have always maintained a pragmatic strategy." },
      { tense: "Future Simple", sentence: "The new leader will be pragmatic in her policies." }
    ],
    articles: [
      { title: "Business Strategy", content: "A successful business requires a pragmatic approach. Ideals are important, but profits keep the doors open." },
      { title: "Politics", content: "Voters often prefer pragmatic politicians who focus on solvable issues rather than grand, unachievable visions." },
      { title: "Education", content: "Schools are taking a more pragmatic approach, teaching skills that are directly applicable to the modern workforce." }
    ],
    paragraph: "When facing a budget crisis, the committee had to adopt a pragmatic approach. While some members held idealistic visions of expanding the program, the realistic constraints of funding forced a change. They made the practical decision to cut non-essential services. This pragmatic strategy wasn't popular, but it was a sensible way to prevent bankruptcy. An impractical plan would have led to total failure. By being pragmatic, they ensured the core services survived.",
    audioClipUrls: [
      { accent: "US", url: "https://example.com/audio/pragmatic-us.mp3" },
      { accent: "UK", url: "https://example.com/audio/pragmatic-uk.mp3" },
      { accent: "AU", url: "https://example.com/audio/pragmatic-au.mp3" }
    ],
    correctAudioCounts: [
      { accent: "US", count: 2 },
      { accent: "UK", count: 1 },
      { accent: "AU", count: 1 }
    ],
    paragraphTargetCount: 4,
    paragraphSynonymCount: 2,
    paragraphAntonymCount: 2,
  },
  {
    word: "eloquent",
    phonetic: "/ˈeləkwənt/",
    partOfSpeech: "Adjective",
    definition: "Fluent or persuasive in speaking or writing.",
    tenseForms: ["eloquent", "eloquently", "eloquence"],
    pronunciationAudioUrl: "https://example.com/audio/eloquent-pronunciation.mp3",
    definitionAudioUrl: "https://example.com/audio/eloquent-definition.mp3",
    synonyms: [
      { word: "articulate", sentence: "She is an articulate and confident speaker." },
      { word: "expressive", sentence: "His face was highly expressive." },
      { word: "fluent", sentence: "He is fluent in three languages." }
    ],
    antonyms: [
      { word: "inarticulate", sentence: "He was so angry he became inarticulate." },
      { word: "hesitant", sentence: "She gave a hesitant smile." },
      { word: "mumbled", sentence: "He mumbled an apology." }
    ],
    sentences: [
      { tense: "Present Simple", sentence: "He is an eloquent speaker." },
      { tense: "Present Continuous", sentence: "She is being remarkably eloquent today." },
      { tense: "Past Simple", sentence: "The president gave an eloquent speech." },
      { tense: "Past Continuous", sentence: "He was delivering an eloquent plea for peace." },
      { tense: "Present Perfect", sentence: "She has proven to be an eloquent advocate." },
      { tense: "Future Simple", sentence: "I hope my presentation will be eloquent." }
    ],
    articles: [
      { title: "Public Speaking", content: "To be an effective leader, one must be eloquent. A clear, persuasive voice can inspire thousands." },
      { title: "Literature", content: "Shakespeare is famous for his eloquent writing. His words have resonated with audiences for centuries." },
      { title: "Debate", content: "In a debate, the most eloquent argument often wins, even if it is not the most factually accurate." }
    ],
    paragraph: "The lawyer delivered an eloquent closing argument that captivated the jury. Her articulate phrasing and expressive tone conveyed the depth of the tragedy. Unlike the opposing counsel, who was often hesitant and inarticulate, she spoke with a fluent grace. This eloquent performance left a lasting impression. While a mumbled defense might be ignored, an eloquent plea demands attention. Her eloquence ultimately won the case.",
    audioClipUrls: [
      { accent: "US", url: "https://example.com/audio/eloquent-us.mp3" },
      { accent: "UK", url: "https://example.com/audio/eloquent-uk.mp3" },
      { accent: "AU", url: "https://example.com/audio/eloquent-au.mp3" }
    ],
    correctAudioCounts: [
      { accent: "US", count: 1 },
      { accent: "UK", count: 2 },
      { accent: "AU", count: 1 }
    ],
    paragraphTargetCount: 4,
    paragraphSynonymCount: 2,
    paragraphAntonymCount: 2,
  }
];

async function main() {
  console.log("Start seeding...");

  await prisma.word.deleteMany({});
  console.log("Cleared existing words.");

  for (let i = 0; i < sampleWords.length; i++) {
    const wordData = sampleWords[i];
    await prisma.word.create({
      data: {
        ...wordData,
        orderIndex: i + 1,
      },
    });
  }

  console.log(`Seeding finished. Added ${sampleWords.length} words.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
