export interface JourneyStep {
  number: string;
  title: string;
  description: string;
}

export interface Benefit {
  icon: string;
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