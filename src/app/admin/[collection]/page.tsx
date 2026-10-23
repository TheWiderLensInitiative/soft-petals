import { notFound } from "next/navigation";
import { CollectionEditor } from "@/components/admin/CollectionEditor";
import { COLLECTIONS } from "@/components/admin/collections";

export default async function CollectionPage({ params }: { params: Promise<{ collection: string }> }) {
  const { collection } = await params;
  const def = COLLECTIONS[collection];
  if (!def) notFound();
  return <CollectionEditor def={def} />;
}
