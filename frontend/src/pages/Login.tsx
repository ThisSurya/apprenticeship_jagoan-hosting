import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import type { LoginResponse } from '@/types';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post<LoginResponse>('/login', {
        email,
        password,
      });

      if (response.data.success) {
        toast.success('Login berhasil!');
        login(response.data.data.user, response.data.data.token);
        navigate('/', { replace: true });
      } else {
        toast.error(response.data.message || 'Login gagal, silakan coba lagi');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Terjadi kesalahan pada server';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F9F7F7] p-4">
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3F72AF] text-white font-bold text-lg mb-4 shadow-lg shadow-[#3F72AF]/20">
            RT
          </div>
          <h1 className="text-2xl font-bold text-[#112D4E]">RT Sejahtera</h1>
          <p className="text-muted-foreground">Sistem Manajemen Iuran Warga</p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden bg-white">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl text-[#112D4E]">Selamat Datang</CardTitle>
            <CardDescription>
              Masukkan email dan password Anda untuk masuk ke dashboard admin.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border-[#DBE2EF] focus-visible:ring-[#3F72AF]/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    className="text-xs text-[#3F72AF] hover:underline"
                    tabIndex={-1}
                  >
                    Lupa password?
                  </button>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="rounded-xl border-[#DBE2EF] focus-visible:ring-[#3F72AF]/30"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="pt-2 pb-8">
              <Button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#3F72AF] hover:bg-[#3F72AF]/90 text-white font-semibold transition-all shadow-md shadow-[#3F72AF]/20"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk Sekarang
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <p className="text-center mt-8 text-sm text-muted-foreground">
          &copy; 2026 RT Sejahtera. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
