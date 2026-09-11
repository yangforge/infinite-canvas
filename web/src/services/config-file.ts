import { saveAs } from "file-saver";

import i18n from "@/i18n";
import { modelOptionsFromChannels, useConfigStore, type AiConfig, type WebdavSyncConfig } from "@/stores/use-config-store";
import { usePromptSourceStore, type PromptSourceSchedule } from "@/stores/use-prompt-source-store";
import type { PromptSource } from "@/services/api/prompt-source-presets";

type AppConfigFile = {
    app: "infinite-canvas";
    version: 1;
    exportedAt: string;
    config: AiConfig;
    webdav: WebdavSyncConfig;
    promptSources: {
        sources: PromptSource[];
        schedule: PromptSourceSchedule;
    };
};

export function exportAppConfig() {
    const { config, webdav } = useConfigStore.getState();
    const { sources, schedule } = usePromptSourceStore.getState();
    // Export every channel, including the site defaults from /config.json.
    const channels = config.channels;
    const userConfig: AiConfig = { ...config, channels, models: modelOptionsFromChannels(channels) };
    const data: AppConfigFile = { app: "infinite-canvas", version: 1, exportedAt: new Date().toISOString(), config: userConfig, webdav, promptSources: { sources, schedule } };
    saveAs(new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" }), "infinite-canvas-config.json");
}

export async function importAppConfig(file: File) {
    await parseAndApplyConfig(await file.text());
}

/** Fetch an exported settings file from a network address and import it. */
export async function importAppConfigFromUrl(url: string) {
    let text: string;
    try {
        const response = await fetch(url, { redirect: "follow" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        text = await response.text();
    } catch (error) {
        throw new Error(i18n.t("config.importUrlFetchFailed", { error: error instanceof Error ? error.message : String(error) }));
    }
    await parseAndApplyConfig(text);
}

async function parseAndApplyConfig(text: string) {
    let data: AppConfigFile;
    try {
        data = JSON.parse(text) as AppConfigFile;
    } catch {
        throw new Error(i18n.t("config.invalidFile"));
    }
    if (data.app !== "infinite-canvas" || data.version !== 1 || !data.config || !data.webdav || !data.promptSources) throw new Error(i18n.t("config.invalidFile"));
    useConfigStore.getState().applyConfig(data.config);
    useConfigStore.setState({ webdav: data.webdav });
    usePromptSourceStore.setState(data.promptSources);
}
