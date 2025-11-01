import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getBlob } from "./getBlob";


export async function generateAIResponse(prompt: string) {
    const response = await generateText({
        model: google('gemini-2.5-flash'),
        prompt: prompt,
    });
    return response.text;
}

export async function generateMistralResponse(prompt: string, file: Uint8Array) {

const buf = file;
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

const file = await getBlob(1);
await generateMistralResponse("Summarize the content of the document.", file!)