import { generateText } from "ai";
import { google } from "@ai-sdk/google";

/**
 * Generate a simple AI response from a text prompt
 */
export async function generateAIResponse(prompt: string) {
  const response = await generateText({
    model: google('gemini-2.5-flash'),
    prompt: prompt,
  });
  return response.text;
}

/**
 * Generate a medical summary from a document (PDF/image)
 * This function processes medical records and generates clinical summaries
 */
export async function generateMedicalSummary(
  file: Uint8Array,
  mimeType: string,
  description?: string
): Promise<string> {
  try {
    const prompt = description 
      ? `Analyze this medical document and provide a concise clinical summary. Context: ${description}\n\nInclude:\n1. Key findings\n2. Diagnoses or conditions\n3. Treatments or medications mentioned\n4. Important vital signs or lab results\n5. Follow-up recommendations\n\nProvide a clear, professional summary suitable for electronic health records.`
      : `Analyze this medical document and provide a concise clinical summary including key findings, diagnoses, treatments, vital signs, and recommendations.`;

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
              data: file,
              mediaType: mimeType,
            },
          ],
        },
      ],
    });

    return result.text;
  } catch (error) {
    console.error("Error generating medical summary:", error);
    throw new Error("Failed to generate AI summary from medical document");
  }
}

/**
 * Generate differential diagnoses from clinical notes
 * Used for hypothesis generation in the GenAI clinical system
 */
export async function generateDifferentialDiagnosis(
  clinicalNotes: string,
  patientHistory?: string
): Promise<{
  summary: string;
  differentials: Array<{
    diagnosis: string;
    probability: string;
    reasoning: string;
  }>;
}> {
  try {
    const context = patientHistory 
      ? `Patient History: ${patientHistory}\n\nCurrent Clinical Notes: ${clinicalNotes}`
      : `Clinical Notes: ${clinicalNotes}`;

    const prompt = `As a clinical decision support system, analyze these clinical notes and provide:

${context}

1. A concise summary of the patient's current condition
2. A prioritized list of differential diagnoses with:
   - Diagnosis name
   - Probability (High/Medium/Low)
   - Clinical reasoning based on the notes

Format your response as JSON:
{
  "summary": "brief clinical summary",
  "differentials": [
    {
      "diagnosis": "condition name",
      "probability": "High/Medium/Low",
      "reasoning": "justification based on findings"
    }
  ]
}`;

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: prompt,
    });

    try {
      const parsed = JSON.parse(result.text);
      return parsed;
    } catch {
      return {
        summary: result.text,
        differentials: [],
      };
    }
  } catch (error) {
    console.error("Error generating differential diagnosis:", error);
    throw new Error("Failed to generate differential diagnosis");
  }
}
