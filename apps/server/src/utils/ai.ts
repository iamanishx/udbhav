import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import fs from "fs";

export async function generateAIResponse(prompt: string) {
    const response = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: prompt,
    });
    return response.text;
}

export async function generateMistralResponse(prompt: string, filePath: string) {

const buf = await fs.promises.readFile(filePath);

  const result = await generateText({
  model: google("gemini-2.5-flash"),
  messages: [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'file',
          data: buf,
          mediaType: 'application/pdf',
        },
      ],
    },
  ],
  providerOptions: {
    mistral: {
      documentImageLimit: 8,
      documentPageLimit: 64,
    },
  },
});
    console.log("Response:", result.text);
    return result;

}

await generateMistralResponse("Summarize the content of the document.", "apps/server/src/assets/udbhav.pdf")