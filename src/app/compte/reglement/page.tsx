import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import RulesPanel from "@/components/RulesPanel/RulesPanel";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Règlement Bluni" backHref="/compte" />
      <RulesPanel />
    </FlowPage>
  );
}
