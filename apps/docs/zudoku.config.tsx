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
          items: ["/overview", "/system-workflow"],
        },
        {
          type: "category",
          label: "Getting Start",
          icon: "sparkles",
          items: ["/system-requirments"],
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
