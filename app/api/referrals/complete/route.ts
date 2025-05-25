import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createClient } from "@/lib/supabase/server"

// This route is called when a referred user completes a qualifying action
// (e.g., creates their first image, subscribes to a paid plan, etc.)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { referralId } = await req.json()

    if (!referralId) {
      return NextResponse.json({ error: "Referral ID is required" }, { status: 400 })
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

    // Check if the referral is already completed or rewarded
    if (referral.status !== "pending") {
      return NextResponse.json({ error: "Referral is already processed" }, { status: 400 })
    }

    // Update the referral status to completed
    const { error: updateError } = await supabase.from("referrals").update({ status: "completed" }).eq("id", referralId)

    if (updateError) {
      console.error("Error updating referral:", updateError)
      return NextResponse.json({ error: "Failed to update referral" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Referral marked as completed" })
  } catch (error) {
    console.error("Referral completion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
