import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Mail, Lock, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";

const emailSchema = z.string().email("Invalid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const Auth = () => {
  const navigate = useNavigate();
  const { user, signUp, signIn, loading } = useAuth();
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      const isOnboardingComplete = localStorage.getItem("onboardingComplete") === "true";
      if (isOnboardingComplete) {
        navigate("/");
      } else {
        navigate("/onboarding");
      }
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        setError(e.errors[0].message);
        return false;
      }
    }

    if (!isLogin && password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError(t("invalidCredentials"));
          } else {
            setError(error.message);
          }
        }
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes("User already registered")) {
            setError(t("userAlreadyExists"));
          } else {
            setError(error.message);
          }
        }
      }
    } catch (err) {
      setError(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Back Button */}
      <div className="absolute left-4 top-4 z-10">
        <button
          onClick={() => navigate("/welcome")}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/80 text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Header */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-elevated">
            <Sprout className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-farmer-2xl font-bold text-foreground">{t("appName")}</h1>
          <p className="mt-1 text-farmer-base text-muted-foreground">{t("tagline")}</p>
        </div>

        {/* Auth Card */}
        <Card className="w-full max-w-sm border-0 shadow-elevated">
          <CardContent className="p-6">
            <h2 className="mb-6 text-center text-farmer-xl font-semibold text-foreground">
              {isLogin ? t("login") : t("signUp")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-farmer-base">
                  <Mail className="h-4 w-4 text-primary" />
                  {t("email")}
                </Label>
                <Input
                  type="email"
                  placeholder={t("enterEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-farmer-base"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-farmer-base">
                  <Lock className="h-4 w-4 text-primary" />
                  {t("password")}
                </Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 text-farmer-base"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign up only) */}
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-farmer-base">
                    <Lock className="h-4 w-4 text-primary" />
                    {t("confirmPassword")}
                  </Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("reEnterPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 text-farmer-base"
                    disabled={isSubmitting}
                  />
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-farmer-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="hero"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? t("pleaseWait") : (isLogin ? t("login") : t("signUp"))}
              </Button>
            </form>

            {/* Toggle Login/Signup */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-farmer-sm text-primary hover:underline"
              >
                {isLogin ? t("dontHaveAccount") : t("alreadyHaveAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-center border-t border-border bg-muted/30 py-4">
        <p className="text-farmer-sm text-muted-foreground">{t("madeForFarmers")}</p>
      </div>
    </div>
  );
};

export default Auth;