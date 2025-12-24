
import { GoogleGenAI, Type } from "@google/genai";
import { DiagnosisResult, FaultCodeData, TruckBrand, Language } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-3-pro-preview';

const RENAULT_STANDARD_CONTEXT = `
  VEHICLE SPECIALIZATION: Renault Trucks 440 DXi.
  CORE OBJECTIVE: Diagnostic analysis using Renault Technical Manual 70 627 standards.
  
  DIAGNOSTIC GUIDELINES:
  - Precisely distinguish between RENAULT (DXi Series) and VOLVO (FH/FM) logic.
  - Identify the exact SENSOR location (e.g., Engine left side, behind turbo, on chassis rail).
  - Provide specific WIRE CODES/COLORS if applicable (Renault standard).
  - Include "WIPE/RESET" instructions using either the dashboard menu (DASH) or a diagnostic tool (V-MAC / NG3).

  SYSTEM MAPPINGS FOR 440 DXi:
  - MID 128: Engine ECU (V-MAC).
  - MID 136: EBS (Brakes).
  - MID 144: VECU (Vehicle Control).
  - MID 185: APM (Air Production).
  - MID 150: ECS (Suspension).
`;

const DIAGNOSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    system: { type: Type.STRING },
    description: { type: Type.STRING },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
    causes: { type: Type.ARRAY, items: { type: Type.STRING } },
    solutions: { type: Type.ARRAY, items: { type: Type.STRING } },
    severity: { type: Type.STRING, description: "low, medium, or high" },
    partName: { type: Type.STRING, description: "Specific technical name for the identified part" },
    removalSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    assemblySteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    repairNotes: { type: Type.STRING },
    toolsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
    wiringCheck: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          color: { type: Type.STRING },
          function: { type: Type.STRING },
          code: { type: Type.STRING }
        },
        required: ['color', 'function']
      }
    }
  },
  required: ['system', 'description', 'symptoms', 'causes', 'solutions', 'severity', 'partName'],
};

export async function analyzeFaultCode(
  data: FaultCodeData,
  brand: TruckBrand,
  model: string,
  lang: Language
): Promise<DiagnosisResult> {
  const prompt = `DIAGNOSE: ${brand} ${model}. CODE: MID ${data.mid} ${data.pid ? 'PID ' + data.pid : 'SID ' + data.sid} FMI ${data.fmi}. 
    Identify the specific faulty sensor and provide its physical location. Use Manual 70 627 protocols for Renault. Language: ${lang}.`;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      systemInstruction: RENAULT_STANDARD_CONTEXT,
      responseMimeType: "application/json",
      responseSchema: DIAGNOSIS_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}') as DiagnosisResult;
}

export async function analyzeImageFault(
  base64Data: string,
  brand: TruckBrand,
  model: string,
  lang: Language
): Promise<DiagnosisResult> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: { 
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
        { text: `Identify the truck make (Renault 440DXI preferred) and the specific faulty component from this image. Provide diagnosis, exact location, and Renault 70 627 protocol in ${lang}.` }
      ] 
    },
    config: {
      systemInstruction: RENAULT_STANDARD_CONTEXT,
      responseMimeType: "application/json",
      responseSchema: DIAGNOSIS_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}') as DiagnosisResult;
}

export async function sendChatMessage(
  history: any[],
  message: string,
  brand: TruckBrand,
  model: string,
  lang: Language
): Promise<string> {
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: [...history, { role: 'user', parts: [{ text: message }] }],
    config: { systemInstruction: RENAULT_STANDARD_CONTEXT },
  });
  return response.text || "";
}
