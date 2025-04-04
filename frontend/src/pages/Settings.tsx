import { useState } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

const emailFormSchema = z.object({
  enableEmailNotifications: z.boolean(),
  ccAdmin: z.boolean(),
  emailTemplate: z
    .string()
    .min(10, { message: 'Template must be at least 10 characters' }),
});

const passwordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, { message: 'Current password is required' }),
    newPassword: z
      .string()
      .min(6, { message: 'New password must be at least 6 characters' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const Settings = () => {
  const { user, token, setToken, setUser } = useAuthStore();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      enableEmailNotifications: user.settings.enableEmailNotification || false,
      ccAdmin: user.settings.ccAdminOnEmails || false,
      emailTemplate: user.settings.emailTemplate || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/admins/updateName`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
        }),
      }
    );

    if (!resp.ok) {
      setIsUpdating(false);
      const error = await resp.json();
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    const result = await resp.json();
    if (result.success) {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsUpdating(false);
  };

  // const onEmailSettingsSubmit = (data: z.infer<typeof emailFormSchema>) => {
  //   setIsUpdating(true);
  //   setTimeout(() => {
  //     toast({
  //       title: 'Email Settings Updated',
  //       description:
  //         'Email notification settings have been updated successfully.',
  //     });
  //     setIsUpdating(false);
  //   }, 1000);
  // };

  const onPasswordSubmit = async (data: z.infer<typeof passwordFormSchema>) => {
    setIsUpdating(true);

    const resp = await fetch(
      `${import.meta.env.VITE_PUBLIC_BACKEND_URL}/api/admins/updatePassword`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      }
    );

    if (!resp.ok) {
      setIsUpdating(false);
      const error = await resp.json();
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    const result = await resp.json();
    if (result.success) {
      toast({
        title: 'Password Updated',
        description: 'Your password has been updated successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }

    setUser(null);
    setToken(null);

    navigate('/login', {
      replace: true,
    });
    setIsUpdating(false);
    passwordForm.reset(); // Clear form after success
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your account settings and preferences.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            {/* <TabsTrigger value="email">Email Notifications</TabsTrigger> */}
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* PROFILE FORM */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information.
                </CardDescription>
              </CardHeader>
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={profileForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                            <Input
                              placeholder="Your email"
                              type="email"
                              {...field}
                              readOnly={user?.role === 'admin'}
                            />
                          </FormControl>
                          <FormMessage />
                          {user?.role === 'admin' && (
                            <FormDescription>
                              Email cannot be changed for admin accounts.
                            </FormDescription>
                          )}
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>

          {/* EMAIL FORM */}
          {/* <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure how email notifications are sent for bookings.
                </CardDescription>
              </CardHeader>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(onEmailSettingsSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={emailForm.control}
                      name="enableEmailNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Email Notifications
                            </FormLabel>
                            <FormDescription>
                              Enable email notifications for bookings.
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
                      control={emailForm.control}
                      name="ccAdmin"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              CC Admin on Emails
                            </FormLabel>
                            <FormDescription>
                              Send a copy of all booking emails to the admin.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={
                                !emailForm.watch('enableEmailNotifications')
                              }
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={emailForm.control}
                      name="emailTemplate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Template</FormLabel>
                          <FormControl>
                            <textarea
                              className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              placeholder="Email template"
                              {...field}
                              disabled={
                                !emailForm.watch('enableEmailNotifications')
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            You can use {'{studentName}'}, {'{date}'},{' '}
                            {'{startTime}'}, {'{endTime}'}, {'{computerName}'}{' '}
                            as variables.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      disabled={
                        isUpdating ||
                        !emailForm.watch('enableEmailNotifications')
                      }
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent> */}

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password here.</CardDescription>
              </CardHeader>
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter current password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm new password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isUpdating}>
                      {isUpdating ? 'Saving...' : 'Change Password'}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
