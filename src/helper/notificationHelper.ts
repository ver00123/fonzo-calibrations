import { notificationsApi, settingsApi } from "@/services/api.service";

type NotificationType = "info" | "warning" | "success" | "error";
type NotificationCategory = "appointment" | "job_order" | "inventory" | "customer" | "system";

interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  category?: NotificationCategory;
  link?: string;
}

// Check if notifications are enabled before creating
async function isNotificationsEnabled(): Promise<boolean> {
  try {
    const settings = await settingsApi.get();
    return settings?.notifications_enabled ?? true;
  } catch {
    return true; // Default to enabled if can't check
  }
}

// Generic notification creator
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  const enabled = await isNotificationsEnabled();
  if (!enabled) return;

  try {
    await notificationsApi.create({
      title: params.title,
      message: params.message,
      type: params.type || "info",
      category: params.category || "system",
      link: params.link,
    });
  } catch (error) {
    console.error("Error creating notification:", error);
  }
}

// =====================================================
// APPOINTMENT NOTIFICATIONS
// =====================================================

export async function notifyNewAppointment(customerName: string, date: string): Promise<void> {
  await createNotification({
    title: "New Appointment Scheduled",
    message: `${customerName} has scheduled an appointment for ${date}`,
    type: "info",
    category: "appointment",
    link: "/appointment-scheduling",
  });
}

export async function notifyAppointmentCancelled(customerName: string): Promise<void> {
  await createNotification({
    title: "Appointment Cancelled",
    message: `${customerName}'s appointment has been cancelled`,
    type: "warning",
    category: "appointment",
    link: "/appointment-scheduling",
  });
}

export async function notifyAppointmentCompleted(customerName: string): Promise<void> {
  await createNotification({
    title: "Appointment Completed",
    message: `${customerName}'s appointment has been completed`,
    type: "success",
    category: "appointment",
    link: "/appointment-scheduling",
  });
}

// =====================================================
// JOB ORDER NOTIFICATIONS
// =====================================================

export async function notifyNewJobOrder(jobOrderId: string, customerName: string): Promise<void> {
  await createNotification({
    title: "New Job Order Created",
    message: `Job order ${jobOrderId} created for ${customerName}`,
    type: "info",
    category: "job_order",
    link: "/job-orders",
  });
}

export async function notifyJobOrderStatusChange(jobOrderId: string, status: string): Promise<void> {
  const type: NotificationType = status === "Completed" ? "success" : status === "Cancelled" ? "error" : "info";
  await createNotification({
    title: "Job Order Updated",
    message: `Job order ${jobOrderId} status changed to ${status}`,
    type,
    category: "job_order",
    link: "/job-orders",
  });
}

export async function notifyJobOrderCompleted(jobOrderId: string, customerName: string): Promise<void> {
  await createNotification({
    title: "Job Order Completed",
    message: `Job order ${jobOrderId} for ${customerName} has been completed`,
    type: "success",
    category: "job_order",
    link: "/job-orders",
  });
}

// =====================================================
// INVENTORY NOTIFICATIONS
// =====================================================

export async function notifyLowStock(itemName: string, currentQty: number, minQty: number): Promise<void> {
  await createNotification({
    title: "Low Stock Alert",
    message: `${itemName} is running low (${currentQty}/${minQty} remaining)`,
    type: "warning",
    category: "inventory",
    link: "/inventory-supplies",
  });
}

export async function notifyOutOfStock(itemName: string): Promise<void> {
  await createNotification({
    title: "Out of Stock",
    message: `${itemName} is now out of stock!`,
    type: "error",
    category: "inventory",
    link: "/inventory-supplies",
  });
}

export async function notifyStockRestocked(itemName: string, quantity: number): Promise<void> {
  await createNotification({
    title: "Stock Restocked",
    message: `${itemName} has been restocked (+${quantity} units)`,
    type: "success",
    category: "inventory",
    link: "/inventory-supplies",
  });
}

// =====================================================
// CUSTOMER NOTIFICATIONS
// =====================================================

export async function notifyNewCustomer(customerName: string): Promise<void> {
  await createNotification({
    title: "New Customer Added",
    message: `${customerName} has been added to the system`,
    type: "success",
    category: "customer",
    link: "/customers",
  });
}

export async function notifyNewApplication(customerName: string): Promise<void> {
  await createNotification({
    title: "New Service Application",
    message: `${customerName} has submitted a new service application`,
    type: "info",
    category: "customer",
    link: "/customers",
  });
}

// =====================================================
// SYSTEM NOTIFICATIONS
// =====================================================

export async function notifySystemMessage(title: string, message: string): Promise<void> {
  await createNotification({
    title,
    message,
    type: "info",
    category: "system",
  });
}

export async function notifySystemWarning(title: string, message: string): Promise<void> {
  await createNotification({
    title,
    message,
    type: "warning",
    category: "system",
  });
}

export async function notifySystemError(title: string, message: string): Promise<void> {
  await createNotification({
    title,
    message,
    type: "error",
    category: "system",
  });
}
