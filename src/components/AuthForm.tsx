"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/utils/axiosInstance";
import Link from "next/link";
import { useCallback } from "react";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type Schema = z.infer<typeof loginSchema>;

export default function AuthForm({ action }: { action: "login" | "register" }) {
  const form = useForm<Schema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  console.log(action);

  const onSubmit = async (data: Schema) => {
    try {
      const res = await axiosInstance.post(
        action == "login" ? "/auth/login" : "/auth/register",
        data,
        {
          withCredentials: true,
        }
      );
      action == "login" ? router.replace("/chat") : router.replace("/login");

      toast.success(
        action == "login"
          ? "Login successful... Redirecting to dashboard"
          : "user created... redirecting to login page",
        {
          richColors: true,
        }
      );
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.msg || "Something went wrong!";
      toast.error(
        action == "login"
          ? `Login failed... ${errorMessage}`
          : `user creation failed... ${errorMessage}`,
        {
          richColors: true,
        }
      );
      console.error(error);
    } finally {
      form.reset();
    }
  };

  const handleAuthAction = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("action", action == "login" ? "register" : "login");
    router.push(url.toString());
    router.refresh();
  }, [action]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 border rounded-md p-8"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <input
                  className="border px-3 rounded h-10  outline-neutral-500"
                  placeholder="mythical-warrior123"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
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
                <input
                  className="border px-3 rounded h-10 outline-neutral-500"
                  placeholder="********"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your password must be at least 8 characters long.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between items-center">
          <Button
            disabled={form.formState.isSubmitting}
            type="submit"
            className=""
          >
            {action == "login"
              ? form.formState.isSubmitting
                ? "Logging in..."
                : "Login"
              : form.formState.isSubmitting
              ? "Registering..."
              : "Register"}
          </Button>
          <Button type="button" variant={"link"} onClick={handleAuthAction}>
            {action !== "login" ? "Login" : "Register"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
