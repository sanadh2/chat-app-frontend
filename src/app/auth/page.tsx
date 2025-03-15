import AuthForm from "@/components/AuthForm";
import { z } from "zod";

const searchParamsSchema = z.object({
  action: z.enum(["login", "register"]),
});

export default async function page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const rawParams = await searchParams;
  const parsedResult = searchParamsSchema.safeParse(rawParams);

  const params = parsedResult.success ? parsedResult.data.action : "login";
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <AuthForm action={params} />
    </div>
  );
}
