import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { createClient } from "@/utils/supabase/server";

export async function POST(request) {
  try {
    const { email, phone, comment, payement_id } = await request.json();

    // Validate required fields
    if (!email || !phone) {
      return NextResponse.json(
        { error: "Email and phone are required" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const user = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('payement_transferts')
      .insert([
        {
          email,
          phone,
          comment,
          user_id: user.data.user.id,
          payment_id: payement_id
        }
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({
      message: "Payment transfer created successfully",
      data: data
    });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({ message: "Hello World" });
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 510 }
    );
  }
}
