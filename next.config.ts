import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  org: "techwisdom-technologies",
  project: "vocabvault",
  silent: true,
  widenClientFileUpload: true,
});
