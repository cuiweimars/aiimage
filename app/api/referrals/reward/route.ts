import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// This route is used to issue rewards for completed referrals
export async function POST(req: NextRequest) {
  try {
    // This endpoint would typically be called by an admin or a scheduled job
    // For security, we'll still require authentication
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { referralId, rewardType, rewardAmount, description } = await req.json()

    if (!referralId || !rewardType || !rewardAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Get the referral
    const { data: referral, error: referralError } = await supabase
      .from("referrals")
      .select("*")
      .eq("id", referralId)
      .single()

    if (referralError) {
      console.error("Error fetching referral:", referralError)
      return NextResponse.json({ error: "Failed to fetch referral" }, { status: 500 })
    }

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 })
    }

    // Check if the referral is already rewarded
    if (referral.status === "rewarded") {
      return NextResponse.json({ error: "Referral is already rewarded" }, { status: 400 })
    }

    // Start a transaction
    const { error: transactionError } = await supabase.rpc("issue_referral_reward", {
      p_referral_id: referralId,
      p_reward_type: rewardType,
      p_reward_amount: rewardAmount,
      p_description: description || "Referral reward",
    })

    if (transactionError) {
      console.error("Error issuing reward:", transactionError)
      return NextResponse.json({ error: "Failed to issue reward" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Reward issued successfully" })
  } catch (error) {
    console.error("Reward issuance error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
