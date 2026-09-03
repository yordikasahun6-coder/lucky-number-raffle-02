export type KnowledgeData = {
  ticketPrice: number;
  currency: string;
  drawDate: string | null;
  telegramUsername: string | null;
  totalPool: number;
  remaining: number;
  topPrize: string | null;
  prizeCount: number;
  paymentMethods: string[];
};

type Entry = {
  id: string;
  keywords: string[];
  getAnswer: (d: KnowledgeData) => string;
};

export const knowledgeBase: Entry[] = [
  {
    id: "price",
    keywords: [
      "price",
      "cost",
      "how much",
      "fee",
      "birr",
      "etb",
      "expensive",
      "cheap",
      "pricing",
      "rate",
    ],
    getAnswer: (d) =>
      `Each ticket costs ${d.ticketPrice} ${d.currency}. You can buy more than one at once — just submit another payment for more tickets.`,
  },
  {
    id: "how-to-buy",
    keywords: [
      "how do i buy",
      "how to buy",
      "how can i buy",
      "purchase",
      "get a ticket",
      "buy ticket",
      "how does this work",
      "how it works",
      "steps",
      "process",
      "getting started",
    ],
    getAnswer: (d) =>
      `Buying a ticket is simple:\n1. Choose a payment method and send ${d.ticketPrice} ${d.currency} per ticket\n2. Fill in your name, phone number, and attach your payment screenshot\n3. We review it (usually within a few hours) and notify you\n4. Once approved, you pick your lucky number!`,
  },
  {
    id: "payment-methods",
    keywords: [
      "payment method",
      "how to pay",
      "which bank",
      "pay with",
      "telebirr",
      "cbe",
      "transfer",
      "bank account",
      "mobile money",
      "pay via",
    ],
    getAnswer: (d) =>
      d.paymentMethods.length > 0
        ? `You can pay with: ${d.paymentMethods.join(", ")}. Tap "Send Your Payment" on the homepage to see the account details for each.`
        : `Payment methods are shown on the homepage under "Send Your Payment."`,
  },
  {
    id: "draw-date",
    keywords: [
      "draw date",
      "when is the draw",
      "when will you draw",
      "when do you announce",
      "winner announce",
      "when is the winner",
      "closing date",
      "deadline",
      "when does it end",
      "last day",
    ],
    getAnswer: (d) =>
      d.drawDate
        ? `The draw is scheduled for ${d.drawDate}. The winning number is drawn live and announced publicly.`
        : `The exact draw date hasn't been set yet — check back on the homepage, it'll show a countdown once it's announced.`,
  },
  {
    id: "prizes",
    keywords: [
      "prize",
      "win",
      "reward",
      "how much can i win",
      "grand prize",
      "what do i get",
      "jackpot",
    ],
    getAnswer: (d) =>
      d.topPrize
        ? `The top prize is ${d.topPrize}${d.prizeCount > 1 ? `, with ${d.prizeCount} prizes in total` : ""}. Check the "Prizes" section on the homepage for the full list.`
        : `Prize details are listed on the homepage — scroll down to see what's up for grabs.`,
  },
  {
    id: "availability",
    keywords: [
      "how many left",
      "tickets left",
      "sold out",
      "still available",
      "remaining",
      "any left",
      "still open",
    ],
    getAnswer: (d) =>
      d.remaining > 0
        ? `There are ${d.remaining} out of ${d.totalPool} tickets still available. The live progress bar on the homepage always shows the current count.`
        : `All ${d.totalPool} tickets have been claimed! The draw will happen soon — check the homepage for updates.`,
  },
  {
    id: "check-status",
    keywords: [
      "check my status",
      "am i approved",
      "did i get approved",
      "status",
      "check approval",
      "is my payment approved",
      "still pending",
      "how long approval",
      "waiting",
    ],
    getAnswer: () =>
      `Scroll down to "Check Your Status" on the homepage and enter your phone number — it'll show you exactly where things stand: pending, approved, or if something needs your attention.`,
  },
  {
    id: "multiple-tickets",
    keywords: [
      "more than one",
      "multiple tickets",
      "buy more",
      "several tickets",
      "many tickets",
      "5 tickets",
      "how many tickets can i buy",
      "second ticket",
      "another ticket",
      "buy again",
    ],
    getAnswer: (d) =>
      `Yes! Buy as many as you like. Each payment you submit gives you tickets to claim for that payment — submit another payment anytime for more.`,
  },
  {
    id: "refund",
    keywords: [
      "refund",
      "cancel",
      "money back",
      "return my ticket",
      "changed my mind",
      "cancel my order",
    ],
    getAnswer: (d) =>
      d.telegramUsername
        ? `For refunds, please reach out to us directly on Telegram — @${d.telegramUsername} — and we'll help sort it out.`
        : `For refunds, please contact us directly and we'll help sort it out.`,
  },
  {
    id: "legit",
    keywords: [
      "is this real",
      "is this legit",
      "is this a scam",
      "can i trust",
      "trustworthy",
      "safe",
      "fake",
      "legitimate",
      "genuine",
    ],
    getAnswer: () =>
      `Great question to ask! Every ticket is uniquely recorded, no two people can ever get the same number, the draw happens live and is announced publicly, and admin can't modify selected numbers. Check the "Trust & Transparency" section on the homepage for the full picture.`,
  },
  {
    id: "random-pick",
    keywords: [
      "random number",
      "pick for me",
      "choose for me",
      "lucky number",
      "don't know which number",
      "surprise me",
    ],
    getAnswer: () =>
      `No problem — once you're approved, there's a "Pick My Lucky Number" button that randomly picks an available number for you, with a fun reveal animation. Or you can browse and choose manually if you prefer.`,
  },
  {
    id: "choose-number",
    keywords: [
      "choose my own number",
      "pick my own",
      "specific number",
      "favorite number",
      "certain number",
      "search for a number",
    ],
    getAnswer: () =>
      `Absolutely — once you're approved, you can search for any specific number and pick it yourself if it's still available, or let the system pick a random one for you instead.`,
  },
  {
    id: "telegram",
    keywords: [
      "telegram",
      "message you",
      "chat with you",
      "contact",
      "reach you",
      "get in touch",
    ],
    getAnswer: (d) =>
      d.telegramUsername
        ? `You can reach us directly on Telegram: @${d.telegramUsername}`
        : `Contact details are on the homepage — look for the Telegram button or the Support Team section.`,
  },
  {
    id: "support-team",
    keywords: [
      "support team",
      "customer service",
      "who can i talk to",
      "human",
      "real person",
      "talk to someone",
    ],
    getAnswer: () =>
      `Scroll down to "Talk to our support team" on the homepage — you'll find real team members with their own Telegram, Instagram, WhatsApp, or email, whichever you prefer.`,
  },
  {
    id: "phone-format",
    keywords: [
      "phone number format",
      "wrong phone number",
      "invalid phone",
      "10 digit",
      "phone number error",
    ],
    getAnswer: () =>
      `Your phone number needs to be a valid 10-digit Ethiopian number, like 0912345678. If you're getting an error, double-check there's no extra digit or missing zero at the start.`,
  },
  {
    id: "no-screenshot",
    keywords: [
      "forgot screenshot",
      "no screenshot",
      "didn't attach",
      "upload later",
      "without screenshot",
      "lost my screenshot",
    ],
    getAnswer: () =>
      `That's okay — the screenshot is optional on the form. You can also just send it directly to us on Telegram instead, and we'll match it to your submission by your phone number.`,
  },
  {
    id: "reference-number",
    keywords: [
      "reference number",
      "transaction number",
      "where do i find reference",
      "confirmation number",
    ],
    getAnswer: () =>
      `The reference number is on your payment confirmation screenshot from your bank or mobile money app — you don't need to type it in yourself, just make sure it's visible in your screenshot.`,
  },
  {
    id: "how-win",
    keywords: [
      "how are winners selected",
      "how is the winner chosen",
      "how does the draw work",
      "random draw",
      "fair draw",
    ],
    getAnswer: () =>
      `The winning number is picked using a genuinely random draw, done live, and announced publicly to everyone who played — never chosen manually by anyone.`,
  },
  {
    id: "notification",
    keywords: [
      "how will i know",
      "will you notify me",
      "how do i get notified",
      "sms",
      "telegram notification",
      "will i be told",
    ],
    getAnswer: (d) =>
      d.telegramUsername
        ? `If you submitted through our Telegram bot, you'll be messaged directly the moment you're approved. Either way, you can always check "Check Your Status" on the homepage with your phone number.`
        : `You can always check your status on the homepage with your phone number to see if you've been approved.`,
  },
  {
    id: "language",
    keywords: [
      "language",
      "amharic",
      "oromo",
      "afaan oromo",
      "switch language",
      "change language",
    ],
    getAnswer: () =>
      `This site works in English, Amharic, and Afaan Oromo — use the language switcher at the top of the page to change it anytime.`,
  },
  {
    id: "download-ticket",
    keywords: [
      "download my ticket",
      "save my ticket",
      "ticket image",
      "proof of ticket",
      "print ticket",
    ],
    getAnswer: () =>
      `Once you've claimed all your tickets, you'll see a "Download Ticket" button on each one — it saves a proper ticket image with your number, name, and draw date on it.`,
  },
  {
    id: "greeting",
    keywords: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good evening",
      "yo",
      "sup",
    ],
    getAnswer: () =>
      `Hi there! 👋 I can help with ticket prices, how to buy, checking your status, prizes, the draw date, and more. What would you like to know?`,
  },
  {
    id: "thanks",
    keywords: ["thank you", "thanks", "appreciate", "cool", "great", "awesome"],
    getAnswer: () => `You're very welcome! Good luck with your ticket 🍀`,
  },
  {
    id: "goodbye",
    keywords: ["bye", "goodbye", "see you", "later"],
    getAnswer: () =>
      `Take care! Come back anytime if you have more questions. 🍀`,
  },
];

export function matchQuestion(input: string): Entry | null {
  const lower = input.toLowerCase().trim();
  let best: { entry: Entry; score: number } | null = null;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        // Longer, more specific phrase matches count more than short generic words
        score += kw.split(" ").length * 2;
      }
    }
    // Small bonus if the whole message is short and closely matches a keyword —
    // helps short queries like "price?" match confidently
    if (score > 0 && lower.length < 20) score += 1;

    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best?.entry || null;
}
