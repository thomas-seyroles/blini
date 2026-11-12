import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import NotificationSettings from "@/components/NotificationSettings/NotificationSettings";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Notifications" backHref="/compte" />
      <NotificationSettings />
    </FlowPage>
  );
}
