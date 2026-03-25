"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LifeBuoy, Mail, MessageSquare, Send, User } from "lucide-react";

import { fetchSupportMessages } from "@/lib/api/travel-buddy";
import type { SupportMessage } from "@/lib/api/types";
import { apiRequest } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  subject: z.string().min(1, "Please select a subject."),
  message: z.string().min(10, "Message must be at least 10 characters long."),
});

type FormValues = z.infer<typeof formSchema>;

export default function SupportPage() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  // Auto-send support message to backend while the user is typing.
  // This is debounced + throttled to avoid flooding emails/DB.
  const messageValue = form.watch("message");
  const nameValue = form.watch("name");
  const emailValue = form.watch("email");
  const subjectValue = form.watch("subject");
  const lastAutoSendRef = useRef<{ atMs: number; lastPayloadKey: string }>({
    atMs: 0,
    lastPayloadKey: "",
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMessages() {
      try {
        const rows = await fetchSupportMessages();
        if (!cancelled) {
          setMessages(rows);
        }
      } catch {
        if (!cancelled) {
          setMessages([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingMessages(false);
        }
      }
    }

    loadMessages();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const name = (nameValue ?? "").trim();
    const email = (emailValue ?? "").trim();
    const subject = (subjectValue ?? "").trim();
    const message = (messageValue ?? "").toString();

    const emailOk = z.string().email().safeParse(email).success;
    const shouldAutoSend = !form.formState.isSubmitting &&
      name.length >= 2 &&
      emailOk &&
      subject.length >= 1 &&
      message.trim().length >= 1;

    if (!shouldAutoSend) return;

    // Debounce typing.
    const handle = window.setTimeout(async () => {
      const payloadKey = `${name}|${email}|${subject}|${message}`;
      const now = Date.now();
      const last = lastAutoSendRef.current;

      // Throttle + dedupe identical payloads.
      if (payloadKey === last.lastPayloadKey) return;
      if (now - last.atMs < 10_000) return;

      lastAutoSendRef.current = { atMs: now, lastPayloadKey: payloadKey };

      try {
        await apiRequest("/support", {
          method: "POST",
          json: { name, email, subject, message },
        });
      } catch {
        // Keep typing UX smooth; final "Send Details" still shows error via toast.
      }
    }, 1500);

    return () => window.clearTimeout(handle);
  }, [messageValue, nameValue, emailValue, subjectValue, form.formState.isSubmitting]);

  async function onSubmit(values: FormValues) {
    try {
      const res = await apiRequest<{ id: number; status: string }>("/support", {
        method: "POST",
        json: values,
      });
      const status = res?.status ?? "UNKNOWN";
      toast({
        title: status === "EMAIL_SENT" ? "Message Sent!" : "Message Received!",
        description:
          status === "EMAIL_SENT"
            ? "Thanks for reaching out. We'll get back to you shortly."
            : `Your message was saved. Email status: ${status}.`,
      });
      const rows = await fetchSupportMessages();
      setMessages(rows);
      form.reset();
    } catch (e) {
      toast({
        title: "Submission failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card className="shadow-lg border-2 border-primary/10">
        <CardHeader className="text-center">
          <LifeBuoy className="mx-auto h-16 w-16 text-primary mb-4" />
          <CardTitle className="text-3xl font-headline">Need help? Tell me what is stuck.</CardTitle>
          <CardDescription>
            If something is not working, a route looks wrong, or you want a better travel suggestion, send the details here and I will check it properly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="Your Name" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input placeholder="you@example.com" {...field} className="pl-10" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason for contacting us" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="general-inquiry">General question</SelectItem>
                        <SelectItem value="booking-issue">Trip or booking issue</SelectItem>
                        <SelectItem value="technical-problem">Something is not working</SelectItem>
                        <SelectItem value="feedback">Suggestion or feedback</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Write the issue in your own words. For example: what page you opened, what you expected, and what actually happened."
                        rows={6}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full text-lg py-6" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Send Details
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="mt-8 shadow-lg border border-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Support Messages</CardTitle>
          <CardDescription>
            These are the support requests currently saved by the app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingMessages ? (
            <p className="text-sm text-muted-foreground">Loading support messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No support messages saved yet.</p>
          ) : (
            messages.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-primary/10 bg-card/70 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{item.subject}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.name} · {item.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{item.status}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.message}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
