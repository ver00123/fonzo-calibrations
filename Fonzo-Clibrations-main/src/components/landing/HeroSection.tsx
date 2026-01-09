import { Button } from "@/components/ui/button";
import { ArrowDown, Wrench, Award, Clock } from "lucide-react";

export function HeroSection() {
  const scrollToBooking = () => {
    const bookingSection = document.getElementById("booking");
    bookingSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-muted">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(0,0,0,0.02)_0%,transparent_50%)]" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-foreground">
            <Award className="h-4 w-4" />
            Professional Car Repair & Maintenance
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tight">
            Fast & Reliable Car Repair Services
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Expert mechanics, quality parts, and guaranteed satisfaction.
            Get your vehicle back on the road quickly and safely.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={scrollToBooking}
              className="text-base px-8 h-12 shadow-lg"
            >
              Book Appointment
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
              className="text-base px-8 h-12"
            >
              View Services
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid sm:grid-cols-3 gap-6 pt-12 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <Wrench className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Expert Service</h3>
              <p className="text-sm text-muted-foreground text-center">Certified mechanics</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Quick Turnaround</h3>
              <p className="text-sm text-muted-foreground text-center">Fast & efficient</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-lg bg-card border border-border hover:shadow-md transition-shadow">
              <Award className="h-8 w-8 text-primary" />
              <h3 className="font-semibold text-foreground">Quality Parts</h3>
              <p className="text-sm text-muted-foreground text-center">Premium quality</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ArrowDown className="h-6 w-6 text-muted-foreground" />
      </div>
    </section>
  );
}
