import { Benefit, FaqItem, JourneyStep, MobilityHighlight } from '../models/attendance.model';

export const JOURNEY_STEPS: JourneyStep[] = [
  {
    number: '01',
    title: 'Primeiro Contato & Triagem',
    description:
      'Realizamos uma pré-avaliação digital para entender suas necessidades e preferências, definindo se o atendimento será domiciliar ou em unidade.',
  },
  {
    number: '02',
    title: 'A Consulta',
    description:
      'Diagnóstico completo com tecnologia portátil de ponta, no conforto do seu sofá ou em consultório.',
  },
  {
    number: '03',
    title: 'Tratamento Personalizado',
    description:
      'Execução precisa seguindo o plano terapêutico exclusivo desenhado para você.',
  },
  {
    number: '04',
    title: 'Acompanhamento Contínuo',
    description:
      'Monitoramento pós-procedimento e check-ups preventivos programados para garantir a longevidade do seu tratamento.',
  },
];

export const MOBILITY_HIGHLIGHTS: MobilityHighlight[] = [
  {
    title: 'Mobilidade',
    description: 'Equipamentos de última geração que levam o consultório até você.',
    // TODO: substitua pela imagem real (ex.: maleta odontológica / atendimento domiciliar)
    image: '/home/cadeira.png',
    imageAlt: 'Equipamento odontológico portátil em atendimento domiciliar',
  },
  {
    title: 'Parcerias',
    description: 'Unidades premium para procedimentos que exigem infraestrutura hospitalar.',
    // TODO: substitua pela imagem real (ex.: clínica parceira)
    image: '/home/mobilidade.png',
    imageAlt: 'Recepção de clínica odontológica parceira',
  },
];

export const BENEFITS: Benefit[] = [
  {
    icon: 'home',
    title: 'Conforto Domiciliar',
    description:
      'Ideal para pacientes com mobilidade reduzida, idosos ou quem prefere a privacidade do lar.',
  },
  {
    icon: 'domain',
    title: 'Clínicas Parceiras',
    description:
      'Estruturas completas em localizações estratégicas para cirurgias e estética avançada.',
  },
  {
    icon: 'schedule',
    title: 'Agenda Flexível',
    description:
      'Horários que se adaptam à sua rotina, sem salas de espera e sem pressa.',
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Quais procedimentos podem ser feitos em casa?',
    answer:
      'A maioria dos procedimentos clínicos, como limpezas, restaurações, próteses e clareamentos, podem ser realizados com total segurança através do nosso equipamento portátil de alta tecnologia.',
  },
  {
    question: 'Como funciona o atendimento em clínicas parceiras?',
    answer:
      'Para casos que exigem infraestrutura fixa ou exames de imagem complexos, agendamos sua consulta em uma de nossas unidades estrategicamente localizadas, mantendo o mesmo padrão de atendimento personalizado.',
  },
  {
    question: 'Quais as regiões atendidas no domiciliar?',
    answer:
      'Atendemos toda a região metropolitana e áreas adjacentes. Entre em contato para confirmar a disponibilidade no seu endereço específico.',
  },
];
