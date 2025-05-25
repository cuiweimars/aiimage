"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface SettingsFormProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const t = useTranslations("SettingsForm")
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.name"),
    }),
    email: z.string().email({
      message: t("validation.email"),
    }),
    bio: z.string().max(160).optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      bio: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to update profile")
      }

      toast({
        title: t("success.title"),
        description: t("success.description"),
      })

      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: t("errors.title"),
        description: error instanceof Error ? error.message : t("errors.unknown"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.image || ""} alt={user.name || ""} />
            <AvatarFallback>{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <Button variant="outline" type="button">
            {t("changeAvatar")}
          </Button>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("name")}</FormLabel>
              <FormControl>
                <Input placeholder={t("namePlaceholder")} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("email")}</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("bio")}</FormLabel>
              <FormControl>
                <Textarea placeholder={t("bioPlaceholder")} className="resize-none" {...field} />
              </FormControl>
              <FormDescription>{t("bioDescription")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading}>
          {isLoading ? t("updating") : t("updateProfile")}
        </Button>
      </form>
    </Form>
  )
}
