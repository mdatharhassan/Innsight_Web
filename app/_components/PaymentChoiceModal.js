"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import SubmitButton from "./SubmitButton";
import { createBooking } from "../_lib/actions";
import { useSession } from "next-auth/react";
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function PaymentChoiceModal({
  isOpen,
  onClose,
  bookingallData,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { data: session } = useSession();
  const { bookingData, fillData } = bookingallData;
  const handlePayNow = async () => {
    setIsLoading(true);
    const res = await fetch("/api/stripe/checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },

      body: JSON.stringify({
        bookingData,
        fillData,
        guestId: session?.user?.guestId,
      }),
    });

    if (!res.ok) {
      console.error("Stripe session error");
      setIsLoading(false);
      return;
    }
    const data = await res.json();
    const stripe = await stripePromise;
    stripe.redirectToCheckout({ sessionId: data.sessionId });
  };

  const handlePayOnArrival = async () => {
    try {
      const createBookingWithData = createBooking.bind(
        null,
        bookingallData.bookingData
      );
      await createBookingWithData(bookingallData.fillData);
      bookingallData.resetRange();
      onClose();
    } catch (err) {
      console.error("Booking failed: ", err);
    }
  };

  return (
    <div className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <div className="text-lg font-bold mb-4">Choose Payment Option</div>

          <button
            onClick={handlePayNow}
            className="bg-green-600 text-white px-4 py-2 rounded w-full mb-4 hover:bg-green-700"
          >
            Pay Now with Card
          </button>

          <button
            onClick={() => {
              console.log("Button Clicked");
              handlePayOnArrival();
            }}
            pendingLabel="Checking..."
            className="bg-gray-800 text-white px-4 py-2 rounded w-full hover:bg-gray-900"
          >
            Pay on Arrival
          </button>
        </div>
      </div>
    </div>
  );
}
