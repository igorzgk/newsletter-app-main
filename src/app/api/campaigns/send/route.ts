import Template from "@/components/Emails/Template";
import { resend } from "@/lib/resend";
import { supabaseAdmin } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();

  if (!id) return NextResponse.json({ error: 'Missing campaign ID' });

  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .delete()
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message });

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const { campaign, email: emailData } = body;

  try {
    if (!campaign || !emailData) return NextResponse.json({ error: 'Missing campaign or email' });

    let subscribersMapped: string[] = [];

    if (campaign.list_id) {
      // Fetch the specific list of subscribers
      const { data: subscribers, error } = await supabaseAdmin
        .from('subscribers')
        .select('*')
        .eq('id', campaign.list_id);

      if (error) throw error;

      subscribersMapped = subscribers?.map(({ email }) => email) || [];
    } else {
      // Fetch all subscribers
      const { data: subscribers, error } = await supabaseAdmin
        .from('subscribers')
        .select('*');

      if (error) throw error;

      subscribersMapped = subscribers?.map(({ email }) => email) || [];
    }

    const promises = subscribersMapped
      .map((to: string) => {
        return resend.emails.send({
          from: campaign.from,
          to,
          subject: campaign.subject,
          react: Template({ content: emailData.content })
        });
      });

    const { data: campaignSaved } = await supabaseAdmin
      .from("campaigns")
      .upsert({ id: campaign.id, status: 'Sent' })
      .select();

    if (campaignSaved) console.log(campaignSaved);

    const responses = await Promise.all(promises);

    return NextResponse.json({
      status: 200,
      responses
    });
  } catch (error) {
    return NextResponse.json({ error: error, status: 400 });
  }
}