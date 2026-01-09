import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

export function ContactSection() {
  const contactInfo = [
    {
      icon: MapPin,
      title: "Address",
      content: "Jose Abad Santos Ave. San Fernando, Philippines",
      link: "https://maps.app.goo.gl/Ewjq3ZrFbxeq4sMfA"
    },
    {
      icon: Phone,
      title: "Phone",
      content: "(555) 123-4567",
      link: "tel:+15551234567"
    },
    {
      icon: Mail,
      title: "Email",
      content: "info@fonzorepair.com",
      link: "mailto:info@fonzorepair.com"
    },
    {
      icon: Clock,
      title: "Hours",
      content: "Mon-Fri: 9AM - 5PM, Sat: 9AM - 2PM",
      link: null
    }
  ];

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Contact</p>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Get In Touch
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out to us through any of these channels.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Info Cards */}
          <div className="grid sm:grid-cols-2 gap-4">
            {contactInfo.map((info) => (
              <div
                key={info.title}
                className="group bg-card rounded-xl p-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:scale-110 transition-all">
                  <info.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{info.title}</h3>
                {info.link ? (
                  <a
                    href={info.link}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-start gap-1 group/link"
                    target={info.link.startsWith("http") ? "_blank" : undefined}
                    rel={info.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <span className="flex-1">{info.content}</span>
                    {info.link.startsWith("http") && (
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                    )}
                  </a>
                ) : (
                  <p className="text-sm text-muted-foreground">{info.content}</p>
                )}
              </div>
            ))}
          </div>

          {/* Map */}
          <div className="rounded-xl overflow-hidden border border-border shadow-lg h-[400px] lg:h-auto bg-muted">
            {/* Embedded Google Map - Replace with your actual location */}
            <iframe
              title="Fonzo Calibration Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d61651.60392117283!2d120.63480121365929!3d15.035652622483509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3396f9df9db6145f%3A0x1abc48e4f6a83d65!2sFONZO%20Calibration%20and%20Car%20Services%20Co.!5e0!3m2!1sen!2sph!4v1761644453997!5m2!1sen!2sph"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
            {/* Alternative: If you don't want to embed a map, use a placeholder */}
            {/* <div className="w-full h-full flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-muted-foreground font-medium">Map View</p>
                <p className="text-sm text-muted-foreground mt-1">Location map will appear here</p>
              </div>
            </div> */}
          </div>
        </div>

        {/* Additional contact CTA */}
        <div className="mt-12 text-center p-8 bg-card border border-border rounded-xl max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-foreground mb-2">Ready to service your vehicle?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Contact us today to schedule an appointment or get a free quote
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="tel:+15551234567"
              className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="h-4 w-4" />
              Call Now
            </a>
            <a
              href="#booking"
              className="inline-flex items-center gap-2 px-6 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Book Online
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
