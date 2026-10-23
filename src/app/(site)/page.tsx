import { hasContent, Section } from "@/components/site/Sections";
import { getSiteData } from "@/lib/data";

export default async function Home() {
  const data = await getSiteData();
  return (
    <>
      {data.settings.sections
        .filter((s) => s.visible && hasContent(s.key, data))
        .map((s) => (
          <Section key={s.key} section={s} data={data} />
        ))}
    </>
  );
}
