import { useAuthChecker } from "@/hooks/useAuthChecker";
import { useState, useEffect } from "react";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { settingsApi, type WorkshopSettings } from "@/services/api.service";
import supabase from "@/helper/supabaseClient";
import toast from "react-hot-toast";
import {
  Save,
  Building2,
  Bell,
  BellOff,
  Loader2,
  User,
  Lock,
  Database,
  Download,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

type SettingsTab = "general" | "account" | "notifications" | "data";

export default function Settings() {
  const { isAuthenticated } = useAuthChecker();
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<WorkshopSettings>({
    workshop_name: "",
    address: "",
    contact_info: "",
    email: "",
    notifications_enabled: true,
  });

  // Account settings state
  const [currentUser, setCurrentUser] = useState<{
    email: string;
    full_name: string;
    phone: string;
    role: string;
  } | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadSettings();
      loadCurrentUser();
    }
  }, [isAuthenticated]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.get();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, phone, role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
        }

        setCurrentUser({
          email: user.email || "",
          full_name: profile?.full_name || "",
          phone: profile?.phone || "",
          role: profile?.role || "",
        });
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsApi.upsert(settings);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggleNotifications = () => {
    setSettings((prev) => ({
      ...prev,
      notifications_enabled: !prev.notifications_enabled,
    }));
  };

  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setChangingPassword(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });

      if (error) throw error;

      toast.success("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      const message = error instanceof Error ? error.message : "Failed to change password";
      toast.error(message);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      setExporting(true);

      // Fetch all data from different tables
      const [
        customersRes,
        mechanicsRes,
        suppliersRes,
        inventoryRes,
        jobOrdersRes,
        appointmentsRes,
      ] = await Promise.all([
        supabase.from("customers").select("*"),
        supabase.from("mechanics").select("*"),
        supabase.from("suppliers").select("*"),
        supabase.from("inventory_items").select("*"),
        supabase.from("job_orders").select("*"),
        supabase.from("appointments").select("*"),
      ]);

      const exportData = {
        exportDate: new Date().toISOString(),
        workshopSettings: settings,
        customers: customersRes.data || [],
        mechanics: mechanicsRes.data || [],
        suppliers: suppliersRes.data || [],
        inventory: inventoryRes.data || [],
        jobOrders: jobOrdersRes.data || [],
        appointments: appointmentsRes.data || [],
      };

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `workshop-backup-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data exported successfully!");
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  if (!isAuthenticated) return null;

  if (loading) {
    return (
      <div className="py-4 px-2 md:px-6 lg:px-18">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Building2 className="h-4 w-4" /> },
    { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
    },
    { id: "data", label: "Data", icon: <Database className="h-4 w-4" /> },
  ];

  return (
    <div className="py-4 px-2 md:px-6 lg:px-18">
      {/* Header */}
      <section className="flex flex-col gap-2 mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Configure your workshop settings and preferences.
        </p>
      </section>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* General Settings Tab */}
      {activeTab === "general" && (
        <div className="space-y-6">
          {/* Workshop Details */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Workshop Information</h2>
                <p className="text-sm text-gray-500">
                  Basic details about your workshop
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="workshop_name" className="text-sm font-medium">
                  Workshop Name
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="workshop_name"
                    type="text"
                    placeholder="Enter workshop name"
                    value={settings.workshop_name}
                    onChange={(e) =>
                      setSettings({ ...settings, workshop_name: e.target.value })
                    }
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="workshop@example.com"
                    value={settings.email || ""}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_info" className="text-sm font-medium">
                  Contact Number
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="contact_info"
                    type="text"
                    placeholder="Phone number or contact details"
                    value={settings.contact_info}
                    onChange={(e) =>
                      setSettings({ ...settings, contact_info: e.target.value })
                    }
                    className="pl-10 w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium">
                  Address
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="address"
                    type="text"
                    placeholder="Enter workshop address"
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    className="pl-10 w-full"
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 hover:cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Tab */}
      {activeTab === "account" && (
        <div className="space-y-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Profile Information</h2>
                <p className="text-sm text-gray-500">
                  Your account details
                </p>
              </div>
            </div>

            {currentUser && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Full Name
                  </Label>
                  <p className="text-gray-900 font-medium">
                    {currentUser.full_name || "Not set"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Email Address
                  </Label>
                  <p className="text-gray-900 font-medium">
                    {currentUser.email || "Not set"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Phone Number
                  </Label>
                  <p className="text-gray-900 font-medium">
                    {currentUser.phone || "Not set"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-500">
                    Role
                  </Label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      currentUser.role === "admin"
                        ? "bg-purple-100 text-purple-800"
                        : currentUser.role === "staff"
                        ? "bg-blue-100 text-blue-800"
                        : currentUser.role === "mechanic"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {currentUser.role?.toUpperCase() || "N/A"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Lock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Change Password</h2>
                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
            </div>

            <div className="max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="text-sm font-medium"
                >
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="pl-10 pr-10 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                  className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 hover:cursor-pointer"
                >
                  {changingPassword ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Change Password
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="space-y-6">
          {/* Notification Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                {settings.notifications_enabled ? (
                  <Bell className="h-5 w-5 text-green-600" />
                ) : (
                  <BellOff className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-semibold">Notification Preferences</h2>
                <p className="text-sm text-gray-500">
                  Manage how you receive notifications
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Master Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">
                    Enable Notifications
                  </p>
                  <p className="text-sm text-gray-500">
                    {settings.notifications_enabled
                      ? "You will receive notifications for important updates"
                      : "All notifications are currently disabled"}
                  </p>
                </div>
                <button
                  onClick={toggleNotifications}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors hover:cursor-pointer ${
                    settings.notifications_enabled
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      settings.notifications_enabled
                        ? "translate-x-6"
                        : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Notification Types */}
              {settings.notifications_enabled && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Appointment Reminders
                      </p>
                      <p className="text-sm text-gray-500">
                        Get notified about upcoming appointments
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-green-600 rounded-full flex items-center">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Job Order Updates
                      </p>
                      <p className="text-sm text-gray-500">
                        Status changes on job orders
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-green-600 rounded-full flex items-center">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        Low Stock Alerts
                      </p>
                      <p className="text-sm text-gray-500">
                        Inventory running low warnings
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-green-600 rounded-full flex items-center">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        New Bookings
                      </p>
                      <p className="text-sm text-gray-500">
                        When customers make new bookings
                      </p>
                    </div>
                    <div className="h-6 w-11 bg-green-600 rounded-full flex items-center">
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-100">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-6 py-2 hover:cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === "data" && (
        <div className="space-y-6">
          {/* Export Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Download className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Export Data</h2>
                <p className="text-sm text-gray-500">
                  Download a backup of all your workshop data
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">
                This export will include:
              </p>
              <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
                <li>Customer records and information</li>
                <li>Vehicle details</li>
                <li>Job orders and work history</li>
                <li>Inventory items and stock levels</li>
                <li>Mechanic profiles and assignments</li>
                <li>Supplier information</li>
                <li>Appointment schedules</li>
              </ul>
            </div>

            <Button
              onClick={handleExportData}
              disabled={exporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 hover:cursor-pointer"
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export All Data
                </>
              )}
            </Button>
          </div>

          {/* Database Info */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Database className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Database Information</h2>
                <p className="text-sm text-gray-500">
                  Your data storage details
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">Supabase</p>
                <p className="text-sm text-gray-500">Database Provider</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">Active</p>
                <p className="text-sm text-gray-500">Connection Status</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-gray-900">PostgreSQL</p>
                <p className="text-sm text-gray-500">Database Type</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">Encrypted</p>
                <p className="text-sm text-gray-500">Security</p>
              </div>
            </div>
          </div>

          {/* Refresh Data */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <RefreshCw className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Refresh Data</h2>
                <p className="text-sm text-gray-500">
                  Reload all data from the database
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              If you're experiencing issues with data not updating, you can
              force a refresh of all cached data.
            </p>

            <Button
              onClick={() => {
                window.location.reload();
              }}
              variant="outline"
              className="flex items-center gap-2 hover:cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Application
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
