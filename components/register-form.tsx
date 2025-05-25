"use client"

import { useState, useEffect } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Github } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { signIn } from "next-auth/react"

export function RegisterForm() {
  const t = useTranslations("RegisterForm")
  const locale = useLocale()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const referralCode = searchParams?.get("ref") || ""

  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("validation.name"),
    }),
    email: z.string().email({
      message: t("validation.email"),
    }),
    password: z.string().min(8, {
      message: t("validation.password"),
    }),
    referralCode: z.string().optional(),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      referralCode: referralCode,
    },
  })

  // Update referral code if it changes in URL
  useEffect(() => {
    if (referralCode) {
      form.setValue("referralCode", referralCode)
    }
  }, [referralCode, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    // fetch超时机制
    function fetchWithTimeout(resource: RequestInfo, options: RequestInit = {}, timeout = 10000) {
      return Promise.race([
        fetch(resource, options),
        new Promise((_, reject) => setTimeout(() => reject(new Error(t("errors.timeout"))), timeout))
      ])
    }

    try {
      const response = await fetchWithTimeout("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!(response as Response).ok) {
        let error: any = {}
        try {
          error = await (response as Response).json()
        } catch (e) {
          try {
            error = { message: await (response as Response).text() }
          } catch {
            error = { message: t("errors.unknown") }
          }
        }
        console.log('register error:', error)
        const errorMsg = error.message || error.error || error.detail || ''
        if (errorMsg === "User already exists") {
          toast.error(t("errors.userExists"))
          setIsLoading(false)
          return
        }
        toast.error(errorMsg || t("errors.unknown"))
        setIsLoading(false)
        return
      }

      toast.success(t("success.description"))

      // Sign in the user after successful registration
      await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      router.push(`/${locale}/dashboard`)
      router.refresh()
    } catch (error) {
      console.error("Registration error:", error)
      let description = t("errors.unknown")
      if (error instanceof Error) {
        if (error.message === "Failed to fetch") {
          description = t("errors.failedFetch")
        } else {
          description = error.message
        }
      } else if (typeof error === 'object' && error !== null) {
        description = (error as any).message || (error as any).error || (error as any).detail || t("errors.unknown")
      }
      toast.error(description)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
          
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {referralCode && (
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("referralCode")}</FormLabel>
                  <FormControl>
                    <Input {...field} disabled />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? t("creating") : t("createAccount")}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{t("orContinueWith")}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" onClick={() => signIn("google", { callbackUrl: `/${locale}/dashboard` })}>
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            />
          </svg>
          Google
        </Button>
        <Button variant="outline" onClick={() => signIn("github", { callbackUrl: `/${locale}/dashboard` })}>
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>
    </div>
  )
}
