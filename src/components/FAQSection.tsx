import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const faqs = [
  {
    q: "What is SportStock?",
    a: "SportStock is a fantasy sports exchange platform where you can buy and sell shares of real athletes. Share prices move based on athlete performance, allowing you to profit from your sports knowledge.",
  },
  {
    q: "How do athlete stock prices work?",
    a: "Athlete stock prices are determined by a combination of real-world performance metrics, market demand, and trading volume. Great performances drive prices up, while poor performances can cause prices to drop.",
  },
  {
    q: "Is my money safe on SportStock?",
    a: "Absolutely. We use bank-level encryption and secure payment processing. Your funds are held in segregated accounts and are fully protected.",
  },
  {
    q: "Can I withdraw my earnings at any time?",
    a: "Yes! You can withdraw your funds at any time. Withdrawals are typically processed within 1-2 business days directly to your bank account or preferred payment method.",
  },
  {
    q: "Which sports are available?",
    a: "Currently we support NBA, NFL, and MLB athletes, with plans to add soccer, hockey, and more sports in the near future.",
  },
  {
    q: "How do I get started?",
    a: "Simply sign up for a free account, deposit funds, and you can start trading immediately. We also offer a practice mode with virtual currency so you can learn the ropes risk-free.",
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="container relative z-10 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Got questions? We've got answers. If you can't find what you're looking for, reach out to our support team.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="rounded-xl border border-border bg-card/40 backdrop-blur-sm px-6 transition-all hover:bg-card/60 data-[state=open]:card-glow"
            >
              <AccordionTrigger className="text-foreground font-semibold hover:no-underline text-left">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <Button
            variant="outline"
            className="border-border text-foreground hover:bg-secondary"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Ask a Question
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
