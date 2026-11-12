import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ChoiceSetting from "@/components/ChoiceSetting/ChoiceSetting";
import { APPARENCES } from "@/lib/account";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Apparence" backHref="/compte" />
      <ChoiceSetting settingKey="apparence" fallback="auto" options={APPARENCES} note="Le thème sombre arrive bientôt, ton choix est déjà enregistré." />
    </FlowPage>
  );
}
