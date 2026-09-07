import { supabaseAdmin } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_TERMS = `Last updated: ${new Date().toLocaleDateString()}

1. HOW THIS WORKS
Lucky Ticket is a numbered raffle. Each ticket you purchase gives you one number between 1 and the total pool size shown on the homepage. Winners are selected by a genuinely random draw, conducted live, and announced publicly.

2. PAYMENT & APPROVAL
Payments are reviewed manually. Submitting a payment does not guarantee approval — we verify each payment against the reference number and screenshot provided. Approval is typically completed within a few hours, but may take longer.

3. TICKET NUMBERS
Once you confirm a ticket number, it is final. Numbers cannot be changed or swapped after confirmation. Each number can only ever be claimed by one person.

4. REFUNDS
Refunds for unclaimed tickets may be requested by contacting us directly. Once a number has been claimed, it generally cannot be refunded, though we will review individual cases on request.

5. PRIZES
Prize amounts shown are based on full ticket sales. If fewer tickets sell than the total pool, prize amounts may be adjusted proportionally, as noted on the homepage.

6. FAIRNESS
The winning number is selected using a random draw process and announced publicly. No individual, including our team, can select or influence the outcome.

7. YOUR INFORMATION
We collect your name, phone number, and payment details solely to process your ticket purchase and contact you about your submission or winnings. We do not sell your information to third parties.

8. ELIGIBILITY
Participants must be legally permitted to take part in a raffle of this kind under their local laws. It is your responsibility to confirm this before participating.

9. CONTACT
Questions about these terms? Reach out through our Support Team section on the homepage.`;

export default async function TermsPage() {
  const { data: settings } = await supabaseAdmin
    .from("app_settings")
    .select("terms_content")
    .limit(1)
    .single();
  const content = settings?.terms_content || DEFAULT_TERMS;

  return (
    <main className="min-h-screen bg-[#FBF8EF] px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <a
          href="/"
          className="text-[#0F5132] text-sm hover:underline mb-6 inline-block"
        >
          ← Back to home
        </a>

        <div className="ticket-stub px-6 py-8 sm:px-10 sm:py-10">
          <p className="[font-family:var(--font-mono)] text-[10px] tracking-widest text-[#E0A72E] uppercase mb-1">
            Legal
          </p>
          <h1 className="[font-family:var(--font-fraunces)] text-3xl font-bold text-[#14231C] mb-8">
            Terms & Privacy
          </h1>

          <div className="text-[#374151] text-sm leading-relaxed whitespace-pre-line">
            {content}
          </div>
        </div>
      </div>
    </main>
  );
}
