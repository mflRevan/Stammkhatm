import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/I18nContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';

export function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.email) {
      navigate('/verify-otp', { state: { email: result.email } });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in-up shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-2xl text-primary-foreground font-serif">ق</span>
            </div>
          </div>
          <CardTitle className="text-xl">{t.register}</CardTitle>
          <CardDescription>
            {t.appName} – {t.orgName}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm animate-fade-in border border-destructive/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.name}</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.namePlaceholder} required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.email}</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.password}</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                required
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t.loading : t.registerButton}
            </Button>
            <p className="text-sm text-muted-foreground">
              {t.alreadyHaveAccount}{' '}
              <Link to="/login" className="text-primary hover:underline font-medium transition-colors duration-200">
                {t.loginHere}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
