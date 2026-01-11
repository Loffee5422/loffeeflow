import { RecurrenceConfig } from "../types";

export const parseSmartTask = async (input: string): Promise<{
  title: string;
  description: string;
  starLevel: number;
  estimatedMinutes: number;
  dueDate: string; // ISO Format YYYY-MM-DD
  recurrence?: RecurrenceConfig;
} | null> => {
    return null;
};

export const getFocusTip = async (taskTitle: string): Promise<string> => {
     return "Focus is the key to productivity.";
}