"use client";

import * as React from "react";
import { CalendarClock, CreditCard, Landmark, Wallet } from "lucide-react";

import {
  AddressForm,
  useAddressForm,
  type Address,
  type AddressErrors,
} from "@/components/ecomcn/address-form";
import { DeliveryOptions, type DeliveryOption } from "@/components/ecomcn/delivery-options";
import { PaymentSelector, type PaymentMethod } from "@/components/ecomcn/payment-selector";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ControlBar, ControlLabel, Toggle } from "@/demos/controls";
import { emptyAddress, formatAddressLines, getAddressFormat, validateAddress } from "@/lib/address-format";

/**
 * Checkout-stage demos. Site code, not registry code: adopters get the
 * blocks, never this sample content.
 */

/** What an address search hands back: everything but the shopper's name. */
type Found = { label: string; address: Partial<Address> };

const FOUND: Found[] = [
  {
    label: "101 Market Street, San Francisco, CA",
    address: { country: "US", line1: "101 Market Street", line2: "", city: "San Francisco", region: "CA", postalCode: "94105" },
  },
  {
    label: "221B Baker Street, London",
    address: { country: "GB", line1: "221B Baker Street", line2: "", city: "London", region: "", postalCode: "NW1 6XE" },
  },
  {
    label: "12 MG Road, Bengaluru, Karnataka",
    address: { country: "IN", line1: "12 MG Road", line2: "Ashok Nagar", city: "Bengaluru", region: "KA", postalCode: "560001" },
  },
  {
    label: "1-1 Marunouchi, Chiyoda, Tokyo",
    address: { country: "JP", line1: "1-1 Marunouchi", line2: "", city: "Chiyoda-ku", region: "13", postalCode: "100-0005" },
  },
];

/**
 * A stand-in for Google Places or Loqate, mounted in the form's lookup slot.
 * It fills the form through the form's own hook.
 */
export function DemoAddressLookup() {
  const { setAddress, disabled } = useAddressForm();
  const id = React.useId();
  return (
    <Field>
      <FieldLabel htmlFor={id}>Find your address</FieldLabel>
      <Combobox
        items={FOUND}
        value={null}
        onValueChange={(found: Found | null) => found && setAddress(found.address)}
        itemToStringLabel={(found: Found) => found.label}
        disabled={disabled}
      >
        <ComboboxInput id={id} className="w-full" placeholder="Try “Market”, “Baker”, “MG” or “Marunouchi”" />
        <ComboboxContent>
          <ComboboxEmpty>None of the demo’s four addresses match.</ComboboxEmpty>
          <ComboboxList>
            {(found: Found) => (
              <ComboboxItem key={found.label} value={found}>
                {found.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>A demo search — pick one and it fills the fields below.</FieldDescription>
    </Field>
  );
}

/** Country name for a recap line, in the visitor's language. */
function countryName(code: string) {
  try {
    return new Intl.DisplayNames(undefined, { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

const QUICK = ["US", "GB", "IN", "JP", "DE"];

export function AddressFormDemo() {
  const [address, setAddress] = React.useState<Address>(() => ({ ...emptyAddress("US"), givenName: "Ada", familyName: "Lovelace" }));
  const [errors, setErrors] = React.useState<AddressErrors | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [company, setCompany] = React.useState(false);
  const [saveDefault, setSaveDefault] = React.useState(true);
  const [done, setDone] = React.useState<string[] | null>(null);
  const [log, setLog] = React.useState("validateAddress runs when you press Continue");

  const fields = React.useMemo(() => ({ organization: company ? ("optional" as const) : ("hidden" as const) }), [company]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const format = getAddressFormat(address.country, { fields });
    const found = validateAddress(address, format);
    const count = Object.keys(found).length;
    setErrors(found);
    if (count) {
      setDone(null);
      setLog(`validateAddress → ${count} ${count === 1 ? "error" : "errors"}`);
      return;
    }
    setLog("validateAddress → {} — on to delivery");
    setDone([...formatAddressLines(address, format), countryName(address.country)]);
  };

  return (
    <div>
      <ControlBar>
        <ControlLabel>Country</ControlLabel>
        {QUICK.map((code) => (
          <Toggle
            key={code}
            on={address.country === code}
            onClick={() => setAddress((a) => ({ ...a, country: code, region: "" }))}
          >
            {code}
          </Toggle>
        ))}
        <ControlLabel className="ml-3">Show</ControlLabel>
        <Toggle on={company} onClick={() => setCompany((c) => !c)}>
          Company
        </Toggle>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
        <span className="ml-auto max-w-full truncate font-mono text-[11.5px] text-muted-foreground sm:max-w-[45%]" aria-live="polite">
          {log}
        </span>
      </ControlBar>

      <form noValidate onSubmit={submit} className="mx-auto max-w-xl">
        <AddressForm
          value={address}
          onValueChange={(next) => {
            setAddress(next);
            setDone(null);
          }}
          errors={errors}
          fields={fields}
          loading={loading}
          lookup={<DemoAddressLookup />}
          saveAsDefault={saveDefault}
          onSaveAsDefaultChange={setSaveDefault}
        />
        <Button type="submit" size="lg" className="mt-8 w-full" disabled={loading}>
          Continue to delivery
        </Button>
        {done ? (
          <div className="mt-6 border-t pt-5 text-sm" aria-live="polite">
            <p className="ec-eyebrow mb-2 text-muted-foreground">Ship to</p>
            {done.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}
        <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
          Switch country and watch the fields follow: a state and ZIP code for
          the US, town and postcode for the UK, family name first for Japan.
          Clear a field and press Continue: the summary at the top links to
          each problem, and each error goes as soon as you edit its field.
        </p>
      </form>
    </div>
  );
}

/* ─── delivery-options ───────────────────────────────────────────────── */

/** Delivery methods as a store's rates API might return them. `subtotal` decides free standard delivery. */
export function demoDeliveryOptions(subtotal: number): DeliveryOption[] {
  return [
    {
      id: "standard",
      label: "Standard",
      price: subtotal >= 300 ? 0 : 18,
      minDays: 3,
      maxDays: 5,
      cutoffHour: 15,
      description: subtotal >= 300 ? "Free on orders over $300" : "Free on orders over $300 — tracked",
    },
    { id: "express", label: "Express", price: 25, minDays: 1, maxDays: 1, cutoffHour: 14, description: "Tracked, signed for" },
    { id: "collect", label: "Collect in store", price: 0, minDays: 2, maxDays: 3, description: "Atelier, 14 Rivington Street — we’ll text you" },
    {
      id: "courier",
      label: "Same-day courier",
      price: 35,
      minDays: 0,
      maxDays: 0,
      available: false,
      unavailableReason: "Not available for this postcode",
    },
  ];
}

export function DeliveryOptionsDemo() {
  const [value, setValue] = React.useState<string | null>("standard");
  const [loading, setLoading] = React.useState(false);
  const [none, setNone] = React.useState(false);
  const [subtotal, setSubtotal] = React.useState(720);
  return (
    <div>
      <ControlBar>
        <ControlLabel>Bag</ControlLabel>
        <Toggle on={subtotal >= 300} onClick={() => setSubtotal(720)}>
          $720
        </Toggle>
        <Toggle on={subtotal < 300} onClick={() => setSubtotal(140)}>
          $140
        </Toggle>
        <ControlLabel className="ml-3">Rates</ControlLabel>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
        <Toggle on={none} onClick={() => setNone((n) => !n)}>
          None
        </Toggle>
      </ControlBar>
      <div className="mx-auto max-w-xl">
        <DeliveryOptions
          options={none ? [] : demoDeliveryOptions(subtotal)}
          value={value}
          onValueChange={setValue}
          loading={loading}
        />
        <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
          The dates are worked out on your clock: business days from dispatch,
          and dispatch is today only before the cut-off — the chosen method
          counts down to it. Switch the bag to $140 and Standard stops being
          free. The courier can&rsquo;t reach this address, and says so.
        </p>
      </div>
    </div>
  );
}

/* ─── payment-selector ───────────────────────────────────────────────── */

const subscribeNothing = () => () => {};

/** Apple Pay exists only in Safari on Apple devices — checked in the browser, after hydration. */
function useApplePay() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => typeof window !== "undefined" && "ApplePaySession" in window,
    () => false,
  );
}

export function useDemoPaymentMethods(): PaymentMethod[] {
  const applePay = useApplePay();
  return React.useMemo(
    () => [
      {
        id: "card",
        label: "Card",
        kind: "card",
        description: "Visa, Mastercard, American Express",
        icon: <CreditCard className="size-5" />,
      },
      {
        id: "apple-pay",
        label: "Apple Pay",
        kind: "wallet",
        icon: <Wallet className="size-5" />,
        available: applePay,
        unavailableReason: "Needs Safari on an Apple device",
      },
      {
        id: "pay-in-3",
        label: "Pay in 3",
        kind: "bnpl",
        instalments: 3,
        description: "Interest-free, a payment a month",
        icon: <CalendarClock className="size-5" />,
      },
      {
        id: "bank",
        label: "Bank transfer",
        kind: "bank",
        description: "Pay from your banking app",
        icon: <Landmark className="size-5" />,
      },
    ],
    [applePay],
  );
}

/**
 * Stands in for a provider's hosted fields. A real store mounts Stripe's
 * Payment Element or Adyen's Drop-in here; this takes no card details at
 * all — only a name, to show the panel keeps what was typed.
 */
export function DemoProviderPanel({ method }: { method: PaymentMethod }) {
  const nameId = React.useId();
  const bankId = React.useId();
  if (method.id === "card") {
    return (
      <div className="ec-rule border border-dashed bg-background p-4">
        <p className="ec-eyebrow mb-3 text-muted-foreground">Your payment provider&rsquo;s fields</p>
        <label htmlFor={nameId} className="mb-1.5 block text-sm">
          Name on card
        </label>
        <Input id={nameId} autoComplete="cc-name" placeholder="Type, then pick another method and come back" />
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
          Card number, expiry and CVC live in the provider&rsquo;s iframe, never
          in your page. This demo asks for none of them.
        </p>
      </div>
    );
  }
  if (method.id === "bank") {
    return (
      <div className="ec-rule border border-dashed bg-background p-4">
        <label htmlFor={bankId} className="mb-1.5 block text-sm">
          Your bank
        </label>
        <select
          id={bankId}
          className="ec-rule h-9 w-full border bg-background px-2 text-sm"
          defaultValue="northwind"
        >
          <option value="northwind">Northwind Bank</option>
          <option value="contoso">Contoso Bank</option>
          <option value="fabrikam">Fabrikam Savings</option>
        </select>
        <p className="mt-3 text-[12.5px] leading-relaxed text-muted-foreground">
          The arrow keys work in this list: it sits outside the radio group,
          so they never jump to another method.
        </p>
      </div>
    );
  }
  if (method.kind === "bnpl") {
    return (
      <p className="text-[13px] leading-relaxed text-muted-foreground">
        You&rsquo;ll confirm the plan with the provider after pressing Pay.
      </p>
    );
  }
  return null;
}

export function PaymentSelectorDemo() {
  const methods = useDemoPaymentMethods();
  const [value, setValue] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [declines, setDeclines] = React.useState(false);
  const [none, setNone] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [paying, setPaying] = React.useState(false);
  const [log, setLog] = React.useState("choose a method, then Pay");
  const total = 777.6;

  const pay = async () => {
    if (!value) {
      setLog("nothing chosen yet");
      return;
    }
    setPaying(true);
    setError(null);
    await new Promise((resolve) => window.setTimeout(resolve, 700));
    setPaying(false);
    if (declines) {
      setError("Your payment was declined. Try another card or method.");
      setLog(`${value} → declined`);
    } else {
      setLog(`${value} → paid`);
    }
  };

  return (
    <div>
      <ControlBar>
        <ControlLabel>Next payment</ControlLabel>
        <Toggle on={!declines} onClick={() => setDeclines(false)}>
          Approved
        </Toggle>
        <Toggle on={declines} onClick={() => setDeclines(true)}>
          Declined
        </Toggle>
        <ControlLabel className="ml-3">Methods</ControlLabel>
        <Toggle on={loading} onClick={() => setLoading((l) => !l)}>
          Loading
        </Toggle>
        <Toggle on={none} onClick={() => setNone((n) => !n)}>
          None
        </Toggle>
        <span className="ml-auto max-w-full truncate font-mono text-[11.5px] text-muted-foreground sm:max-w-[40%]" aria-live="polite">
          {log}
        </span>
      </ControlBar>
      <div className="mx-auto max-w-xl">
        <PaymentSelector
          methods={none ? [] : methods}
          value={value}
          onValueChange={(id) => {
            setValue(id);
            setError(null);
          }}
          renderPanel={(method) => <DemoProviderPanel method={method} />}
          total={total}
          error={error}
          loading={loading}
          disabled={paying}
        />
        <Button size="lg" className="mt-6 h-12 w-full text-[13px] tracking-[0.14em] uppercase" onClick={pay} disabled={paying || loading}>
          {paying ? "Paying…" : "Pay $777.60"}
        </Button>
        <p className="mt-6 text-[12.5px] leading-relaxed text-muted-foreground">
          Type a name in the card panel, choose Pay in 3, then come back: the
          panel was hidden, not destroyed, so the name is still there — the
          same keeps a provider&rsquo;s iframe from losing a half-typed card.
          Apple Pay is offered only where it works, and says why otherwise.
          Set the next payment to decline and press Pay.
        </p>
      </div>
    </div>
  );
}
