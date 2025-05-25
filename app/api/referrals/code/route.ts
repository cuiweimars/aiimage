import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createClient()

    // Check if user already has a referral code
    const { data: existingCode } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", session.user.id)
      .single()

    if (existingCode) {
      return NextResponse.json({ code: existingCode.code })
    }

    // Generate a new referral code
    const code = generateReferralCode()

    // Try to insert the code, retry if there's a conflict
    let success = false
    let attempts = 0
    let finalCode = code

    while (!success && attempts < 5) {
      const { error } = await supabase.from("referral_codes").insert({ user_id: session.user.id, code: finalCode })

      if (!error) {
        success = true
      } else if (error.code === "23505") {
        // Unique violation
        finalCode = generateReferralCode()
        attempts++
      } else {
        console.error("Error generating referral code:", error)
        return NextResponse.json({ error: "Failed to generate referral code" }, { status: 500 })
      }
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to generate unique referral code" }, { status: 500 })
    }

    return NextResponse.json({ code: finalCode })
  } catch (error) {
    console.error("Referral code generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to generate a random referral code
function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let code = ""
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
}
