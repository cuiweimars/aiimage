import { getTranslations } from "next-intl/server"
import { ImageGenerator } from "@/components/image-generator"

export default async function AILabPage() {
  const t = await getTranslations("AILabPage")

  return (
    <div className="flex flex-col min-h-screen">
      <section className="py-12 md:py-24 bg-background">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center mb-10">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("hero.title")}</h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("hero.subtitle")}</p>
          </div>
          <ImageGenerator />
        </div>
      </section>
    </div>
  )
}
