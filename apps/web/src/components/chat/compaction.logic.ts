import type {
  OrchestrationV2ProviderTurnTokenUsage,
  ProviderDriverKind,
  ProviderInstanceId,
} from "@t3tools/contracts";
import {
  resolveSelectableProviderInstanceEntry,
  type ProviderInstanceEntry,
} from "../../providerInstances";
import { formatExpiresInLabel, formatRelativeTimeLabel } from "../../timestampFormat";

function providerSupportsManualCompaction(
  provider: ProviderInstanceEntry | null | undefined,
): boolean {
  return provider?.snapshot.slashCommands.some((command) => command.name === "compact") ?? false;
}

export function hasAvailableCompactionProvider(input: {
  readonly providers: ReadonlyArray<ProviderInstanceEntry>;
  readonly driverKind: ProviderDriverKind;
  readonly instanceId: ProviderInstanceId | null;
  readonly lockedInstanceId: ProviderInstanceId | null;
}): boolean {
  const driverProviders = input.providers.filter(
    (provider) => provider.driverKind === input.driverKind,
  );
  const lockedContinuationGroupKey = input.lockedInstanceId
    ? driverProviders.find((provider) => provider.instanceId === input.lockedInstanceId)
        ?.continuationGroupKey
    : undefined;
  const compatibleProviders = lockedContinuationGroupKey
    ? driverProviders.filter(
        (provider) => provider.continuationGroupKey === lockedContinuationGroupKey,
      )
    : driverProviders;

  return providerSupportsManualCompaction(
    resolveSelectableProviderInstanceEntry(compatibleProviders, input.instanceId ?? undefined),
  );
}

export function describePromptCache(
  usage: Pick<OrchestrationV2ProviderTurnTokenUsage, "promptCacheTtlMs" | "updatedAt"> | null,
): string | null {
  if (usage?.promptCacheTtlMs === undefined) return null;
  const expiresAtMs = Date.parse(usage.updatedAt) + usage.promptCacheTtlMs;
  if (!Number.isFinite(expiresAtMs)) return null;
  const expiresAt = new Date(expiresAtMs).toISOString();
  return expiresAtMs > Date.now()
    ? `Prompt cache warm. ${formatExpiresInLabel(expiresAt)}`
    : `Prompt cache expired ${formatRelativeTimeLabel(expiresAt)}`;
}

export function formatContextWindowCompactionMessage(autoCompactThreshold?: number | null): string {
  if (typeof autoCompactThreshold === "number" && autoCompactThreshold > 0) {
    return `Compacts automatically at about ${autoCompactThreshold.toLocaleString("en-US")} tokens.`;
  }
  return "Context compacts automatically when needed.";
}
