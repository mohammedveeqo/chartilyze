// convex/auth.config.ts

export default ({
  providers: [
    {
      domain: "https://moved-glowworm-14.clerk.accounts.dev", // Changed to match the 'iss' claim
      applicationID: "exciting-hedgehog-57",  // Matches the 'aud' claim
    },
  ],
});
