import { useState, useEffect } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Johnson",
    location: "New York, USA",
    initials: "MJ",
    quote: "SportStock completely changed how I experience sports. Watching games is 10x more exciting when you have skin in the game.",
  },
  {
    name: "Sarah Chen",
    location: "Los Angeles, USA",
    initials: "SC",
    quote: "I've been trading for 6 months and my portfolio is up 34%. The platform is intuitive and the real-time data is incredible.",
  },
  {
    name: "David Williams",
    location: "Chicago, USA",
    initials: "DW",
    quote: "The referral program is amazing. I've earned over $200 in free stocks just by sharing with friends who love sports.",
  },
  {
    name: "Emily Rodriguez",
    location: "Miami, USA",
    initials: "ER",
    quote: "As someone new to trading, SportStock made it easy to understand. The interface is clean and the support team is fantastic.",
  },
];

const Testimonials = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length);
  const next = () => setCurrent((c) => (c + 1) % testimonials.length);

  return (
    <section className="py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            What Our <span className="gradient-text">Traders Say</span>
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join thousands of satisfied traders already winning on SportStock.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="relative rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-8 sm:p-12 text-center card-glow">
            <div className="flex justify-center gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-sport-pink text-sport-pink" />
              ))}
            </div>

            <p className="text-lg text-foreground/90 leading-relaxed mb-8 italic">
              "{testimonials[current].quote}"
            </p>

            <Avatar className="h-14 w-14 mx-auto mb-3 border-2 border-sport-pink/30">
              <AvatarFallback className="bg-secondary text-foreground font-bold">
                {testimonials[current].initials}
              </AvatarFallback>
            </Avatar>
            <div className="font-semibold text-foreground">{testimonials[current].name}</div>
            <div className="text-sm text-muted-foreground">{testimonials[current].location}</div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prev}
              className="h-10 w-10 rounded-full border border-border bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === current ? "w-8 bg-sport-pink" : "w-2 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="h-10 w-10 rounded-full border border-border bg-card/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
