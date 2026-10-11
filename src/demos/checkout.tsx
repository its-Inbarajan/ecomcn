"use client";

import * as React from "react";

import {
  AddressForm,
  useAddressForm,
  type Address,
  type AddressErrors,
} from "@/components/ecomcn/address-form";
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
