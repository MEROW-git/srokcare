import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/authService'
import { useAuth } from '@/contexts/AuthContext'
import type { MfaSetupResponse } from '@/types/auth'

export function MfaSettings() {
  const { replaceAuth } = useAuth()
  const [enabled, setEnabled] = useState<boolean | null>(null)
  const [setup, setSetup] = useState<MfaSetupResponse | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    authService.getMfaStatus().then(setEnabled).catch(() => toast.error('Could not load authenticator status.'))
  }, [])

  const begin = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      setSetup(await authService.beginMfaSetup(password))
      setPassword('')
      setCode('')
      setRecoveryCodes([])
    } catch {
      toast.error('Could not start setup. Check your password and backend MFA configuration.')
    } finally {
      setBusy(false)
    }
  }

  const confirm = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      const result = await authService.confirmMfaSetup(code.trim())
      replaceAuth(result.auth)
      setRecoveryCodes(result.recoveryCodes)
      setSetup(null)
      setCode('')
      setEnabled(true)
      toast.success('Authenticator enabled.')
    } catch {
      toast.error('The code was incorrect or setup expired. Check your phone clock and try again.')
    } finally {
      setBusy(false)
    }
  }

  const disable = async (event: React.FormEvent) => {
    event.preventDefault()
    setBusy(true)
    try {
      replaceAuth(await authService.disableMfa(password, code.trim()))
      setEnabled(false)
      setPassword('')
      setCode('')
      setRecoveryCodes([])
      toast.success('Authenticator disabled.')
    } catch {
      toast.error('Could not disable authenticator. Check your password and code.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="bg-white dark:bg-slate-900 rounded-md border border-slate-300 dark:border-slate-800 shadow-2xs p-6 sm:p-8 space-y-5 transition-colors duration-150">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-sm bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-900 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">Authenticator App (Two-Factor MFA)</h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
            Protect your civic reporting identity with an authenticator application (TOTP). No phone number or SMS required.
          </p>
        </div>
      </div>

      {enabled === null && <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading authentication status...</p>}

      {enabled === false && !setup && (
        <form onSubmit={begin} className="space-y-3.5 max-w-md pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Verify your password to initialize authenticator pairing:</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Account password"
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden font-medium"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-sm bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 border border-blue-950 dark:border-blue-500 transition-colors"
          >
            {busy ? 'Initializing...' : 'Set Up Authenticator'}
          </button>
        </form>
      )}

      {enabled === false && setup && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            Scan this QR code with Google Authenticator, Microsoft Authenticator, Aegis, or any TOTP client:
          </p>
          <div className="inline-block p-3 bg-white border border-slate-300 dark:border-slate-700 rounded-sm shadow-2xs">
            <QRCodeSVG value={setup.otpauthUri} size={168} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">Manual Setup Key</p>
            <code className="inline-block max-w-full break-all select-all text-xs bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xs px-3 py-1.5 font-mono text-slate-800 dark:text-slate-200">
              {setup.secret}
            </code>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Pairing expires in 10 minutes. Keep this key strictly confidential.</p>
          <form onSubmit={confirm} className="space-y-3 max-w-md">
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="Six-digit code (e.g. 123456)"
              required
              pattern="[0-9]{6}"
              className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden font-mono tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-sm bg-blue-800 hover:bg-blue-900 dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 border border-blue-950 dark:border-blue-500 transition-colors"
            >
              {busy ? 'Verifying...' : 'Verify and Enable MFA'}
            </button>
          </form>
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="rounded-sm border border-amber-300 dark:border-amber-800 bg-amber-50/80 dark:bg-amber-950/40 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">Emergency Recovery Codes</h3>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Store these one-time recovery codes in a secure password manager. Each code can be used once if your authenticator device is lost:
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm font-mono text-xs">
            {recoveryCodes.map((item) => (
              <code key={item} className="bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900 rounded-xs px-2 py-1 text-center font-bold text-slate-800 dark:text-slate-200">
                {item}
              </code>
            ))}
          </div>
          <button
            type="button"
            onClick={() =>
              navigator.clipboard
                .writeText(recoveryCodes.join('\n'))
                .then(() => toast.success('Recovery codes copied.'))
                .catch(() => toast.error('Could not copy codes.'))
            }
            className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-400 hover:text-blue-950 dark:hover:text-blue-300 underline"
          >
            Copy all recovery codes
          </button>
        </div>
      )}

      {enabled === true && (
        <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-xs bg-emerald-600" />
            <span>Authenticator MFA is active and protecting your session.</span>
          </div>
          <form onSubmit={disable} className="space-y-3 max-w-md pt-2">
            <p className="text-xs text-slate-600 dark:text-slate-400">To disable MFA, confirm your password and a current 6-digit code:</p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Account password"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden font-medium"
            />
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              maxLength={32}
              placeholder="Current 6-digit or recovery code"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-800 dark:focus:border-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-hidden font-mono"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-sm border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
            >
              {busy ? 'Processing...' : 'Disable Authenticator'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
