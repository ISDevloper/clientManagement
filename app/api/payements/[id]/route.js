import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function GET(request, { params }) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { id } = params;

    const { data: payments, error } = await supabase
      .from("payements")
      .select(
        `*,
        payement_reminder(*,
        profiles(*)
        )
      `
      )
      .eq("assined_to", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log(error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(payments);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 510 }
    );
  }
}
