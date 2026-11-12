import { Suspense } from "react";
import AnecdoteDetail from "@/components/AnecdoteDetail/AnecdoteDetail";
import { seedAnecdotes } from "@/lib/anecdotes";

type Params = Promise<{ id: string }>;

export function generateStaticParams() {
  return seedAnecdotes.map(({ id }) => ({ id }));
}

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
