// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: {
              boxShadow: "none",
              backgroundColor: "#1a1f2e",
              borderRadius: "12px",
              border: "1px solid #2d3548",
            },
            headerTitle: {
              fontSize: "24px",
              color: "#ffffff",
              textAlign: "center",
            },
            headerSubtitle: {
              color: "#94a3b8",
              textAlign: "center",
            },
            socialButtonsBlockButton: {
              backgroundColor: "#2d3548",
              border: "1px solid #404c6a",
              color: "#ffffff",
              fontSize: "15px",
            },
            socialButtonsBlockButtonText: {
              color: "#ffffff",
              fontWeight: "500",
            },
            dividerLine: {
              backgroundColor: "#2d3548",
            },
            dividerText: {
              color: "#64748b",
            },
            formFieldLabel: {
              color: "#94a3b8",
              fontSize: "14px",
            },
            formFieldInput: {
              backgroundColor: "#1e2538",
              border: "1px solid #2d3548",
              color: "#ffffff",
              fontSize: "15px",
            },
            formButtonPrimary: {
              backgroundColor: "#3b82f6",
              color: "#ffffff",
              fontSize: "15px",
              fontWeight: "500",
            },
            footerActionLink: {
              color: "#60a5fa",
              fontSize: "14px",
            },
            footer: {
              color: "#94a3b8",
              fontSize: "14px",
            }
          },
          layout: {
            socialButtonsPlacement: "top",
            socialButtonsVariant: "blockButton",
            privacyPageUrl: "/privacy",
            termsPageUrl: "/terms",
          },
        }}
      />
    </div>
  );
}
