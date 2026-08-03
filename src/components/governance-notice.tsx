import { AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { GOVERNANCE_EXAMPLE_DISCLAIMER } from "@/lib/types";
import { cn } from "@/lib/utils";

interface GovernanceNoticeProps {
  variant?: "info" | "warning";
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

export function GovernanceNotice({
  variant = "info",
  title = "Eksempelindhold – ikke verificeret rådgivning",
  children,
  className,
}: GovernanceNoticeProps) {
  const Icon = variant === "warning" ? AlertTriangle : Info;

  return (
    <Alert
      className={cn(
        "border-border/80",
        variant === "warning"
          ? "border-amber-300/80 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-50"
          : "bg-muted/40",
        className,
      )}
    >
      <Icon className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="text-sm leading-relaxed">
        {children ?? GOVERNANCE_EXAMPLE_DISCLAIMER}
      </AlertDescription>
    </Alert>
  );
}
