import { Button } from "@/components/ui/button";
import { Gift, ArrowRight } from "lucide-react";

const ReferralCTA = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="relative overflow-hidden rounded-3xl gradient-pink-purple p-8 sm:p-12 text-center">
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-sport-cyan/20 blur-[100px]" />
          
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-primary-foreground/20 backdrop-blur-sm mb-6">
              <Gift className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-foreground mb-4">
              Invite Friends, Get Free Stock
            </h2>
            <p className="text-primary-foreground/80 max-w-md mx-auto mb-8">
              Share your referral link and both you and your friend will receive a free athlete stock worth up to $50.
            </p>
            <Button
              size="lg"
              className="bg-primary-foreground text-sport-pink hover:bg-primary-foreground/90 text-base px-8 font-semibold"
            >
              Invite Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferralCTA;
