import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { getDashboardData } from "@/lib/dashboard-data";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "No autorizado" },
        { status: 401 }
      );
    }

    const data = await getDashboardData(user.id);

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
