import { InstallCommand } from "@/components/site/copy-button";
import { addCommand, registerCommand } from "@/lib/site";

/**
 * Two steps, not one. The CLI never registers a registry on its own, so a
 * block whose dependencies are namespaced cannot install from a bare command
 * until the namespace exists in the project's components.json.
 */
export function InstallSteps({
  slug,
  needsNamespace,
}: {
  slug: string;
  /** True when the block pulls another @ecomcn item. */
  needsNamespace?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="ec-eyebrow mb-2 flex flex-wrap items-baseline gap-x-2 text-muted-foreground">
          <span className="text-brand">Step 1</span>
          Register the namespace — once per project
        </p>
        <InstallCommand command={registerCommand} />
      </div>

      <div>
        <p className="ec-eyebrow mb-2 flex flex-wrap items-baseline gap-x-2 text-muted-foreground">
          <span className="text-brand">Step 2</span>
          Add the block
        </p>
        <InstallCommand command={addCommand(slug)} />
      </div>

      {needsNamespace ? (
        <p className="text-[12.5px] leading-relaxed text-muted-foreground">
          Step 1 is not optional for this one — it pulls another ecomcn block,
          and the CLI has no way to resolve{" "}
          <code className="ec-rule border px-1 py-px font-mono text-[11.5px] text-foreground">
            @ecomcn/…
          </code>{" "}
          until the namespace is registered.
        </p>
      ) : null}
    </div>
  );
}
