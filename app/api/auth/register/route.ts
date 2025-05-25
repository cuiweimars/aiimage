import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, referralCode } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Create Supabase client
    const supabase = createClient()

    // Check if user already exists
    const { data: existingUser } = await supabase.from("users").select().eq("email", email).single()

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 409 })
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Find referrer if referral code is provided
    let referrerId = null
    if (referralCode) {
      const { data: referralData } = await supabase
        .from("referral_codes")
        .select("user_id")
        .eq("code", referralCode)
        .single()

      if (referralData) {
        referrerId = referralData.user_id
      }
    }

    // Create user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        name,
        email,
        password: hashedPassword,
        referred_by: referrerId
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ message: "Failed to create user" }, { status: 500 })
    }

    // If user was referred, create a referral record
    if (referrerId && newUser) {
      const { error: referralError } = await supabase.from("referrals").insert({
        referrer_id: referrerId,
        referred_id: newUser.id,
        status: "pending" // Will be updated to "completed" when user completes certain actions
      })

      if (referralError) {
        console.error("Error creating referral record:", referralError)
        // Continue with registration even if referral record creation fails
      }
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
