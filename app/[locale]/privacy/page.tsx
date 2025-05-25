import { getTranslations } from "next-intl/server"

export default async function PrivacyPage() {
  const t = await getTranslations("PrivacyPage")

  // 假设 sections 长度未知，动态渲染
  const sectionCount = 11

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">{t("title")}</h1>
      <p className="text-muted-foreground mb-8 text-center">{t("lastUpdated")}</p>

      <div className="prose prose-lg dark:prose-invert max-w-none w-full">
        {Array.from({ length: sectionCount }).map((_, i) => {
          let items: string[] = []
          for (let j = 0; j < 10; j++) {
            try {
              const item = t(`sections.${i}.items.${j}`)
              if (item && item !== `sections.${i}.items.${j}`) items.push(item)
            } catch {}
          }
          return (
            <div key={i}>
              <h2>{t(`sections.${i}.title`)}</h2>
              <p>{t(`sections.${i}.content`)}</p>
              {items.length > 0 && (
                <ul>
                  {items.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
              )}
            </div>
          )
        })}
        <p>{t("contact")}</p>
      </div>
    </div>
  )
}
