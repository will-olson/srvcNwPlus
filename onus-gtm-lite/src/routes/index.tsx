import { createFileRoute } from "@tanstack/react-router";
import { UnifiedGtmStudio } from "@/components/gtm/UnifiedGtmStudio";

export const Route = createFileRoute("/")({
  component: UnifiedGtmStudio,
});
