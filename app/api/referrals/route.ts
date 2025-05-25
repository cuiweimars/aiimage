import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const supabase = createClient()

    // Get user's referral code
    const { data: referralCode, error: referralCodeError } = await supabase
      .from("referral_codes")
      .select("code")
      .eq("user_id", session.user.id)
      .single()

    if (referralCodeError && referralCodeError.code !== "PGRST116") {
      console.error("Error fetching referral code:", referralCodeError)
      return NextResponse.json({ error: "Failed to fetch referral code" }, { status: 500 })
    }

    // Get user's referrals
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select(`
        id,
        status,
        reward_type,
        reward_amount,
        created_at,
        referred_id,
        users:referred_id (name, email, image)
      `)
      .eq("referrer_id", session.user.id)
      .order("created_at", { ascending: false })

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError)
      return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 })
    }

    // Get user's rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false })

    if (rewardsError) {
      console.error("Error fetching rewards:", rewardsError)
      return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
    }

    return NextResponse.json({
      referralCode: referralCode?.code || null,
      referrals: referrals || [],
      rewards: rewards || [],
    })
  } catch (error) {
    console.error("Referrals fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
