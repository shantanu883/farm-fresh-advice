import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Mail, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { z } from "zod";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const emailSchema = z.string().email("Invalid email address");

const Auth = () => {
  const navigate = useNavigate();
  const { user, signInWithOtp, verifyOtp, loading } = useAuth();
  const { t } = useLanguage();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const { error } = await signInWithOtp(email);
      if (error) {
        setError(error.message);
      } else {
        setStep("otp");
        setResendCountdown(60);
      }
    } catch (err) {
      setError(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError(t("enterValidOtp"));
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await verifyOtp(email, otp);
      if (error) {
        if (error.message.includes("Token has expired") || error.message.includes("invalid")) {
          setError(t("otpExpiredOrInvalid"));
        } else {
          setError(error.message);
        }
      }
    } catch (err) {
      setError(t("unexpectedError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    
    setError("");
    setIsSubmitting(true);

    try {
      const { error } = await signInWithOtp(email);
      if (error) {
        setError(error.message);
      } else {
        setResendCountdown(60);
        setOtp("");
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
          onClick={() => step === "otp" ? setStep("email") : navigate("/welcome")}
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
            {step === "email" ? (
              <>
                <h2 className="mb-2 text-center text-farmer-xl font-semibold text-foreground">
                  {t("loginOrSignUp")}
                </h2>
                <p className="mb-6 text-center text-farmer-sm text-muted-foreground">
                  {t("otpDescription")}
                </p>

                <form onSubmit={handleSendOtp} className="space-y-4">
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
                      autoFocus
                    />
                  </div>

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
                    {isSubmitting ? t("pleaseWait") : t("sendOtp")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h2 className="mb-2 text-center text-farmer-xl font-semibold text-foreground">
                  {t("enterOtp")}
                </h2>
                <p className="mb-6 text-center text-farmer-sm text-muted-foreground">
                  {t("otpSentTo")} <span className="font-medium text-foreground">{email}</span>
                </p>

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* OTP Input */}
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      disabled={isSubmitting}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="h-12 w-12 text-farmer-lg" />
                        <InputOTPSlot index={1} className="h-12 w-12 text-farmer-lg" />
                        <InputOTPSlot index={2} className="h-12 w-12 text-farmer-lg" />
                        <InputOTPSlot index={3} className="h-12 w-12 text-farmer-lg" />
                        <InputOTPSlot index={4} className="h-12 w-12 text-farmer-lg" />
                        <InputOTPSlot index={5} className="h-12 w-12 text-farmer-lg" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

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
                    disabled={isSubmitting || otp.length !== 6}
                  >
                    {isSubmitting ? t("pleaseWait") : t("verifyAndLogin")}
                  </Button>

                  {/* Resend */}
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCountdown > 0 || isSubmitting}
                      className={`text-farmer-sm ${
                        resendCountdown > 0 
                          ? "text-muted-foreground" 
                          : "text-primary hover:underline"
                      }`}
                    >
                      {resendCountdown > 0 
                        ? `${t("resendOtpIn")} ${resendCountdown}s`
                        : t("resendOtp")
                      }
                    </button>
                  </div>
                </form>
              </>
            )}
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