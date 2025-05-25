import { getTranslations } from "next-intl/server"
import { Sparkles, Zap, Shield, Palette, Globe, Cloud } from "lucide-react"

export async function Features() {
  const t = await getTranslations("Features")

  const features = [
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: t("items.0.title"),
      description: t("items.0.description"),
    },
    {
      icon: <Zap className="h-10 w-10" />,
      title: t("items.1.title"),
      description: t("items.1.description"),
    },
    {
      icon: <Shield className="h-10 w-10" />,
      title: t("items.2.title"),
      description: t("items.2.description"),
    },
    {
      icon: <Palette className="h-10 w-10" />,
      title: t("items.3.title"),
      description: t("items.3.description"),
    },
    {
      icon: <Globe className="h-10 w-10" />,
      title: t("items.4.title"),
      description: t("items.4.description"),
    },
    {
      icon: <Cloud className="h-10 w-10" />,
      title: t("items.5.title"),
      description: t("items.5.description"),
    },
  ]

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 place-items-center w-full">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center p-6 rounded-lg border bg-card w-[340px]">
              <div className="mb-4 rounded-full bg-primary/10 p-3 text-primary">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
