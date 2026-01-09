import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

export function PricingSection() {
  const pricingPlans = [
    {
      name: "Basic Service",
      price: "₱500",
      description: "Essential maintenance for your vehicle",
      features: [
        "Oil Change",
        "Tire Pressure Check",
        "Fluid Level Inspection",
        "Basic Visual Inspection",
        "Complimentary Car Wash"
      ],
      popular: false
    },
    {
      name: "Premium Service",
      price: "₱3000",
      description: "Comprehensive maintenance package",
      features: [
        "Everything in Basic",
        "Brake Inspection",
        "Battery Test",
        "Air Filter Replacement",
        "Engine Diagnostics",
        "Tire Rotation"
      ],
      popular: true
    },
    {
      name: "Full Checkup",
      price: "₱5000",
      description: "Complete vehicle health assessment",
      features: [
        "Everything in Premium",
        "Transmission Service",
        "AC System Check",
        "Suspension Inspection",
        "Computer Diagnostics",
        "Detailed Report & Recommendations"
      ],
      popular: false
    }
  ];

  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking");
    bookingSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="pricing" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Pricing</p>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Transparent Pricing
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the service package that best fits your needs.
            All prices are upfront with no hidden fees.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-card rounded-xl p-8 border transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? "border-primary shadow-lg md:scale-105"
                  : "border-border hover:border-primary/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full inline-flex items-center gap-1 shadow-md">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">starting at</span>
                </div>

                <div className="border-t border-border pt-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  onClick={scrollToBooking}
                  variant={plan.popular ? "default" : "outline"}
                  className="w-full hover:cursor-pointer"
                  size="lg"
                >
                  Book This Service
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center p-6 bg-card border border-border rounded-lg max-w-3xl mx-auto">
          <p className="text-sm text-muted-foreground">
            * Prices may vary based on vehicle make, model, and condition.
            <a href="#contact" className="ml-1 text-primary font-medium hover:underline">
              Contact us for a detailed quote
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
