import { Button } from "@/components/ui/button";
import { Gift, ArrowRight } from "lucide-react";
import footballImg from "@/assets/football-action.jpg";

const ReferralCTA = () => {
  return (
    <section className="py-16">
      <div className="container">
        <div className="relative overflow-hidden">
          {/* Background image */}
          <div className="absolute inset-0">
            <img src={footballImg} alt="Football action" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
            <div className="absolute inset-0 gradient-ea opacity-20" />
          </div>
          
          <div className="relative z-10 p-8 sm:p-16 text-center border-l-4 border-primary">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-primary/20 mb-6">
              <Gift className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground mb-4 uppercase">
              Invite Friends, Get <span className="gradient-text">Free Stock</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-8 font-medium text-lg">
              Share your referral link and both you and your friend will receive a free athlete stock worth up to $50.
            </p>
            <Button
              size="lg"
              className="gradient-ea text-primary-foreground hover:opacity-90 text-base px-10 font-extrabold uppercase tracking-wider rounded-none h-14"
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
