import { Input, Modal } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { AUTODL_DEFAULT_PARAMS } from "@/stores/use-config-store";

const PLACEHOLDERS = ["prompt", "duration", "resolution", "orientation", "size", "image", "image0", "image1", "image2"];

export function ModelParamsEditor({ open, modelName, value, onSave, onClose }: { open: boolean; modelName: string; value: string; onSave: (params: string) => void; onClose: () => void }) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState(value);
    useEffect(() => {
        if (open) setDraft(value);
    }, [open, value]);

    return (
        <Modal
            open={open}
            title={`${t("config.paramsEditor.title")}${modelName ? ` · ${modelName}` : ""}`}
            okText={t("common.save")}
            cancelText={t("common.cancel")}
            width={640}
            onCancel={onClose}
            onOk={() => {
                onSave(draft.trim());
                onClose();
            }}
        >
            <p className="mb-1 text-xs text-stone-500">{t("config.paramsEditor.description")}</p>
            <p className="mb-3 text-xs text-stone-500">
                {t("config.paramsEditor.placeholders")}
                {PLACEHOLDERS.map((item) => `{{${item}}}`).join("、")}
            </p>
            <Input.TextArea value={draft} onChange={(event) => setDraft(event.target.value)} rows={12} spellCheck={false} className="font-mono" placeholder={AUTODL_DEFAULT_PARAMS} />
        </Modal>
    );
}
