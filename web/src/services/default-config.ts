import type { AiConfig } from "@/stores/use-config-store";

/** Site config file, fetched on every page load and applied as read-only defaults. */
export const DEFAULT_CONFIG_URL = "/config.json";

/**
 * Fetch the site default config. A missing or malformed file resolves to null
 * so the app silently keeps its built-in defaults.
 */
export async function fetchDefaultConfig(url = DEFAULT_CONFIG_URL): Promise<Partial<AiConfig> | null> {
    try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) return null;
        const data = JSON.parse(await response.text()) as Partial<AiConfig> & { config?: Partial<AiConfig> };
        if (!data || typeof data !== "object") return null;
        const config = data.config && typeof data.config === "object" ? data.config : data;
        return config && typeof config === "object" ? config : null;
    } catch {
        return null;
    }
}
