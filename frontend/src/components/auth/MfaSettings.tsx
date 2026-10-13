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
    <section className="bg-white rounded-md border border-slate-300 shadow-2xs p-6 sm:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-sm bg-blue-50 text-blue-800 border border-blue-200 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Authenticator App (Two-Factor MFA)</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
            Protect your civic reporting identity with an authenticator application (TOTP). No phone number or SMS required.
          </p>
        </div>
      </div>

      {enabled === null && <p className="text-xs text-slate-500 font-mono">Loading authentication status...</p>}

      {enabled === false && !setup && (
        <form onSubmit={begin} className="space-y-3.5 max-w-md pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-600 font-medium">Verify your password to initialize authenticator pairing:</p>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            placeholder="Account password"
            required
            className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-800 outline-hidden font-medium"
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-sm bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 border border-blue-950 transition-colors"
          >
            {busy ? 'Initializing...' : 'Set Up Authenticator'}
          </button>
        </form>
      )}

      {enabled === false && setup && (
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            Scan this QR code with Google Authenticator, Microsoft Authenticator, Aegis, or any TOTP client:
          </p>
          <div className="inline-block p-3 bg-white border border-slate-300 rounded-sm shadow-2xs">
            <QRCodeSVG value={setup.otpauthUri} size={168} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Manual Setup Key</p>
            <code className="inline-block max-w-full break-all select-all text-xs bg-slate-100 border border-slate-300 rounded-xs px-3 py-1.5 font-mono text-slate-800">
              {setup.secret}
            </code>
          </div>
          <p className="text-[11px] text-slate-500">Pairing expires in 10 minutes. Keep this key strictly confidential.</p>
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
              className="w-full px-3.5 py-2 text-sm rounded-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-800 outline-hidden font-mono tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-sm bg-blue-800 hover:bg-blue-900 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-50 border border-blue-950 transition-colors"
            >
              {busy ? 'Verifying...' : 'Verify and Enable MFA'}
            </button>
          </form>
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="rounded-sm border border-amber-300 bg-amber-50/80 p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">Emergency Recovery Codes</h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Store these one-time recovery codes in a secure password manager. Each code can be used once if your authenticator device is lost:
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm font-mono text-xs">
            {recoveryCodes.map((item) => (
              <code key={item} className="bg-white border border-amber-200 rounded-xs px-2 py-1 text-center font-bold text-slate-800">
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
            className="text-xs font-bold uppercase tracking-wider text-blue-900 hover:text-blue-950 underline"
          >
            Copy all recovery codes
          </button>
        </div>
      )}

      {enabled === true && (
        <div className="space-y-4 pt-2 border-t border-slate-200">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <span className="w-2 h-2 rounded-xs bg-emerald-600" />
            <span>Authenticator MFA is active and protecting your session.</span>
          </div>
          <form onSubmit={disable} className="space-y-3 max-w-md pt-2">
            <p className="text-xs text-slate-600">To disable MFA, confirm your password and a current 6-digit code:</p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              placeholder="Account password"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-800 outline-hidden font-medium"
            />
            <input
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code"
              maxLength={32}
              placeholder="Current 6-digit or recovery code"
              required
              className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-sm bg-slate-50 focus:bg-white border border-slate-300 focus:border-blue-800 outline-hidden font-mono"
            />
            <button
              type="submit"
              disabled={busy}
              className="px-4 py-2 rounded-sm border border-rose-300 bg-white text-rose-800 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider disabled:opacity-50 transition-colors"
            >
              {busy ? 'Processing...' : 'Disable Authenticator'}
            </button>
          </form>
        </div>
      )}
    </section>
  )
}

