import { getTranslations } from "next-intl/server"

export async function Stats() {
  const t = await getTranslations("Stats")

  const stats = [
    {
      value: "20M+",
      label: t("items.0.label"),
    },
    {
      value: "1,530",
      label: t("items.1.label"),
    },
    {
      value: "4.9",
      label: t("items.2.label"),
    },
  ]

  return (
    <section className="py-12 md:py-24 bg-background border-y">
      <div className="max-w-7xl w-full mx-auto flex flex-col items-center px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 place-items-center w-full">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center w-[200px]">
              <div className="text-4xl font-bold text-primary md:text-5xl lg:text-6xl">{stat.value}</div>
              <p className="mt-2 text-xl text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
