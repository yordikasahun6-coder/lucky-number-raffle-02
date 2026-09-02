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
    ],
    getAnswer: (d) =>
      d.drawDate
        ? `The draw is scheduled for ${d.drawDate}. The winning number is drawn live and announced publicly.`
        : `The exact draw date hasn't been set yet — check back on the homepage, it'll show a countdown once it's announced.`,
  },
  {
    id: "prizes",
    keywords: ["prize", "win", "reward", "how much can i win", "grand prize"],
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
    ],
    getAnswer: () =>
      `No problem — once you're approved, there's a "Pick My Lucky Number" button that randomly picks an available number for you, with a fun reveal animation. Or you can browse and choose manually if you prefer.`,
  },
  {
    id: "telegram",
    keywords: ["telegram", "message you", "chat with you", "contact"],
    getAnswer: (d) =>
      d.telegramUsername
        ? `You can reach us directly on Telegram: @${d.telegramUsername}`
        : `Contact details are on the homepage — look for the Telegram button.`,
  },
  {
    id: "greeting",
    keywords: ["hi", "hello", "hey", "good morning", "good evening"],
    getAnswer: () =>
      `Hi there! 👋 I can help with ticket prices, how to buy, checking your status, prizes, the draw date, and more. What would you like to know?`,
  },
  {
    id: "thanks",
    keywords: ["thank you", "thanks", "appreciate"],
    getAnswer: () => `You're very welcome! Good luck with your ticket 🍀`,
  },
];

export function matchQuestion(input: string): Entry | null {
  const lower = input.toLowerCase();
  let best: { entry: Entry; score: number } | null = null;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) score += kw.split(" ").length; // longer phrase matches count more
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { entry, score };
    }
  }

  return best?.entry || null;
}
