/**
 * Datamodel for AI-værktøjer i Værktøjsbiblioteket.
 * Governance-felter er eksempler til demonstrationsformål.
 */

export type ApprovalStatus =
  | "approved"
  | "conditional"
  | "not_approved"
  | "under_review";

export type DataClassification = "green" | "yellow" | "red";

export type PricingModel = "free" | "freemium" | "subscription" | "enterprise";

export type UseCase =
  | "tekst-og-kommunikation"
  | "research"
  | "praesentationer"
  | "billeder"
  | "video"
  | "moeder"
  | "dataanalyse"
  | "kodning";

export type Category =
  | "tekst"
  | "billedgenerering"
  | "video"
  | "produktivitet"
  | "kodning"
  | "research"
  | "moeder"
  | "praesentationer"
  | "dataanalyse";

export interface ToolCapabilities {
  textGeneration: boolean;
  imageGeneration: boolean;
  codeAssistance: boolean;
  research: boolean;
  meetingNotes: boolean;
  presentations: boolean;
  dataAnalysis: boolean;
  video: boolean;
}

export type AvailabilityFlag = boolean | "unknown";

export interface AITool {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  shortDescription: string;
  description: string;
  categories: Category[];
  tags: string[];
  useCases: UseCase[];
  approvalStatus: ApprovalStatus;
  dataClassification: DataClassification;
  pricingModel: PricingModel;
  pricingNote: string;
  strengths: string[];
  limitations: string[];
  allowedData: string[];
  prohibitedData: string[];
  gdprNote: string;
  securityNote: string;
  alternatives: string[];
  lastReviewDate: string;
  featured: boolean;
  hasSso: AvailabilityFlag;
  hasEnterprise: AvailabilityFlag;
  capabilities: ToolCapabilities;
  websiteUrl?: string;
}

export interface ToolFilters {
  query: string;
  categories: Category[];
  useCases: UseCase[];
  pricingModels: PricingModel[];
  approvalStatuses: ApprovalStatus[];
  dataClassifications: DataClassification[];
  sortBy: "name" | "lastReviewDate";
  sortOrder: "asc" | "desc";
}

export const GOVERNANCE_EXAMPLE_DISCLAIMER =
  "Eksempelindhold til demonstrationsformål – ikke verificeret juridisk eller sikkerhedsrådgivning. Kontakt altid IT-sikkerhed og juridisk afdeling for aktuelle vurderinger.";
