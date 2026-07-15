import type { ZudokuConfig } from "zudoku";

const config: ZudokuConfig = {
  site: {
    logo: {
      src: { light: "/logo.png", dark: "/logo.png" },
      alt: "Mad Chatter",
      width: "40px",
    },
  },
  navigation: [
    {
      type: "category",
      label: "Documentation",
      items: [
        {
          type: "category",
          label: "Introduction",
          icon: "sparkles",
          items: ["/introduction/overview", "/introduction/system-workflow"],
        },
        {
          type: "category",
          label: "Getting Start",
          icon: "sparkles",
          items: ["/getting-start/system-requirments"],
        },
        {
          type: "category",
          label: "Administrator Guide",
          icon: "sparkles",
          items: [
            "/administrator-guide/agent-management",
            "/administrator-guide/knowledge-management",
            "/administrator-guide/project-management",
          ],
        },
      ],
    },
    {
      type: "link",
      to: "/api",
      label: "API Reference",
    },
  ],
  redirects: [{ from: "/", to: "/introduction" }],
  apis: [],
};

export default config;
