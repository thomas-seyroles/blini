import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ChoiceSetting from "@/components/ChoiceSetting/ChoiceSetting";
import { LANGUES } from "@/lib/account";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Langue" backHref="/compte" />
      <ChoiceSetting settingKey="langue" fallback="fr" options={LANGUES} note="Bluni est disponible en français pour le moment, les autres langues arrivent bientôt." />
    </FlowPage>
  );
}
