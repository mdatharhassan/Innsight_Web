import Stripe from "stripe";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export async function POST(req) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata;
    const bookingData = {
      cabinId: Number(metadata.cabinId),
      guestId: Number(metadata.guestId),
      startDate: new Date(metadata.startDate),
      endDate: new Date(metadata.endDate),
      numNights: Number(metadata.numNights),
      cabinPrice: Number(metadata.cabinPrice),
      numGuests: Number(metadata.numGuests),
    };
    const newBooking = {
      ...bookingData,
      observations: (metadata.observations || "").slice(0, 1000),
      extrasPrice: 0,
      totalPrice: bookingData.cabinPrice,
      isPaid: Boolean(true),
      hasBreakfast: false,
      status: "unconfirmed",
    };
    const { data, error } = await supabase
      .from("bookings")
      .insert([newBooking])
      .select();

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ received: true });
  }

  return NextResponse.json({ received: true });
}
