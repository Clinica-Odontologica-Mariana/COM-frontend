import { LucideIconData } from '@lucide/angular';
export interface JourneyStep {
  number: string;
  title: string;
  description: string;
}

export interface Benefit {
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MobilityHighlight {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
}
