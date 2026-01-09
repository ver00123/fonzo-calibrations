import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import supabase from "@/helper/supabaseClient";
import toast from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  vehicleModel: string;
  serviceType: string;
  preferredDate: Date | null;
  preferredTime: string;
  message: string;
}

export function BookingForm() {
  const [formData, setFormData] = useState<BookingFormData>({
    fullName: "",
    email: "",
    phone: "",
    vehicleModel: "",
    serviceType: "",
    preferredDate: null,
    preferredTime: "",
    message: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fullyBookedDates, setFullyBookedDates] = useState<Date[]>([]);

  const serviceTypes = [
    "Oil Change",
    "Brake Repair",
    "Engine Diagnostics",
    "Battery Service",
    "AC Repair",
    "Tire Service",
    "General Maintenance",
    "Transmission Service",
    "Other"
  ];

  const timeSlots = [
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM"
  ];

  // Fetch fully booked dates from Supabase
  useEffect(() => {
    fetchFullyBookedDates();
  }, []);

  const fetchFullyBookedDates = async () => {
    try {
      // Get all bookings
      const { data, error } = await supabase
        .from("bookings")
        .select("preferred_date");

      if (error) throw error;

      if (data) {
        // Count bookings per date and identify fully booked dates (e.g., max 5 bookings per day)
        const dateCounts: { [key: string]: number } = {};
        data.forEach((booking) => {
          const dateStr = booking.preferred_date;
          dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
        });

        const maxBookingsPerDay = 5;
        const bookedDates = Object.keys(dateCounts)
          .filter((date) => dateCounts[date] >= maxBookingsPerDay)
          .map((dateStr) => new Date(dateStr));

        setFullyBookedDates(bookedDates);
      }
    } catch (error) {
      console.error("Error fetching booked dates:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setFormData((prev) => ({
      ...prev,
      preferredDate: date
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.fullName.trim()) return "Full name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Invalid email format";
    if (!formData.phone.trim()) return "Phone number is required";
    if (!/^\+?[\d\s\-()]+$/.test(formData.phone)) return "Invalid phone number format";
    if (!formData.vehicleModel.trim()) return "Vehicle model is required";
    if (!formData.serviceType) return "Service type is required";
    if (!formData.preferredDate) return "Preferred date is required";
    if (!formData.preferredTime) return "Preferred time is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      // Format date for Supabase (YYYY-MM-DD)
      const formattedDate = formData.preferredDate
        ? formData.preferredDate.toISOString().split("T")[0]
        : null;

      // Insert booking into Supabase
      const { error } = await supabase.from("bookings").insert([
        {
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          vehicle_model: formData.vehicleModel,
          service_type: formData.serviceType,
          preferred_date: formattedDate,
          preferred_time: formData.preferredTime,
          message: formData.message,
          status: "Pending",
          created_at: new Date().toISOString()
        }
      ]);

      if (error) throw error;

      // Success!
      toast.success("Booking submitted successfully! We'll contact you soon.");

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        vehicleModel: "",
        serviceType: "",
        preferredDate: null,
        preferredTime: "",
        message: ""
      });

      // Refresh fully booked dates
      fetchFullyBookedDates();
    } catch (error) {
      console.error("Error submitting booking:", error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if a date is fully booked
  const isDateFullyBooked = (date: Date) => {
    return fullyBookedDates.some(
      (bookedDate) =>
        bookedDate.getFullYear() === date.getFullYear() &&
        bookedDate.getMonth() === date.getMonth() &&
        bookedDate.getDate() === date.getDate()
    );
  };

  return (
    <section id="booking" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 space-y-4">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider">Book Appointment</p>
          <h2 className="text-4xl font-bold text-foreground tracking-tight">
            Schedule Your Service
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Fill out the form below and we'll get back to you as soon as possible
            to confirm your appointment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="h-10"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="h-10"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-foreground">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(555) 123-4567"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="h-10"
              />
            </div>

            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label htmlFor="vehicleModel" className="text-sm font-medium text-foreground">
                Vehicle Model <span className="text-destructive">*</span>
              </Label>
              <Input
                id="vehicleModel"
                name="vehicleModel"
                type="text"
                placeholder="e.g., Toyota Camry 2020"
                value={formData.vehicleModel}
                onChange={handleInputChange}
                required
                className="h-10"
              />
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-sm font-medium text-foreground">
                Service Type <span className="text-destructive">*</span>
              </Label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              >
                <option value="">Select a service</option>
                {serviceTypes.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred Date */}
            <div className="space-y-2">
              <Label htmlFor="preferredDate" className="text-sm font-medium text-foreground">
                Preferred Date <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <DatePicker
                  selected={formData.preferredDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  filterDate={(date) => !isDateFullyBooked(date)}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select a date"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
                  required
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime" className="text-sm font-medium text-foreground">
                Preferred Time <span className="text-destructive">*</span>
              </Label>
              <select
                id="preferredTime"
                name="preferredTime"
                value={formData.preferredTime}
                onChange={handleInputChange}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground"
              >
                <option value="">Select a time</option>
                {timeSlots.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>

            {/* Message (optional) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="message" className="text-sm font-medium text-foreground">
                Additional Message (Optional)
              </Label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Any additional information about your vehicle or service needs..."
                value={formData.message}
                onChange={handleInputChange}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none text-foreground"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 space-y-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              size="lg"
              className="w-full text-base h-12 hover:cursor-pointer"
            >
              {isSubmitting ? "Submitting..." : "Submit Booking Request"}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              We'll review your request and contact you within 24 hours to confirm your appointment.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
