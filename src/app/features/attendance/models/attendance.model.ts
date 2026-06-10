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
  /**
   * Caminho da imagem a ser exibida no card.
   * Coloque a imagem em `public/images/home/` e referencie aqui (ex.: `/images/home/mobilidade.jpg`).
   */
  image: string;
  imageAlt: string;
}