import Link from "next/link";
import type { AITool } from "@/lib/types";
import { capabilityLabels } from "@/lib/labels";
import { approvalStatusLabels, dataClassificationLabels, pricingModelLabels } from "@/lib/labels";
import { formatAvailability } from "@/lib/tool-utils";
import { StatusBadge } from "@/components/status-badge";
import { DataClassificationBadge } from "@/components/data-classification-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface ToolComparisonTableProps {
  tools: AITool[];
  className?: string;
}

function boolLabel(value: boolean): string {
  return value ? "Ja" : "Nej";
}

export function ToolComparisonTable({
  tools,
  className,
}: ToolComparisonTableProps) {
  if (tools.length === 0) {
    return null;
  }

  const capabilityKeys = Object.keys(capabilityLabels) as Array<
    keyof typeof capabilityLabels
  >;

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border/80 bg-card",
        className,
      )}
    >
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="min-w-44 bg-muted/30 font-semibold">
              Egenskab
            </TableHead>
            {tools.map((tool) => (
              <TableHead key={tool.id} className="min-w-44 bg-muted/30">
                <Link
                  href={`/vaerktoj/${tool.slug}`}
                  className="font-heading text-sm font-semibold text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  {tool.name}
                </Link>
                <p className="mt-0.5 font-normal text-xs text-muted-foreground">
                  {tool.vendor}
                </p>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">Prismodel</TableCell>
            {tools.map((tool) => (
              <TableCell key={`${tool.id}-price`}>
                {pricingModelLabels[tool.pricingModel]}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Governance-status</TableCell>
            {tools.map((tool) => (
              <TableCell key={`${tool.id}-status`}>
                <StatusBadge status={tool.approvalStatus} />
                <span className="sr-only">
                  {approvalStatusLabels[tool.approvalStatus]}
                </span>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Dataklassifikation</TableCell>
            {tools.map((tool) => (
              <TableCell key={`${tool.id}-class`}>
                <DataClassificationBadge
                  classification={tool.dataClassification}
                  showLabel={false}
                />
                <span className="sr-only">
                  {dataClassificationLabels[tool.dataClassification]}
                </span>
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">SSO</TableCell>
            {tools.map((tool) => (
              <TableCell key={`${tool.id}-sso`}>
                {formatAvailability(tool.hasSso)}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">Enterprise</TableCell>
            {tools.map((tool) => (
              <TableCell key={`${tool.id}-enterprise`}>
                {formatAvailability(tool.hasEnterprise)}
              </TableCell>
            ))}
          </TableRow>
          {capabilityKeys.map((key) => (
            <TableRow key={key}>
              <TableCell className="font-medium">
                {capabilityLabels[key]}
              </TableCell>
              {tools.map((tool) => (
                <TableCell key={`${tool.id}-${key}`}>
                  {boolLabel(tool.capabilities[key])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
