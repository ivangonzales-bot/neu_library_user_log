import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { BookOpen, Lock, Mail, GraduationCap, Shield } from 'lucide-react';
import type { UserRole } from '@/lib/mockData';

const ROLE_OPTIONS: { value: UserRole; label: string; icon: typeof GraduationCap; description: string }[] = [
  { value: 'user', label: 'Student', icon: GraduationCap, description: 'Log your library visits' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Full dashboard access' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith('@neu.edu.ph')) {
      setError('Please use your NEU email (@neu.edu.ph)');
      return;
    }
    if (role === 'admin' && password.length < 4) {
      setError('Please enter a valid password');
      return;
    }
    const success = login(email, password, role);
    if (!success) {
      setError('Only admin emails (containing ".admin") or jcesperanza@neu.edu.ph can sign in as Admin');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md px-4"
      >
        <Card className="border-0 shadow-2xl shadow-primary/10 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary via-primary to-accent" />
          <CardHeader className="text-center pt-10 pb-2 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
            >
              <BookOpen className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-bold text-foreground tracking-tight">NEU Library</h1>
              <p className="text-muted-foreground mt-1 font-sans text-sm">Visitor Log System</p>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-10 pt-4">
            {/* Role Switcher */}
            <div className="mb-6">
              <label className="text-sm font-medium font-sans text-foreground mb-2 block">Sign in as</label>
              <div className="grid grid-cols-2 gap-3">
                {ROLE_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = role === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setRole(opt.value); setError(''); }}
                      className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all duration-200 font-sans ${
                        isActive
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border bg-card hover:border-muted-foreground/30 hover:bg-muted/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium font-sans text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@neu.edu.ph"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    className="pl-10 h-11 font-sans"
                  />
                </div>
                {role === 'admin' && (
                  <p className="text-xs text-muted-foreground font-sans">
                    Admin emails must contain ".admin" (e.g. miguel.admin@neu.edu.ph)
                  </p>
                )}
              </div>
              {role === 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium font-sans text-foreground">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(''); }}
                      className="pl-10 h-11 font-sans"
                    />
                  </div>
                </div>
              )}
              {error && (
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-destructive font-sans"
                >
                  {error}
                </motion.p>
              )}
              <Button type="submit" className="w-full h-11 font-sans font-semibold text-base shadow-lg shadow-primary/20">
                Sign In
              </Button>
            </form>
            <p className="text-xs text-center text-muted-foreground mt-6 font-sans">
              Use your NEU institutional email to log in
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
