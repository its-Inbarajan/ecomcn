"use client";

import * as React from "react";

import { CartLineItem, type CartLine } from "@/components/ecomcn/cart-line-item";
import { CartSheet } from "@/components/ecomcn/cart-sheet";
import { CheckoutStepper, type CheckoutStep } from "@/components/ecomcn/checkout-stepper";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import { PRODUCTS } from "@/demos/listing-data";

/**
 * Cart-stage demos. Site code, not registry code: adopters get the blocks,
 * never this sample content.
 */

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

/** Three catalogue products as bag lines, photos included. */
const START: CartLine[] = [
  { ...lineFrom(0), quantity: 1, variant: "Chalk", maxQuantity: 4 },
  { ...lineFrom(3), quantity: 1, variant: "Tan · EU 42", maxQuantity: 2 },
  { ...lineFrom(2), quantity: 2, variant: "Terracotta" },
];

function lineFrom(index: number): Omit<CartLine, "quantity"> {
  const p = PRODUCTS[index];
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    href: "#",
    image: p.image,
    unitPrice: p.price,
    compareAt: p.compareAt,
  };
}

/** A bag that answers after a moment — and, when asked, refuses. */
function useDemoBag() {
  const [lines, setLines] = React.useState(START);
  const [fail, setFail] = React.useState(false);
  const [log, setLog] = React.useState<string[]>([]);
  const note = (entry: string) => setLog((l) => [entry, ...l].slice(0, 4));

  const settle = async (entry: string) => {
    await wait(500);
    if (fail) {
      note(`${entry} — refused, rolled back`);
      throw new Error("Network");
    }
    note(entry);
  };

  return {
    lines,
    fail,
    setFail,
    log,
    reset: () => {
      setLines(START);
      setLog([]);
    },
    onQuantityChange: async (id: string, quantity: number) => {
      await settle(`quantity ${id} → ${quantity}`);
      setLines((current) => current.map((l) => (l.id === id ? { ...l, quantity } : l)));
    },
    onRemove: async (id: string) => {
      await settle(`removed ${id}`);
      setLines((current) => current.filter((l) => l.id !== id));
    },
    onSaveForLater: async (id: string) => {
      await settle(`saved ${id} for later`);
      setLines((current) => current.filter((l) => l.id !== id));
    },
  };
}

function Controls({ bag }: { bag: ReturnType<typeof useDemoBag> }) {
  return (
    <ControlBar>
      <ControlLabel>Next change</ControlLabel>
      <Toggle on={!bag.fail} onClick={() => bag.setFail(false)}>
        Succeeds
      </Toggle>
      <Toggle on={bag.fail} onClick={() => bag.setFail(true)}>
        Fails
      </Toggle>
      <button
        type="button"
        onClick={bag.reset}
        className="ec-eyebrow ml-2 px-2 py-1.5 text-muted-foreground underline underline-offset-4 hover:text-foreground"
      >
        Reset
      </button>
      <span className="ml-auto max-w-[50%] truncate font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
        {bag.log[0] ?? "the cart API's calls appear here"}
      </span>
    </ControlBar>
  );
}

/* ─── cart-line-item ─────────────────────────────────────────────────── */

export function CartLineItemDemo() {
  const bag = useDemoBag();
  return (
    <div>
      <Controls bag={bag} />
      <div className="mx-auto max-w-2xl sm:min-h-[34rem]">
        <ul className="border-t">
          {bag.lines.map((line) => (
            <CartLineItem
              key={line.id}
              line={line}
              onQuantityChange={(q) => bag.onQuantityChange(line.id, q)}
              onRemove={() => bag.onRemove(line.id)}
              onSaveForLater={() => bag.onSaveForLater(line.id)}
            />
          ))}
        </ul>
        {bag.lines.length === 0 ? <p className="py-8 text-sm text-muted-foreground">All gone — press Reset.</p> : null}
        <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
          Press + a few times: the total follows at once, and the cart hears
          once, after you stop. Remove a line: it folds into an undo bar and
          the cart hears in five seconds — unless you undo. Set the next change
          to fail and the line puts itself back.
        </p>
      </div>
    </div>
  );
}

/* ─── cart-sheet ─────────────────────────────────────────────────────── */

export function CartSheetDemo() {
  const bag = useDemoBag();
  return (
    <div>
      <Controls bag={bag} />
      <div className="flex min-h-[20rem] flex-col items-end gap-6 sm:min-h-[28rem]">
        <div className="flex w-full items-center justify-between border-b pb-4">
          <span className="ec-display text-3xl">Atelier</span>
          <CartSheet
            lines={bag.lines}
            onQuantityChange={bag.onQuantityChange}
            onRemove={bag.onRemove}
            onSaveForLater={bag.onSaveForLater}
            freeShippingThreshold={1000}
            viewBagHref="#"
            empty={
              <a href="#" className="text-sm underline underline-offset-4">
                Continue shopping
              </a>
            }
          />
        </div>
        <p className="max-w-md self-start text-[12.5px] leading-relaxed text-muted-foreground">
          Open the bag: the sheet grows out of the button and folds back into
          it, and focus returns there when it closes. Change a quantity or
          remove a line — the subtotal and the count on the button follow at
          once, and the line keeps its undo while the cart catches up.
        </p>
      </div>
    </div>
  );
}

/* ─── checkout-stepper ───────────────────────────────────────────────── */

const STEPS: CheckoutStep[] = [
  { id: "bag", label: "Bag" },
  { id: "details", label: "Details" },
  { id: "delivery", label: "Delivery" },
  { id: "payment", label: "Payment" },
];

export function CheckoutStepperDemo() {
  const [step, setStep] = React.useState("delivery");
  const index = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="mx-auto max-w-3xl">
      <CheckoutStepper steps={STEPS} value={step} onValueChange={setStep} />
      <div className="mt-8 flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setStep(STEPS[index - 1].id)}
          className="ec-eyebrow border px-4 py-2.5 transition-colors hover:bg-secondary disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          disabled={index === STEPS.length - 1}
          onClick={() => setStep(STEPS[index + 1].id)}
          className="ec-eyebrow bg-foreground px-4 py-2.5 text-background transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          Continue
        </button>
      </div>
      <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
        Continue, and the rule under the current step slides on. Done steps
        carry a check and go back when pressed; steps still to come do
        nothing, so checkout can&apos;t be skipped ahead.
      </p>
    </div>
  );
}
