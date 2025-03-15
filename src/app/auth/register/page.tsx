import AuthForm from "@/components/AuthForm";

export default function page() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <AuthForm action="register" />
    </div>
  );
}
