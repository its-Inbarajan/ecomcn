"use client";

import * as React from "react";

import { OrderConfirmation, type OrderConfirmationData } from "@/components/ecomcn/order-confirmation";
import { OrderTracking, type TrackingEvent } from "@/components/ecomcn/order-tracking";
import { buttonVariants } from "@/components/ui/button";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import { PRODUCTS } from "@/demos/listing-data";

/**
 * Post-purchase demos. Site code, not registry code: adopters get the
 * blocks, never this sample content.
 */

const boot = PRODUCTS[3];
const lamp = PRODUCTS[1];

export const DEMO_ORDER: OrderConfirmationData = {
  number: "ATL-77760",
  placedAt: "2026-10-19T14:32:00Z",
  email: "ada@example.com",
  lines: [
    { id: "boot", name: boot.name, variant: "Tan · EU 42", quantity: 1, unitPrice: boot.price, image: boot.image },
    { id: "lamp", name: lamp.name, variant: "Chalk", quantity: 1, unitPrice: lamp.price, image: lamp.image },
  ],
  totals: { subtotal: boot.price + lamp.price, shipping: 0, tax: (boot.price + lamp.price) * 0.08, total: (boot.price + lamp.price) * 1.08 },
  shipTo: ["Ada Lovelace", "101 Market Street", "San Francisco, California 94105", "United States"],
  delivery: { label: "Standard", from: "2026-10-22", to: "2026-10-26" },
  payment: "Visa ending 4242",
};

export function OrderConfirmationDemo() {
  const [loading, setLoading] = React.useState(false);
  return (
    <div>
      <ControlBar>
        <ControlLabel>Order</ControlLabel>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
      </ControlBar>
      <div className="mx-auto max-w-4xl">
        <OrderConfirmation
          order={DEMO_ORDER}
          loading={loading}
          title="Thank you, Ada."
          permalink="https://ecomcn.vercel.app/demo/orders/ATL-77760?t=8f3c"
          actions={
            <a href="#" className={buttonVariants()}>
              Continue shopping
            </a>
          }
        />
        <p className="mt-8 text-[12.5px] leading-relaxed text-muted-foreground">
          Press Print receipt: the band, the buttons and the colour go, and the
          link is written out — a receipt that survives being printed. Copy the
          order link: the label turns over while the link goes to your
          clipboard.
        </p>
      </div>
    </div>
  );
}

/* ─── order-tracking ─────────────────────────────────────────────────── */

/** A parcel's carrier updates, in the order they happened. */
const JOURNEY: TrackingEvent[] = [
  { id: "e1", status: "ordered", at: "2026-10-19T14:32:00Z", description: "Order placed" },
  { id: "e2", status: "dispatched", at: "2026-10-20T10:05:00Z", description: "Handed to the carrier", location: "Leipzig, DE" },
  { id: "e3", status: "in-transit", at: "2026-10-20T22:40:00Z", description: "Departed facility", location: "Leipzig, DE" },
  { id: "e4", status: "in-transit", at: "2026-10-21T16:15:00Z", description: "Arrived at facility", location: "Louisville, KY" },
  { id: "e5", status: "out-for-delivery", at: "2026-10-22T07:20:00Z", description: "Out for delivery", location: "San Francisco, CA" },
  { id: "e6", status: "exception", at: "2026-10-22T13:48:00Z", description: "Delivery attempted — no one home. We'll try again tomorrow.", location: "San Francisco, CA" },
  { id: "e7", status: "delivered", at: "2026-10-23T11:02:00Z", description: "Delivered — left with the front desk", location: "San Francisco, CA" },
];

/** The order the webhooks arrive in: not the order things happened, and e3 twice. */
const ARRIVALS = ["e1", "e3", "e2", "e3", "e5", "e4", "e6", "e7"];

export function OrderTrackingDemo() {
  const [received, setReceived] = React.useState(2);
  const [loading, setLoading] = React.useState(false);
  const events = ARRIVALS.slice(0, received).map((id) => JOURNEY.find((e) => e.id === id)!);
  const next = ARRIVALS[received];
  const late = next && JOURNEY.findIndex((e) => e.id === next) < Math.max(...ARRIVALS.slice(0, received).map((id) => JOURNEY.findIndex((e) => e.id === id)));
  const repeat = next && ARRIVALS.slice(0, received).includes(next);

  return (
    <div>
      <ControlBar>
        <ControlLabel>Carrier</ControlLabel>
        <button
          type="button"
          onClick={() => setReceived((n) => Math.min(ARRIVALS.length, n + 1))}
          disabled={!next}
          className="ec-eyebrow ec-rule border bg-primary px-2.5 py-1.5 text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Send next webhook
        </button>
        <button
          type="button"
          onClick={() => setReceived(0)}
          className="ec-eyebrow ml-1 px-2 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          Reset
        </button>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
        <span className="ml-auto max-w-full truncate font-mono text-[11.5px] text-muted-foreground sm:max-w-[45%]" aria-live="polite">
          {next ? `next: ${next}${repeat ? " (a repeat)" : late ? " (late — older than one already shown)" : ""}` : "all webhooks sent"}
        </span>
      </ControlBar>
      <div className="mx-auto max-w-xl">
        <OrderTracking
          events={events}
          loading={loading}
          carrier={{ name: "UPS", trackingNumber: "1Z 999 AA1 01 2345 6784", url: "https://www.ups.com/track" }}
          estimate={{ from: "2026-10-22", to: "2026-10-26" }}
        />
        <p className="mt-8 text-[12.5px] leading-relaxed text-muted-foreground">
          Send the webhooks one at a time. They arrive out of order and one
          comes twice, but the timeline only moves forward in event time: a
          late, older scan slots into the log where it belongs, and the repeat
          shows once. The failed attempt turns the chip to Needs attention
          until the parcel is delivered.
        </p>
      </div>
    </div>
  );
}
