import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Define schemas
const profileFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  timezone: z.string(),
  language: z.string(),
});

const companyFormSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters."),
  logo: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string(),
  phone: z.string().optional(),
  email: z.string().email("Please enter a valid email address.").optional(),
  website: z.string().optional(),
  taxId: z.string().optional(),
});

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  newProjects: z.boolean(),
  projectUpdates: z.boolean(),
  taskAssignments: z.boolean(),
  taskUpdates: z.boolean(),
  comments: z.boolean(),
  mentions: z.boolean(),
  approvals: z.boolean(),
  dailyDigest: z.boolean(),
  weeklyDigest: z.boolean(),
  marketingEmails: z.boolean(),
});

const securityFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const billingFormSchema = z.object({
  plan: z.string(),
  billingCycle: z.string(),
  paymentMethod: z.string(),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  nameOnCard: z.string().optional(),
  billingEmail: z.string().email("Please enter a valid email address."),
  billingAddress: z.string().optional(),
  billingCity: z.string().optional(),
  billingState: z.string().optional(),
  billingZip: z.string().optional(),
  billingCountry: z.string(),
});

// Define types for settings
interface ProfileSettings {
  fullName: string;
  email: string;
  avatar?: string;
  bio?: string;
  jobTitle?: string;
  company?: string;
  phone?: string;
  website?: string;
  timezone: string;
  language: string;
}

interface CompanySettings {
  name: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
  phone?: string;
  email?: string;
  website?: string;
  taxId?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  newProjects: boolean;
  projectUpdates: boolean;
  taskAssignments: boolean;
  taskUpdates: boolean;
  comments: boolean;
  mentions: boolean;
  approvals: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
}

interface BillingSettings {
  plan: string;
  billingCycle: string;
  nextBillingDate?: string;
  paymentMethod: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvc?: string;
  nameOnCard?: string;
  billingEmail: string;
  billingAddress?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry: string;
}

interface TeamMember {
  id: number;
  fullName: string;
  email: string;
  role: string;
  avatar?: string;
  status: string;
  lastActive?: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { toast } = useToast();
  const { user } = useAuth();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");

  // Fetch profile settings
  const { data: profileSettings, isLoading: isProfileLoading } = useQuery<ProfileSettings>({
    queryKey: ["/api/settings/profile"],
    retry: false,
    onError: () => {
      toast({
        title: "Error loading profile settings",
        description: "There was a problem loading your profile settings.",
        variant: "destructive",
      });
    },
  });

  // Fetch company settings
  const { data: companySettings, isLoading: isCompanyLoading } = useQuery<CompanySettings>({
    queryKey: ["/api/settings/company"],
    retry: false,
    onError: () => {
      toast({
        title: "Error loading company settings",
        description: "There was a problem loading your company settings.",
        variant: "destructive",
      });
    },
  });

  // Fetch notification settings
  const { data: notificationSettings, isLoading: isNotificationLoading } = useQuery<NotificationSettings>({
    queryKey: ["/api/settings/notifications"],
    retry: false,
    onError: () => {
      toast({
        title: "Error loading notification settings",
        description: "There was a problem loading your notification settings.",
        variant: "destructive",
      });
    },
  });

  // Fetch billing settings
  const { data: billingSettings, isLoading: isBillingLoading } = useQuery<BillingSettings>({
    queryKey: ["/api/settings/billing"],
    retry: false,
    onError: () => {
      toast({
        title: "Error loading billing settings",
        description: "There was a problem loading your billing settings.",
        variant: "destructive",
      });
    },
  });

  // Fetch team members
  const { data: teamMembers, isLoading: isTeamLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
    retry: false,
    onError: () => {
      toast({
        title: "Error loading team members",
        description: "There was a problem loading your team members.",
        variant: "destructive",
      });
    },
  });

  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      avatar: "",
      bio: "",
      jobTitle: "",
      company: "",
      phone: "",
      website: "",
      timezone: "UTC",
      language: "en",
    },
  });

  // Set default values when data is loaded
  useEffect(() => {
    if (profileSettings) {
      profileForm.reset(profileSettings);
    }
  }, [profileSettings, profileForm]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileFormSchema>) => {
      const res = await apiRequest("PATCH", "/api/settings/profile", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/users/current"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Company form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: "",
      logo: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      country: "US",
      phone: "",
      email: "",
      website: "",
      taxId: "",
    },
  });

  // Set default values when data is loaded
  useEffect(() => {
    if (companySettings) {
      companyForm.reset(companySettings);
    }
  }, [companySettings, companyForm]);

  // Update company mutation
  const updateCompanyMutation = useMutation({
    mutationFn: async (data: z.infer<typeof companyFormSchema>) => {
      const res = await apiRequest("PATCH", "/api/settings/company", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Company updated",
        description: "Your company details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/company"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your company details. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof securityFormSchema>) => {
      const res = await apiRequest("POST", "/api/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      securityForm.reset();
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your password. Please check your current password and try again.",
        variant: "destructive",
      });
    },
  });

  // Notification form
  const notificationForm = useForm<z.infer<typeof notificationSettingsSchema>>({
    resolver: zodResolver(notificationSettingsSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      newProjects: true,
      projectUpdates: true,
      taskAssignments: true,
      taskUpdates: true,
      comments: true,
      mentions: true,
      approvals: true,
      dailyDigest: false,
      weeklyDigest: true,
      marketingEmails: false,
    },
  });

  // Set default values when data is loaded
  useEffect(() => {
    if (notificationSettings) {
      notificationForm.reset(notificationSettings);
    }
  }, [notificationSettings, notificationForm]);

  // Update notifications mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSettingsSchema>) => {
      const res = await apiRequest("PATCH", "/api/settings/notifications", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notifications updated",
        description: "Your notification preferences have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/notifications"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Billing form
  const billingForm = useForm<z.infer<typeof billingFormSchema>>({
    resolver: zodResolver(billingFormSchema),
    defaultValues: {
      plan: "free",
      billingCycle: "monthly",
      paymentMethod: "card",
      cardNumber: "",
      cardExpiry: "",
      cardCvc: "",
      nameOnCard: "",
      billingEmail: "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      billingCountry: "US",
    },
  });

  // Set default values when data is loaded
  useEffect(() => {
    if (billingSettings) {
      billingForm.reset({
        ...billingSettings,
        cardNumber: billingSettings.cardNumber?.slice(-4) ? `•••• •••• •••• ${billingSettings.cardNumber.slice(-4)}` : "",
        cardExpiry: billingSettings.cardExpiry || "",
        cardCvc: billingSettings.cardCvc ? "•••" : "",
      });
    }
  }, [billingSettings, billingForm]);

  // Update billing mutation
  const updateBillingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof billingFormSchema>) => {
      const res = await apiRequest("PATCH", "/api/settings/billing", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Billing updated",
        description: "Your billing information has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/settings/billing"] });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "There was an error updating your billing information. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Invite team members mutation
  const inviteTeamMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const res = await apiRequest("POST", "/api/team/invite", { emails });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitations sent",
        description: "Your team invitations have been sent successfully.",
      });
      setInviteEmails("");
      setIsInviteOpen(false);
    },
    onError: () => {
      toast({
        title: "Invitation failed",
        description: "There was an error sending your invitations. Please check the email addresses and try again.",
        variant: "destructive",
      });
    },
  });

  // Handle invite team members
  const handleInviteTeam = () => {
    const emails = inviteEmails
      .split(",")
      .map(email => email.trim())
      .filter(email => email.length > 0);
    
    if (emails.length === 0) {
      toast({
        title: "No emails provided",
        description: "Please enter at least one email address.",
        variant: "destructive",
      });
      return;
    }
    
    inviteTeamMutation.mutate(emails);
  };

  const handleDeleteAccount = () => {
    toast({
      title: "Account deletion requires review",
      description: "Please contact support to proceed with account deletion.",
    });
  };

  if (isProfileLoading && isCompanyLoading && isNotificationLoading && isBillingLoading && isTeamLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="bg-white border rounded-md">
          <ScrollArea className="max-w-full">
            <div className="flex px-2">
              <TabsList className="bg-transparent h-12 justify-start p-0 w-full flex">
                <TabsTrigger 
                  value="profile" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Profile
                </TabsTrigger>
                <TabsTrigger 
                  value="company" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Company
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Security
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Notifications
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Team
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Billing
                </TabsTrigger>
                <TabsTrigger 
                  value="api" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  API
                </TabsTrigger>
                <TabsTrigger 
                  value="advanced" 
                  className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none"
                >
                  Advanced
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>
        </div>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(data => updateProfileMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-24 w-24">
                          {profileSettings?.avatar ? (
                            <AvatarImage src={profileSettings.avatar} alt={profileSettings.fullName} />
                          ) : (
                            <AvatarFallback className="text-lg">
                              {profileSettings?.fullName?.split(" ").map(n => n[0]).join("").toUpperCase() || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-upload mr-2"></i>
                          Change Photo
                        </Button>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <FormField
                            control={profileForm.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="john@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="jobTitle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Designer" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={profileForm.control}
                            name="company"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company</FormLabel>
                                <FormControl>
                                  <Input placeholder="Acme Inc." {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={profileForm.control}
                          name="bio"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bio</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Tell us about yourself" 
                                  {...field} 
                                  rows={4} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 (555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={profileForm.control}
                        name="timezone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Timezone</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select timezone" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                                <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                                <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                                <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                                <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                                <SelectItem value="Europe/London">GMT/BST (UK)</SelectItem>
                                <SelectItem value="Europe/Paris">Central European Time (CET)</SelectItem>
                                <SelectItem value="Asia/Tokyo">Japan Standard Time (JST)</SelectItem>
                                <SelectItem value="Australia/Sydney">Australian Eastern Time (AET)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="language"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Language</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select language" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Spanish</SelectItem>
                                <SelectItem value="fr">French</SelectItem>
                                <SelectItem value="de">German</SelectItem>
                                <SelectItem value="it">Italian</SelectItem>
                                <SelectItem value="pt">Portuguese</SelectItem>
                                <SelectItem value="ja">Japanese</SelectItem>
                                <SelectItem value="zh">Chinese (Simplified)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending || !profileForm.formState.isDirty}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Company Tab */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Settings</CardTitle>
              <CardDescription>
                Manage your company information and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...companyForm}>
                <form onSubmit={companyForm.handleSubmit(data => updateCompanyMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-col gap-6 md:flex-row">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-24 w-24 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                          {companySettings?.logo ? (
                            <img src={companySettings.logo} alt={companySettings.name} className="w-full h-full object-contain" />
                          ) : (
                            <i className="fas fa-building text-3xl text-gray-400"></i>
                          )}
                        </div>
                        <Button variant="outline" size="sm">
                          <i className="fas fa-upload mr-2"></i>
                          Upload Logo
                        </Button>
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Acme Inc." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <FormField
                            control={companyForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Email</FormLabel>
                                <FormControl>
                                  <Input placeholder="info@example.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={companyForm.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Company Phone</FormLabel>
                                <FormControl>
                                  <Input placeholder="+1 (555) 123-4567" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={companyForm.control}
                          name="website"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Website</FormLabel>
                              <FormControl>
                                <Input placeholder="https://example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Company Address</h3>
                      <div className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Street Address</FormLabel>
                              <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                          <FormField
                            control={companyForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder="New York" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={companyForm.control}
                            name="state"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>State/Province</FormLabel>
                                <FormControl>
                                  <Input placeholder="NY" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={companyForm.control}
                            name="zip"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>ZIP/Postal Code</FormLabel>
                                <FormControl>
                                  <Input placeholder="10001" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={companyForm.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <Select 
                                onValueChange={field.onChange} 
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="UK">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                  <SelectItem value="DE">Germany</SelectItem>
                                  <SelectItem value="FR">France</SelectItem>
                                  <SelectItem value="JP">Japan</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <Separator className="my-6" />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Legal Information</h3>
                      <FormField
                        control={companyForm.control}
                        name="taxId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax ID / VAT Number</FormLabel>
                            <FormControl>
                              <Input placeholder="123456789" {...field} />
                            </FormControl>
                            <FormDescription>
                              This information will be used on invoices
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateCompanyMutation.isPending || !companyForm.formState.isDirty}
                    >
                      {updateCompanyMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password & Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...securityForm}>
                <form onSubmit={securityForm.handleSubmit(data => updatePasswordMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Change Password</h3>
                    
                    <FormField
                      control={securityForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormDescription>
                            Password must be at least 8 characters long
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={securityForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updatePasswordMutation.isPending || !securityForm.formState.isDirty}
                      >
                        {updatePasswordMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account by enabling two-factor authentication
                </p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">Not enabled</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sessions</h3>
                <p className="text-sm text-muted-foreground">
                  Manage your active sessions across devices
                </p>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-start p-3 border rounded-md">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-muted-foreground">
                        <i className="fas fa-laptop"></i>
                      </div>
                      <div>
                        <h4 className="font-medium">Current Session</h4>
                        <p className="text-sm text-muted-foreground">
                          Chrome on Windows • IP: 192.168.1.1
                        </p>
                        <Badge variant="outline" className="mt-1">
                          Current Session
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <Button variant="outline">Sign Out All Other Sessions</Button>
                </div>
              </div>
              
              <Separator className="my-6" />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all of your content
                </p>
                
                <Alert className="border-destructive/50 text-destructive">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <AlertTitle>Deleting your account is permanent</AlertTitle>
                  <AlertDescription>
                    This action cannot be undone. All data associated with your account will be permanently removed.
                  </AlertDescription>
                </Alert>
                
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(data => updateNotificationsMutation.mutate(data))} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Notification Channels</h3>
                    <div className="space-y-3">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Push Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications in your browser
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-medium">Notification Types</h3>
                    <div className="space-y-3">
                      <FormField
                        control={notificationForm.control}
                        name="newProjects"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">New Projects</FormLabel>
                              <FormDescription>
                                When you're added to a new project
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="projectUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Project Updates</FormLabel>
                              <FormDescription>
                                When projects you're a member of are updated
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="taskAssignments"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Task Assignments</FormLabel>
                              <FormDescription>
                                When you're assigned to a task
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="taskUpdates"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Task Updates</FormLabel>
                              <FormDescription>
                                When tasks you're assigned to are updated
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="comments"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Comments</FormLabel>
                              <FormDescription>
                                When someone comments on your work
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="mentions"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Mentions</FormLabel>
                              <FormDescription>
                                When someone mentions you in a comment
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="approvals"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Approvals</FormLabel>
                              <FormDescription>
                                When your work is approved or rejected
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <h3 className="text-lg font-medium">Digest & Marketing</h3>
                    <div className="space-y-3">
                      <FormField
                        control={notificationForm.control}
                        name="dailyDigest"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Daily Digest</FormLabel>
                              <FormDescription>
                                Receive a daily summary of your activities
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyDigest"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Weekly Digest</FormLabel>
                              <FormDescription>
                                Receive a weekly summary of your activities
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between space-x-2 rounded-md border p-3">
                            <div className="space-y-0.5">
                              <FormLabel className="font-medium">Marketing Emails</FormLabel>
                              <FormDescription>
                                Receive promotional emails and updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateNotificationsMutation.isPending || !notificationForm.formState.isDirty}
                    >
                      {updateNotificationsMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Team Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage your team members and their permissions
                </CardDescription>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <i className="fas fa-user-plus mr-2"></i>
                    Invite Members
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Members</DialogTitle>
                    <DialogDescription>
                      Send invitations to people you want to join your team
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="emails">Email Addresses</Label>
                      <Textarea 
                        id="emails" 
                        placeholder="Enter email addresses separated by commas"
                        value={inviteEmails}
                        onChange={(e) => setInviteEmails(e.target.value)}
                        rows={4}
                      />
                      <p className="text-sm text-muted-foreground">
                        Example: john@example.com, sarah@example.com
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select defaultValue="member">
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="guest">Guest</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsInviteOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleInviteTeam}
                      disabled={inviteTeamMutation.isPending || !inviteEmails.trim()}
                    >
                      {inviteTeamMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Invitations"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent className="pt-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 text-left font-medium text-sm">User</th>
                    <th className="py-3 text-left font-medium text-sm">Role</th>
                    <th className="py-3 text-left font-medium text-sm">Status</th>
                    <th className="py-3 text-left font-medium text-sm">Last Active</th>
                    <th className="py-3 text-right font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teamMembers?.map((member) => (
                    <tr key={member.id} className="hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.avatar ? (
                              <AvatarImage src={member.avatar} alt={member.fullName} />
                            ) : (
                              <AvatarFallback className="bg-primary-100 text-primary-800 text-xs">
                                {member.fullName.split(" ").map(n => n[0]).join("").toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className="font-medium">{member.fullName}</div>
                            <div className="text-xs text-muted-foreground">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant={
                            member.role === "owner" ? "default" :
                            member.role === "admin" ? "secondary" : "outline"
                          }
                        >
                          {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Badge 
                          variant="outline"
                          className={
                            member.status === "active" ? "bg-green-100 text-green-800" :
                            member.status === "invited" ? "bg-blue-100 text-blue-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">
                        {member.lastActive ? new Date(member.lastActive).toLocaleDateString() : "Never"}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <i className="fas fa-user-edit text-xs"></i>
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <i className="fas fa-user-times text-xs"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Roles & Permissions</CardTitle>
              <CardDescription>
                Manage role definitions and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="owner">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge>Owner</Badge>
                      <span>Full access to all settings and administrative functions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Permissions:</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        <li>Manage billing and subscription</li>
                        <li>Add/remove team members</li>
                        <li>Manage roles and permissions</li>
                        <li>Create and manage all projects</li>
                        <li>Access all reports and analytics</li>
                        <li>Manage company settings</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="admin">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Admin</Badge>
                      <span>Administrative access with some restrictions</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Permissions:</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        <li>View billing information (cannot modify)</li>
                        <li>Add team members (cannot remove)</li>
                        <li>Create and manage all projects</li>
                        <li>Access all reports and analytics</li>
                        <li>Manage most company settings</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="member">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Member</Badge>
                      <span>Standard access to projects and tasks</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Permissions:</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        <li>Access assigned projects and tasks</li>
                        <li>Create and edit content</li>
                        <li>Add comments and participate in discussions</li>
                        <li>View team members</li>
                        <li>Access basic reports</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="guest">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Guest</Badge>
                      <span>Limited access for clients and external collaborators</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 pt-2">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">Permissions:</div>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-5">
                        <li>View specific projects they're invited to</li>
                        <li>Add comments on shared items</li>
                        <li>View and download approved files</li>
                        <li>Cannot see other team members</li>
                        <li>Cannot access reports or settings</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>
                Manage your subscription plan and billing information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-col gap-6 md:flex-row">
                  <div className="space-y-4 border rounded-md p-4 flex-1">
                    <div className="space-y-1">
                      <h3 className="font-medium">Current Plan</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-lg py-1 px-3">
                          {billingSettings?.plan === "free" ? "Free" : 
                           billingSettings?.plan === "pro" ? "Professional" : 
                           billingSettings?.plan === "team" ? "Team" : 
                           billingSettings?.plan === "enterprise" ? "Enterprise" : "Unknown"}
                        </Badge>
                        {billingSettings?.plan !== "free" && (
                          <Badge variant="outline">
                            {billingSettings?.billingCycle === "monthly" ? "Monthly" : "Annual"}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {billingSettings?.plan !== "free" && (
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Next billing date:</span>
                          <span className="font-medium">{billingSettings?.nextBillingDate ? new Date(billingSettings.nextBillingDate).toLocaleDateString() : "N/A"}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount due:</span>
                          <span className="font-medium">
                            {billingSettings?.plan === "pro" ? "$15.00" : 
                             billingSettings?.plan === "team" ? "$49.00" : 
                             billingSettings?.plan === "enterprise" ? "$199.00" : "$0.00"}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <div className="pt-4">
                      {billingSettings?.plan === "free" ? (
                        <Button>Upgrade Plan</Button>
                      ) : (
                        <Button variant="outline">Change Plan</Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-4 border rounded-md p-4 flex-1">
                    <div className="space-y-1">
                      <h3 className="font-medium">Plan Features</h3>
                      <div className="text-sm text-muted-foreground">
                        {billingSettings?.plan === "free" ? (
                          <ul className="space-y-1 mt-2">
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              3 team members
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              5 projects
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Basic reporting
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-times text-red-500"></i>
                              Advanced features
                            </li>
                          </ul>
                        ) : billingSettings?.plan === "pro" ? (
                          <ul className="space-y-1 mt-2">
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Unlimited team members
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Unlimited projects
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Advanced reporting
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              All features included
                            </li>
                          </ul>
                        ) : (
                          <ul className="space-y-1 mt-2">
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Enterprise-grade features
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Priority support
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Custom integrations
                            </li>
                            <li className="flex items-center gap-2">
                              <i className="fas fa-check text-green-500"></i>
                              Dedicated account manager
                            </li>
                          </ul>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <Button variant="outline">View All Plans</Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                  <Form {...billingForm}>
                    <form onSubmit={billingForm.handleSubmit(data => updateBillingMutation.mutate(data))} className="space-y-6">
                      <div className="space-y-4">
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                          <FormField
                            control={billingForm.control}
                            name="paymentMethod"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Payment Method</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select payment method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        {billingForm.watch("paymentMethod") === "card" && (
                          <div className="space-y-4 border rounded-md p-4">
                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                              <FormField
                                control={billingForm.control}
                                name="cardNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Card Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="•••• •••• •••• ••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <div className="grid grid-cols-2 gap-4">
                                <FormField
                                  control={billingForm.control}
                                  name="cardExpiry"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Expiry Date</FormLabel>
                                      <FormControl>
                                        <Input placeholder="MM/YY" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                
                                <FormField
                                  control={billingForm.control}
                                  name="cardCvc"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>CVC</FormLabel>
                                      <FormControl>
                                        <Input placeholder="•••" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              
                              <FormField
                                control={billingForm.control}
                                name="nameOnCard"
                                render={({ field }) => (
                                  <FormItem className="col-span-full">
                                    <FormLabel>Name on Card</FormLabel>
                                    <FormControl>
                                      <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium mb-3">Billing Address</h4>
                          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                            <FormField
                              control={billingForm.control}
                              name="billingEmail"
                              render={({ field }) => (
                                <FormItem className="col-span-full">
                                  <FormLabel>Billing Email</FormLabel>
                                  <FormControl>
                                    <Input placeholder="billing@example.com" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={billingForm.control}
                              name="billingAddress"
                              render={({ field }) => (
                                <FormItem className="col-span-full">
                                  <FormLabel>Street Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123 Main St" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={billingForm.control}
                              name="billingCity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>City</FormLabel>
                                  <FormControl>
                                    <Input placeholder="New York" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={billingForm.control}
                                name="billingState"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>State/Province</FormLabel>
                                    <FormControl>
                                      <Input placeholder="NY" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={billingForm.control}
                                name="billingZip"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>ZIP/Postal Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="10001" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={billingForm.control}
                              name="billingCountry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Country</FormLabel>
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select country" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="US">United States</SelectItem>
                                      <SelectItem value="CA">Canada</SelectItem>
                                      <SelectItem value="UK">United Kingdom</SelectItem>
                                      <SelectItem value="AU">Australia</SelectItem>
                                      <SelectItem value="DE">Germany</SelectItem>
                                      <SelectItem value="FR">France</SelectItem>
                                      <SelectItem value="JP">Japan</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={updateBillingMutation.isPending || !billingForm.formState.isDirty}
                        >
                          {updateBillingMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            "Save Payment Information"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Billing History</h3>
                  <div className="rounded-md border">
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No billing history available
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Tab */}
        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage your API keys and application access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">API Keys</h3>
                    <Button>
                      <i className="fas fa-plus mr-2"></i>
                      Create New Key
                    </Button>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No API keys have been created yet
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API Documentation</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn how to integrate with our API and automate your workflows
                  </p>
                  
                  <div className="flex gap-4 flex-wrap">
                    <Button variant="outline">View Documentation</Button>
                    <Button variant="outline">API Reference</Button>
                    <Button variant="outline">Authentication Guide</Button>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Webhooks</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure webhooks to receive real-time notifications for events
                  </p>
                  
                  <Button>
                    <i className="fas fa-plus mr-2"></i>
                    Add Webhook
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Advanced Tab */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Data Management</h3>
                  
                  <div className="rounded-md border p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Export Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Export all your data as a JSON or CSV file
                        </p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-download mr-2"></i>
                        Export
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Import Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Import data from a JSON or CSV file
                        </p>
                      </div>
                      <Button variant="outline">
                        <i className="fas fa-upload mr-2"></i>
                        Import
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">System Preferences</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-3">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Dark Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Use dark mode for the application interface
                        </p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-3">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Automatic Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically update the application when new versions are available
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between space-x-2 rounded-md border p-3">
                      <div className="space-y-0.5">
                        <Label className="font-medium">Analytics</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow anonymous usage data collection to improve the application
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                  
                  <div className="rounded-md border border-destructive/50 p-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Delete All Data</h4>
                        <p className="text-sm text-muted-foreground">
                          Permanently delete all your data from our servers
                        </p>
                      </div>
                      <Button variant="destructive">Delete All Data</Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">Reset Application</h4>
                        <p className="text-sm text-muted-foreground">
                          Reset the application to its default settings
                        </p>
                      </div>
                      <Button variant="destructive">Reset</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}