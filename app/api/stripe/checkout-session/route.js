import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const { bookingData, fillData, guestId } = await req.json();
  const { cabinPrice, numNights, startDate, endDate, cabinId } = bookingData;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `http://localhost:3000/cabins/thankyou`,
      cancel_url: `http://localhost:3000/cabins?id=${cabinId}`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Booking for Cabin ${cabinId}`,
              description: `From ${startDate} to ${endDate}, ${numNights} nights`,
            },
            unit_amount: cabinPrice * 100, // in cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        numGuests: fillData.numGuests,
        observations: fillData.observations || "None",
        cabinId,
        startDate,
        endDate,
        cabinPrice,
        numNights,
        guestId,
      },
    });
    return Response.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe Error", err.message);
    return new Response("Internal Server Error", { status: 500 });
  }
}
