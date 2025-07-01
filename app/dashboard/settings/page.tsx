"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/auth-provider";
import { fetchWithAuth } from "@/lib/client-auth";

interface UserSettings {
  weeklyTarget?: number;
  defaultView?: string;
  currency?: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Profile settings
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  
  // Password settings
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Display settings
  const [weeklyTarget, setWeeklyTarget] = useState("10");
  const [defaultView, setDefaultView] = useState("list");
  const [currency, setCurrency] = useState("USD");
  
  // Loading states
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  const [isDisplaySaving, setIsDisplaySaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetchWithAuth('/api/user/settings');
        if (response && response.ok) {
          const data = await response.json();
          if (data.user) {
            // Update profile fields
            setName(data.user.name || "");
            setEmail(data.user.email || "");
            
            // Update settings
            if (data.user.settings) {
              setWeeklyTarget(data.user.settings.weeklyTarget?.toString() || "10");
              setDefaultView(data.user.settings.defaultView || "list");
              setCurrency(data.user.settings.currency || "USD");
            }
          }
        }
      } catch (error) {
        console.error("Error loading settings:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user settings"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [toast]);
  
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileSaving(true);
    
    try {
      const response = await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email
        }),
      });
      
      if (!response || !response.ok) {
        const data = await response?.json();
        throw new Error(data?.message || 'Failed to update profile');
      }
      
      // If we had a refresh user function in the auth context, we would call it here
      // For now, we'll just log success
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile. Please try again."
      });
    } finally {
      setIsProfileSaving(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password Mismatch",
        description: "New password and confirm password do not match."
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Password Too Short",
        description: "Password should be at least 8 characters long."
      });
      return;
    }
    
    setIsPasswordChanging(true);
    
    try {
      const response = await fetchWithAuth('/api/user/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword
        }),
      });
      
      if (!response || !response.ok) {
        const data = await response?.json();
        throw new Error(data?.message || 'Failed to change password');
      }
      
      toast({
        title: "Password Changed",
        description: "Your password has been changed successfully."
      });
      
      // Reset form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to change password. Please try again."
      });
    } finally {
      setIsPasswordChanging(false);
    }
  };
  
  const handleDisplaySave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisplaySaving(true);
    
    try {
      // For viewer role, we don't need to validate or send the weekly target
      // as the backend will ignore it anyway
      let settings: UserSettings = {
        defaultView,
        currency
      };
      
      // Only add weeklyTarget if user is a freelancer
      if (user?.role !== 'viewer') {
        // Validate weekly target is a positive number
        const weeklyTargetNum = parseInt(weeklyTarget);
        if (isNaN(weeklyTargetNum) || weeklyTargetNum < 1) {
          throw new Error('Weekly target must be a positive number');
        }
        settings.weeklyTarget = weeklyTargetNum;
      }
      
      const response = await fetchWithAuth('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ settings }),
      });
      
      if (!response || !response.ok) {
        const data = await response?.json();
        throw new Error(data?.message || 'Failed to update display settings');
      }
      
      toast({
        title: "Display Settings Updated",
        description: "Your display preferences have been updated."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update display settings."
      });
    } finally {
      setIsDisplaySaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account and application preferences
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p>Loading settings...</p>
        </div>
      ) : (
        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your account profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isProfileSaving}>
                    {isProfileSaving ? "Saving..." : "Save Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="password" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isPasswordChanging}>
                    {isPasswordChanging ? "Changing..." : "Change Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Display Preferences</CardTitle>
                <CardDescription>
                  Customize your Yoodule Upwork Proposal Tracker experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleDisplaySave} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weekly-target">Weekly Proposal Target</Label>
                      <Input
                        id="weekly-target"
                        type="number"
                        min="1"
                        placeholder="10"
                        value={weeklyTarget}
                        onChange={(e) => setWeeklyTarget(e.target.value)}
                        disabled={user?.role === 'viewer'}
                      />
                      <p className="text-sm text-muted-foreground">
                        {user?.role === 'viewer' 
                          ? "Only freelancers can set weekly proposal targets" 
                          : "Set your weekly goal for proposal submissions"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="default-view">Default View</Label>
                      <Select 
                        value={defaultView} 
                        onValueChange={setDefaultView}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select default view" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="list">List View</SelectItem>
                          <SelectItem value="grid">Grid View</SelectItem>
                          <SelectItem value="calendar">Calendar View</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={currency} 
                        onValueChange={setCurrency}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" disabled={isDisplaySaving}>
                    {isDisplaySaving ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
