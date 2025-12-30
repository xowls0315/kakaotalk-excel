import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Message {
  timestamp: string;
  sender: string;
  content: string;
  type: "message" | "system" | "image" | "video";
}

export interface ConvertOptions {
  excludeSystemMessages: boolean;
  dateStart?: string;
  dateEnd?: string;
  selectedParticipants?: string[];
  showDate?: boolean;
  showTime?: boolean;
  showSender?: boolean;
  showType?: boolean;
  showContent?: boolean;
}

interface ConvertState {
  options: ConvertOptions;
  messages: Message[];
  setOptions: (options: Partial<ConvertOptions>) => void;
  setMessages: (messages: Message[]) => void;
  resetOptions: () => void;
}

const defaultOptions: ConvertOptions = {
  excludeSystemMessages: false,
  dateStart: undefined,
  dateEnd: undefined,
  selectedParticipants: undefined,
  showDate: true,
  showTime: true,
  showSender: true,
  showType: true,
  showContent: true,
};

export const useConvertStore = create<ConvertState>()(
  persist(
    (set) => ({
      options: defaultOptions,
      messages: [],
      setOptions: (newOptions) =>
        set((state) => ({
          options: { ...state.options, ...newOptions },
        })),
      setMessages: (messages) => set({ messages }),
      resetOptions: () => set({ options: defaultOptions }),
    }),
    {
      name: "convert-options-storage",
    }
  )
);
