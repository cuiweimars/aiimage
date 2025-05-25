import { useTranslations } from "next-intl"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const t = useTranslations("FAQ")

  const faqs = Array.from({ length: 12 }).map((_, i) => ({
    question: t(`items.${i}.question`),
    answer: t(`items.${i}.answer`),
  }))

  const left = faqs.slice(0, 6)
  const right = faqs.slice(6, 12)

  return (
    <section className="py-12 md:py-24 bg-background">
      <div className="container mx-auto flex flex-col items-center px-4 md:px-6 max-w-5xl">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("title")}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
          <div className="flex flex-col gap-8">
            {left.map((faq, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base mt-1">{i + 1}</div>
                <div>
                  <div className="font-bold mb-1">{faq.question}</div>
                  <div className="text-muted-foreground leading-relaxed">{faq.answer}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-8">
            {right.map((faq, i) => (
              <div key={i + 6} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-base mt-1">{i + 7}</div>
                <div>
                  <div className="font-bold mb-1">{faq.question}</div>
                  <div className="text-muted-foreground leading-relaxed">{faq.answer}</div>
                </div>
              </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}
