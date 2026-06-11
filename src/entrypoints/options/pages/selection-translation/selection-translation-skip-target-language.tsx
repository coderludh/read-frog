import { i18n } from "#imports"
import { useAtom } from "jotai"
import { Switch } from "@/components/ui/base-ui/switch"
import { configFieldsAtomMap } from "@/utils/atoms/config"
import { ConfigCard } from "../../components/config-card"

export function SelectionTranslationSkipTargetLanguage() {
  const [selectionTranslation, setSelectionTranslation] = useAtom(
    configFieldsAtomMap.selectionTranslation,
  )

  return (
    <ConfigCard
      id="selection-translation-skip-target-language"
      title={i18n.t("options.selectionTranslation.skipTargetLanguage.title")}
      description={i18n.t("options.selectionTranslation.skipTargetLanguage.description")}
    >
      <div className="w-full flex justify-end">
        <Switch
          checked={selectionTranslation.skipTargetLanguage}
          onCheckedChange={(checked) => {
            void setSelectionTranslation({ ...selectionTranslation, skipTargetLanguage: checked })
          }}
        />
      </div>
    </ConfigCard>
  )
}
