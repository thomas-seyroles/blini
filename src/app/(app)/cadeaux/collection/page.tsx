import FlowHeader from "@/components/FlowHeader/FlowHeader";
import FlowPage from "@/components/FlowPage/FlowPage";
import GiftCarousel from "@/components/GiftCarousel/GiftCarousel";
import ItemShop from "@/components/ItemShop/ItemShop";
import SectionTitle from "@/components/SectionTitle/SectionTitle";
import sub from "../sub.module.css";

export default function Page() {
  return (
    <FlowPage>
      <FlowHeader title="Ma collection" backHref="/cadeaux" />
      <section className={sub.section}>
        <SectionTitle title="Mes items" subtitle="Les éléments obtenus avec tes points." />
        <ItemShop onlyOwned />
      </section>
      <section className={sub.section}>
        <SectionTitle title="Histoires offertes" subtitle="Nées de tes anecdotes, à écouter gratuitement." />
        <GiftCarousel wrap />
      </section>
      <div className={sub.spacer} />
    </FlowPage>
  );
}
