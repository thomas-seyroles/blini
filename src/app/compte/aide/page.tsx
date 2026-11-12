import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import FaqList from "@/components/FaqList/FaqList";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Aide et contact" backHref="/compte" />
      <FaqList />
    </FlowPage>
  );
}
