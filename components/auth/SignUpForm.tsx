"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { registerSchema } from "@/lib/validations/auth";
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

type SignUpFormValues = z.infer<typeof registerSchema>;

const SignUpForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: SignUpFormValues) {
    startTransition(async () => {
      try {
        const response = await fetch("/api/auth/sign-up", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();
        console.log("Response data:", data); // Debug log

        if (!response.ok) {
          // If we have field-specific errors
          if (data.fieldErrors) {
            Object.entries(data.fieldErrors).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                form.setError(key as keyof SignUpFormValues, {
                  message: value[0],
                });
              }
            });
            // Show the first error in a toast
            const firstError = Object.values(data.fieldErrors)[0];
            if (Array.isArray(firstError) && firstError.length > 0) {
              toast.error(firstError[0]);
            }
            return;
          }

          // If we have a general error message
          if (data.error) {
            toast.error(data.error);
            return;
          }

          throw new Error("Something went wrong");
        }

        toast.success(data.message || "Account created successfully!");
        form.reset();
        router.push("/sign-in");
      } catch (error) {
        console.error("Sign up error:", error);
        toast.error(
          error instanceof Error ? error.message : "Something went wrong",
        );
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Name"
                  {...field}
                  disabled={isPending}
                  className="focus:ring-primary border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="you@example.com"
                  type="email"
                  {...field}
                  disabled={isPending}
                  className="focus:ring-primary border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  disabled={isPending}
                  className="focus:ring-primary border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </FormControl>
              {/* <FormDescription className="text-xs text-gray-500">
                Password must be at least 8 characters and contain: uppercase
                letter, lowercase letter, number, and special character
                (@$!%*?&)
              </FormDescription> */}
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...field}
                  disabled={isPending}
                  className="focus:ring-primary border-gray-400 bg-white text-gray-900 placeholder:text-gray-400"
                />
              </FormControl>
              <FormMessage className="text-red-500" />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 text-primary-foreground w-full"
          disabled={isPending}
        >
          {isPending ? "Creating Account..." : "Sign Up"}
        </Button>
      </form>
    </Form>
  );
};

export default SignUpForm;
