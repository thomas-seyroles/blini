import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import PrivacySettings from "@/components/PrivacySettings/PrivacySettings";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Confidentialité" backHref="/compte" />
      <PrivacySettings />
    </FlowPage>
  );
}
