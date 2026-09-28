import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/PageHeader";
import { Prose } from "@/components/layout/Prose";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <>
      <PageHeader kicker="Legal" title="Terms" accent="of use." tone="paper" />
      <Prose>
        <h2>A guide, not a seller</h2>
        <p>Navratri NCR lists events organized by others. We don’t sell tickets, handle payments or run events. Bookings happen on the organizer’s or ticketing partner’s site under their terms.</p>
        <h2>Accuracy</h2>
        <p>We check details against primary sources and show when each listing was last checked, but events change. Always confirm with the organizer before you travel.</p>
        <h2>Submissions</h2>
        <p>By sending a suggestion or correction you confirm it’s accurate to the best of your knowledge and that you have the right to share any files you attach. We may edit or decline submissions.</p>
        <h2>Content</h2>
        <p>Event names and trademarks belong to their owners. Original artwork on this site is ours; photographs are shown with permission and credit.</p>
      </Prose>
    </>
  );
}
