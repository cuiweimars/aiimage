"use client"

import { useRef, useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useTranslations } from 'next-intl'

const testimonials = [
  {
    name: "Sarah Thompson",
    role: "designer",
    contentKey: "0.content",
    avatar: "/placeholder.svg?height=40&width=40&text=ST",
    rating: 5,
  },
  {
    name: "David Parker",
    role: "developer",
    contentKey: "1.content",
    avatar: "/placeholder.svg?height=40&width=40&text=DP",
    rating: 5,
  },
  {
    name: "Emily Chen",
    role: "marketer",
    contentKey: "2.content",
    avatar: "/placeholder.svg?height=40&width=40&text=EC",
    rating: 4,
  },
  {
    name: "Michael Lee",
    role: "manager",
    contentKey: "3.content",
    avatar: "/placeholder.svg?height=40&width=40&text=ML",
    rating: 5,
  },
  {
    name: "Anna Wang",
    role: "illustrator",
    contentKey: "4.content",
    avatar: "/placeholder.svg?height=40&width=40&text=AW",
    rating: 5,
  },
]

const CARD_WIDTH = 370 // px
const CARD_GAP = 24 // px
const VISIBLE_COUNT = 3

export function Testimonials() {
  const t = useTranslations('Testimonials')
  return (
    <section className="py-12 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t('title')}</h2>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">{t('subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 justify-center items-center">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] hover:border-primary/50"
            >
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={testimonial.avatar || "/placeholder.svg"} alt={testimonial.name} />
                    <AvatarFallback className="text-lg">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                    <p className="text-sm text-muted-foreground">{t(`roles.${testimonial.role}`)}</p>
                  </div>
                </div>
                <div className="flex mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < testimonial.rating ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground flex-1 leading-relaxed">{t(`items.${testimonial.contentKey}`)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
