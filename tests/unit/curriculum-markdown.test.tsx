import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { CurriculumMarkdown } from "@/features/curriculum/components/curriculum-markdown";

describe("CurriculumMarkdown", () => {
  it("renders the supported curriculum structure", () => {
    const html = renderToStaticMarkup(
      <CurriculumMarkdown>{"## Насока\n\n- Еден\n- **Два**\n\n[Извор](https://example.com)"}</CurriculumMarkdown>,
    );

    expect(html).toContain("<h3");
    expect(html).toContain("<ul");
    expect(html).toContain("<strong");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noreferrer noopener"');
  });

  it("does not render raw HTML or unsafe link protocols", () => {
    const html = renderToStaticMarkup(
      <CurriculumMarkdown>
        {'<script>alert("x")</script>\n\n<img src=x onerror=alert(1)>\n\n[опасно](javascript:alert(1))'}
      </CurriculumMarkdown>,
    );

    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("javascript:");
  });
});
