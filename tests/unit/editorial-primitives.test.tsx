import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProofArtifact } from "@/components/ui/proof-artifact";
import { SectionHeading } from "@/components/ui/section-heading";
import { StatusMarker } from "@/components/ui/status-marker";

describe("editorial proof primitives", () => {
  it("exposes the selected proof variant without changing article semantics", () => {
    const html = renderToStaticMarkup(
      <ProofArtifact label="Evidence snapshot" variant="acid">
        <h3>Јавен preview</h3>
        <p>https://example.com</p>
      </ProofArtifact>,
    );

    expect(html).toContain("<article");
    expect(html).toContain('data-proof-variant="acid"');
    expect(html).toContain("Evidence snapshot");
    expect(html).toContain("Јавен preview");
  });

  it("keeps status meaning available as text and semantic metadata", () => {
    const html = renderToStaticMarkup(
      <StatusMarker label="Одобрено" tone="approved" />,
    );

    expect(html).toContain('data-status-tone="approved"');
    expect(html).toContain("Одобрено");
  });

  it("renders section hierarchy with an addressable heading", () => {
    const html = renderToStaticMarkup(
      <SectionHeading
        id="mechanism-heading"
        eyebrow="Механизам"
        title="Доказ, па одлука."
        description="Секој чекор има јасен крај."
      />,
    );

    expect(html).toContain('id="mechanism-heading"');
    expect(html).toContain("<h2");
    expect(html).toContain("Доказ, па одлука.");
  });
});
