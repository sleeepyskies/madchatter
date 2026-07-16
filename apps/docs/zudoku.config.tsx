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
          icon: "bot",
          items: ["/introduction/overview"],
        },
        {
          type: "category",
          label: "Getting Started",
          icon: "rocket",
          items: [
              "/getting-started/system-requirments",
              "/getting-started/installation",
              "/getting-started/building",
          ],
        },
        {
          type: "category",
          label: "Administrator Guide",
          icon: "settings",
          items: [
            "/administrator-guide/agent-management",
            "/administrator-guide/knowledge-management",
            "/administrator-guide/project-management",
          ],
        },
        {
          type: "category",
          label: "Viewer Guide",
          icon: "eye",
          items: ["/viewer-guide/interaction-workflow"],
        },
      ],
    },
  ],
  redirects: [{ from: "/", to: "/introduction/overview" }],
  apis: [],
};

export default config;
