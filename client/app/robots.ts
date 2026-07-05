import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/ng/dashboard", "/ng/list", "/ng/verify", "/ng/admin", "/api/"],
      },
    ],
    sitemap: "https://mypropertyconnect.ng/sitemap.xml",
  };
}
