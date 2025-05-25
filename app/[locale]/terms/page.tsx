import { getTranslations } from "next-intl/server"

export default async function TermsPage() {
  const t = await getTranslations("TermsPage")

  return (
    <div className="container py-12 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">{t("title")}</h1>
      <p className="text-muted-foreground mb-8 text-center">{t("lastUpdated")}</p>

      <div className="prose prose-lg dark:prose-invert max-w-none w-full">
        <h2>{t("sections.0.title")}</h2>
        <p>{t("sections.0.content")}</p>

        <h2>{t("sections.1.title")}</h2>
        <p>{t("sections.1.content")}</p>

        <h2>{t("sections.2.title")}</h2>
        <p>{t("sections.2.content")}</p>
        <ul>
          <li>{t("sections.2.items.0")}</li>
          <li>{t("sections.2.items.1")}</li>
          <li>{t("sections.2.items.2")}</li>
          <li>{t("sections.2.items.3")}</li>
          <li>{t("sections.2.items.4")}</li>
        </ul>

        <h2>{t("sections.3.title")}</h2>
        <p>{t("sections.3.content")}</p>

        <h2>{t("sections.4.title")}</h2>
        <p>{t("sections.4.content")}</p>

        <h2>{t("sections.5.title")}</h2>
        <p>{t("sections.5.content")}</p>

        <h2>{t("sections.6.title")}</h2>
        <p>{t("sections.6.content")}</p>

        <h2>{t("sections.7.title")}</h2>
        <p>{t("sections.7.content")}</p>
        <ul>
          <li>{t("sections.7.items.0")}</li>
          <li>{t("sections.7.items.1")}</li>
          <li>{t("sections.7.items.2")}</li>
          <li>{t("sections.7.items.3")}</li>
          <li>{t("sections.7.items.4")}</li>
        </ul>

        <h2>{t("sections.8.title")}</h2>
        <p>{t("sections.8.content")}</p>

        <h2>{t("sections.9.title")}</h2>
        <p>{t("sections.9.content")}</p>

        <h2>{t("sections.10.title")}</h2>
        <p>{t("sections.10.content")}</p>
        <p>{t("contact")}</p>
      </div>
    </div>
  )
}
