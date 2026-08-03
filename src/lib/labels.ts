import type {
  ApprovalStatus,
  Category,
  DataClassification,
  PricingModel,
  UseCase,
} from "./types";

export const useCaseLabels: Record<UseCase, string> = {
  "tekst-og-kommunikation": "Tekst og kommunikation",
  research: "Research",
  praesentationer: "Præsentationer",
  billeder: "Billeder",
  video: "Video",
  moeder: "Møder",
  dataanalyse: "Dataanalyse",
  kodning: "Kodning",
};

export const categoryLabels: Record<Category, string> = {
  tekst: "Tekst",
  billedgenerering: "Billedgenerering",
  video: "Video",
  produktivitet: "Produktivitet",
  kodning: "Kodning",
  research: "Research",
  moeder: "Møder",
  praesentationer: "Præsentationer",
  dataanalyse: "Dataanalyse",
};

export const approvalStatusLabels: Record<ApprovalStatus, string> = {
  approved: "Godkendt",
  conditional: "Betinget godkendt",
  not_approved: "Ikke godkendt",
  under_review: "Under vurdering",
};

export const dataClassificationLabels: Record<DataClassification, string> = {
  green: "Grøn",
  yellow: "Gul",
  red: "Rød",
};

export const dataClassificationDescriptions: Record<DataClassification, string> = {
  green:
    "Offentligt eller internt ikke-følsomt indhold. Lav risiko ved utilsigtet eksponering.",
  yellow:
    "Fortroligt eller forretningskritisk indhold. Kræver godkendt værktøj og skærpet opmærksomhed.",
  red: "Personoplysninger, særhemmeligheder eller andet særligt beskyttet indhold. Må normalt ikke indtastes i eksterne AI-værktøjer.",
};

export const pricingModelLabels: Record<PricingModel, string> = {
  free: "Gratis",
  freemium: "Freemium",
  subscription: "Abonnement",
  enterprise: "Enterprise",
};

export const capabilityLabels = {
  textGeneration: "Tekstgenerering",
  imageGeneration: "Billedgenerering",
  codeAssistance: "Kodeassistance",
  research: "Research",
  meetingNotes: "Mødereferater",
  presentations: "Præsentationer",
  dataAnalysis: "Dataanalyse",
  video: "Video",
} as const;
