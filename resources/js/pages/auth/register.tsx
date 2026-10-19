import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TeamInvitationAlert from '@/components/team-invitation-alert';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { store } from '@/routes/register';
import type { TeamInvitationContext } from '@/types';
import { ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

type Props = {
    passwordRules: string;
    teamInvitation?: TeamInvitationContext | null;
};

export default function Register({ passwordRules, teamInvitation }: Props) {
    return (
        <>
            <Head title="Daftar Akun Customer - Stockify" />

            {/* Customer Role Badge Notification */}
            <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Registrasi Akun Customer</span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-200 text-blue-900 dark:bg-blue-800 dark:text-blue-200">Pembeli</span>
                    </div>
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 mt-0.5 leading-relaxed">
                        Akun Anda akan otomatis didaftarkan sebagai <strong>Customer</strong> untuk berbelanja produk gudang dan pengajuan refund.
                    </p>
                </div>
            </div>

            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-5 mt-2"
            >
                {({ processing, errors }) => (
                    <>
                        {teamInvitation && (
                            <TeamInvitationAlert
                                invitation={teamInvitation}
                                action="Register"
                            />
                        )}

                        <div className="grid gap-4">
                            <div className="grid gap-1.5">
                                <Label htmlFor="name" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nama Lengkap</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Contoh: Ahmad Customer"
                                    className="rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-1"
                                />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="email" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Alamat Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                                <PasswordInput
                                    id="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Minimal 8 karakter"
                                    passwordrules={passwordRules}
                                    className="rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>

                            <div className="grid gap-1.5">
                                <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                    Konfirmasi Password
                                </Label>
                                <PasswordInput
                                    id="password_confirmation"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Ulangi password"
                                    passwordrules={passwordRules}
                                    className="rounded-xl border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                    className="mt-1"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg"
                                tabIndex={5}
                                data-test="register-user-button"
                            >
                                {processing ? (
                                    <span className="flex items-center gap-2">
                                        <Spinner /> Mendaftarkan...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-1.5">
                                        Daftar Sekarang Sebagai Customer <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </div>

                        <div className="text-center text-xs text-muted-foreground pt-2">
                            Sudah memiliki akun?{' '}
                            <TextLink
                                href={
                                    teamInvitation
                                        ? login.url({
                                              query: {
                                                  invitation:
                                                      teamInvitation.code,
                                              },
                                          })
                                        : login()
                                }
                                data-test="team-invitation-login-link"
                                tabIndex={6}
                                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                            >
                                Masuk ke Sistem
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Daftar Akun Baru (Customer)',
    description: 'Registrasi khusus pelanggan untuk berbelanja di Stockify',
};
