import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <>
      <PageHeader kicker="Legal" title="Privacy" accent="in plain words." tone="paper" />
      <Prose>
        <h2>What we collect</h2>
        <ul>
          <li>
            <b>Saved events</b> live in your browser’s local storage on your device. We never receive them.
          </li>
          <li>
            <b>Submissions</b> (event suggestions and corrections) include what you type, any links or files you attach, and — only if you choose — your email address.
          </li>
          <li>
            <b>Standard server logs</b> from our hosting provider, kept for security and reliability.
          </li>
        </ul>
        <h2>How we use it</h2>
        <p>Submissions are reviewed by moderators to update listings. Your email is used only to ask a follow-up question about your submission, and is never shown publicly or sold.</p>
        <h2>Evidence files</h2>
        <p>Uploaded files are stored privately and are visible only to moderators. They are deleted once they’re no longer needed to support a listing.</p>
        <h2>Your choices</h2>
        <p>You can ask us to delete a submission or your email at any time by writing to us from the address you used.</p>
      </Prose>
    </>
  );
}
