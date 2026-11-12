import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import ProfileForm from "@/components/ProfileForm/ProfileForm";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Mon profil" backHref="/compte" />
      <ProfileForm />
    </FlowPage>
  );
}
