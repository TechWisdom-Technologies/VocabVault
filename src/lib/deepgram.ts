import { DeepgramClient } from "@deepgram/sdk";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require("@deepgram/sdk") as { createClient: (key: string) => DeepgramClient };

export const deepgram: DeepgramClient = createClient(
  process.env.DEEPGRAM_API_KEY!
);

export default deepgram;
