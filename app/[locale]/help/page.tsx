import { getTranslations } from "next-intl/server"
import Link from "next/link"
import { BookOpen, HelpCircle, FileText, MessageSquare, Video, Lightbulb, Sparkles, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default async function HelpPage() {
  const t = await getTranslations("Help")

  const guides = [
    {
      title: t("guides.gettingStarted.title"),
      description: t("guides.gettingStarted.description"),
      icon: <Sparkles className="h-5 w-5" />,
      link: "/help/getting-started",
    },
    {
      title: t("guides.promptWriting.title"),
      description: t("guides.promptWriting.description"),
      icon: <FileText className="h-5 w-5" />,
      link: "/help/prompt-writing",
    },
    {
      title: t("guides.imageStyles.title"),
      description: t("guides.imageStyles.description"),
      icon: <Lightbulb className="h-5 w-5" />,
      link: "/help/image-styles",
    },
    {
      title: t("guides.subscriptions.title"),
      description: t("guides.subscriptions.description"),
      icon: <BookOpen className="h-5 w-5" />,
      link: "/help/subscriptions",
    },
  ]

  const faqs = [
    {
      question: t("faq.items.0.question"),
      answer: t("faq.items.0.answer"),
    },
    {
      question: t("faq.items.1.question"),
      answer: t("faq.items.1.answer"),
    },
    {
      question: t("faq.items.2.question"),
      answer: t("faq.items.2.answer"),
    },
    {
      question: t("faq.items.3.question"),
      answer: t("faq.items.3.answer"),
    },
    {
      question: t("faq.items.4.question"),
      answer: t("faq.items.4.answer"),
    },
    {
      question: t("faq.items.5.question"),
      answer: t("faq.items.5.answer"),
    },
  ]

  const videos = [
    {
      title: t("videos.items.0.title"),
      description: t("videos.items.0.description"),
      thumbnail: "/placeholder.svg?height=150&width=300&text=Tutorial+Video+1",
      duration: "3:45",
      link: "#video-1",
    },
    {
      title: t("videos.items.1.title"),
      description: t("videos.items.1.description"),
      thumbnail: "/placeholder.svg?height=150&width=300&text=Tutorial+Video+2",
      duration: "5:12",
      link: "#video-2",
    },
    {
      title: t("videos.items.2.title"),
      description: t("videos.items.2.description"),
      thumbnail: "/placeholder.svg?height=150&width=300&text=Tutorial+Video+3",
      duration: "4:30",
      link: "#video-3",
    },
  ]

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-2 text-muted-foreground">{t("description")}</p>
        </div>

        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guides.map((guide, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {guide.icon}
                    {guide.title}
                  </CardTitle>
                  <CardDescription>{guide.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link href={guide.link}>
                      {t("readGuide")}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="faq" className="mb-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="faq">
              <HelpCircle className="h-4 w-4 mr-2" />
              {t("faq.title")}
            </TabsTrigger>
            <TabsTrigger value="videos">
              <Video className="h-4 w-4 mr-2" />
              {t("videos.title")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("faq.title")}</CardTitle>
                <CardDescription>{t("faq.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, i) => (
                    <AccordionItem key={i} value={`item-${i}`}>
                      <AccordionTrigger>{faq.question}</AccordionTrigger>
                      <AccordionContent>{faq.answer}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="videos" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("videos.title")}</CardTitle>
                <CardDescription>{t("videos.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {videos.map((video, i) => (
                    <div key={i} className="overflow-hidden rounded-md border">
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnail || "/placeholder.svg"}
                          alt={video.title}
                          className="w-full object-cover aspect-video"
                        />
                        <div className="absolute bottom-2 right-2 bg-background/80 px-1 rounded text-xs">
                          {video.duration}
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium">{video.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{video.description}</p>
                        <Button asChild variant="link" size="sm" className="mt-2 h-auto p-0">
                          <Link href={video.link}>{t("watchVideo")}</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">{t("support.title")}</h2>
          <p className="text-muted-foreground mb-4">{t("support.description")}</p>
          <Button asChild>
            <Link href="/contact">
              <MessageSquare className="h-4 w-4 mr-2" />
              {t("support.contactUs")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
