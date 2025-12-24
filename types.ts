
export type TruckBrand = 'Renault' | 'Volvo' | 'Scania' | 'MAN' | 'DAF' | 'Iveco' | 'Ford';

export type Language = 'ar' | 'en' | 'fr';

export interface User {
  name: string;
  email?: string;
  photoUrl?: string;
  isRegistered: boolean;
  isPro?: boolean;
  points?: number;
  lastDailyGift?: string; // Timestamp string
}

export interface FaultCodeData {
  mid: string;
  pid?: string;
  sid?: string;
  fmi: string;
}

export interface WiringInfo {
  color: string;
  function: string;
  code?: string;
}

export interface DiagnosisResult {
  system: string;
  description: string;
  symptoms: string[];
  causes: string[];
  solutions: string[];
  severity: 'low' | 'medium' | 'high';
  partName?: string;
  wiringCheck?: WiringInfo[];
  removalSteps?: string[];
  assemblySteps?: string[];
  toolsRequired?: string[];
  repairNotes?: string;
}

export enum AppMode {
  HOME = 'HOME',
  DECODER = 'DECODER',
  SENSORS = 'SENSORS',
  MAINTENANCE = 'MAINTENANCE',
  CHAT = 'CHAT',
  AUTH = 'AUTH',
  OBD = 'OBD'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface SensorData {
  id: string;
  name: string;
  code: string;
  function: string;
  location: string;
  symptoms: string[];
  description: string;
}

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: string;
  mileage: number;
  notes: string;
  cost?: number;
}

export type IntroStage = 'splash' | 'app';
