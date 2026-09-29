import { InstallCommand } from "@/components/site/copy-button";
import { addCommand, registerCommand } from "@/lib/site";

/**
 * One command. @ecomcn is listed in the shadcn Registry Directory, so the CLI
 * looks the namespace up there on first use and writes it into the project's
 * components.json — which is also what lets a block's own `@ecomcn/…`
 * dependencies resolve. The explicit `registry add` stays one click away for
 * older CLIs and for anyone who wants the URL pinned in their own config.
 */
export function InstallSteps({ slug }: { slug: string }) {
  return (
    <div className="space-y-3">
      <InstallCommand command={addCommand(slug)} />
      <RegistryFallback />
    </div>
  );
}

/** The manual route, folded away: most people never need it. */
export function RegistryFallback({ className }: { className?: string }) {
  return (
    <details data-slot="registry-fallback" className={className}>
      <summary className="ec-eyebrow w-fit cursor-pointer text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        Older shadcn CLI, or want the registry pinned?
      </summary>
      <div className="mt-3 space-y-2">
        <p className="max-w-xl text-[12.5px] leading-relaxed text-muted-foreground">
          Register the namespace yourself, once per project, then run the same
          add command.{" "}
          <code className="ec-rule border px-1 py-px font-mono text-[11.5px] text-foreground">
            {"{name}"}
          </code>{" "}
          is literal — the CLI fills it in.
        </p>
        <InstallCommand command={registerCommand} />
      </div>
    </details>
  );
}
