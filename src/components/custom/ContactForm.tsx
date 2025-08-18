"use client";

import { useState } from "react";
import { useForm, ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SendIcon } from "lucide-react";

const createFormSchema = (t: (key: string) => string) => z.object({
  name: z.string().min(2, t("contact.form.validation.nameMin")),
  email: z.string().email(t("contact.form.validation.emailInvalid")),
  company: z.string().min(1, t("contact.form.validation.companyRequired")),
  description: z.string().min(10, t("contact.form.validation.descriptionMin")),
});

type FormData = {
  name: string;
  email: string; 
  company: string;
  description: string;
};

export default function ContactForm() {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formSchema = createFormSchema(t);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      company: "",
      description: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success(t("contact.form.messages.success"));
        form.reset();
      } else {
        throw new Error(t("contact.form.messages.errorSending"));
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(t("contact.form.messages.errorGeneral"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full lg:w-1/2 bg-white p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }: { field: ControllerRenderProps<FormData, "name"> }) => (
              <FormItem>
                <FormLabel>{t("contact.form.name")}</FormLabel>
                <FormControl>
                  <Input className="rounded-none !bg-white" placeholder={t("contact.form.placeholders.name")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }: { field: ControllerRenderProps<FormData, "email"> }) => (
              <FormItem>
                <FormLabel>{t("contact.form.email")}</FormLabel>
                <FormControl>
                  <Input className="rounded-none !bg-white" type="email" placeholder={t("contact.form.placeholders.email")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="company"
            render={({ field }: { field: ControllerRenderProps<FormData, "company"> }) => (
              <FormItem>
                <FormLabel>{t("contact.form.company")}</FormLabel>
                <FormControl>
                  <Input className="rounded-none !bg-white" placeholder={t("contact.form.placeholders.company")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }: { field: ControllerRenderProps<FormData, "description"> }) => (
              <FormItem>
                <FormLabel>{t("contact.form.description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("contact.form.placeholders.description")}
                    className="min-h-24 rounded-none !bg-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
                type="submit"
                className="w-full lg:max-w-[180px] bg-ipec-blue hover:bg-hover-ipec-blue text-lg text-white cursor-pointer rounded-none !px-6 py-3 flex items-center justify-between !h-auto ml-auto"
                disabled={isSubmitting}
            >
                {isSubmitting ? t("contact.form.submitting") : t("contact.form.submit")}
                <SendIcon className="!w-6 !h-6" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}