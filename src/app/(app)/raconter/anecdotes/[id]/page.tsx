import { Suspense } from "react";
import AnecdoteDetail from "@/components/AnecdoteDetail/AnecdoteDetail";

type Params = Promise<{ id: string }>;

async function Detail({ params }: { params: Params }) {
  const { id } = await params;
  return <AnecdoteDetail id={id} />;
}

export default function Page({ params }: { params: Params }) {
  return (
    <Suspense>
      <Detail params={params} />
    </Suspense>
  );
}
