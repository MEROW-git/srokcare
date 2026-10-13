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
    <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-5">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-blue-600 mt-0.5" />
        <div>
          <h2 className="text-lg font-bold text-slate-900">Authenticator app</h2>
          <p className="text-sm text-slate-600 mt-1">
            Add a second sign-in step using an app on your phone. Codes work without SMS.
          </p>
        </div>
      </div>

      {enabled === null && <p className="text-sm text-slate-500">Loading status...</p>}

      {enabled === false && !setup && (
        <form onSubmit={begin} className="space-y-3 max-w-md">
          <p className="text-sm text-slate-600">Enter your password to start setup.</p>
          <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password" placeholder="Current password" required
            className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden" />
          <button type="submit" disabled={busy}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">
            Set up authenticator
          </button>
        </form>
      )}

      {enabled === false && setup && (
        <div className="space-y-5">
          <p className="text-sm text-slate-700">
            Scan this QR code with Google Authenticator, Microsoft Authenticator, or another TOTP app.
            You can also enter the setup key manually.
          </p>
          <div className="inline-block p-4 bg-white border border-slate-200 rounded-2xl">
            <QRCodeSVG value={setup.otpauthUri} size={184} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">Manual setup key</p>
            <code className="inline-block max-w-full break-all select-all text-sm bg-slate-100 rounded-lg px-3 py-2">
              {setup.secret}
            </code>
          </div>
          <p className="text-xs text-slate-500">This setup expires in 10 minutes. Keep the key private.</p>
          <form onSubmit={confirm} className="space-y-3 max-w-md">
            <input value={code} onChange={(event) => setCode(event.target.value)}
              inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              placeholder="Six-digit code" required pattern="[0-9]{6}"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden font-mono tracking-widest" />
            <button type="submit" disabled={busy}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold disabled:opacity-50">
              Verify and enable
            </button>
          </form>
        </div>
      )}

      {recoveryCodes.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-3">
          <h3 className="font-bold text-amber-950">Save your recovery codes now</h3>
          <p className="text-sm text-amber-900">
            Each code works once if you lose your phone. They are shown only now and cannot be retrieved later.
          </p>
          <div className="grid grid-cols-2 gap-2 max-w-sm font-mono text-sm">
            {recoveryCodes.map((item) => <code key={item} className="bg-white rounded-lg px-2 py-1.5">{item}</code>)}
          </div>
          <button type="button" onClick={() => navigator.clipboard.writeText(recoveryCodes.join('\n'))
            .then(() => toast.success('Recovery codes copied. Store them securely.'))
            .catch(() => toast.error('Could not copy codes. Select them manually.'))}
            className="text-sm font-bold text-blue-700 hover:underline">Copy recovery codes</button>
        </div>
      )}

      {enabled === true && (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-emerald-700">Authenticator is enabled.</p>
          <form onSubmit={disable} className="space-y-3 max-w-md border-t border-slate-100 pt-4">
            <p className="text-sm text-slate-600">To turn it off, enter your password and a current app or recovery code.</p>
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password" placeholder="Current password" required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden" />
            <input value={code} onChange={(event) => setCode(event.target.value)}
              autoComplete="one-time-code" maxLength={32} placeholder="Authenticator or recovery code" required
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-blue-500 outline-hidden font-mono" />
            <button type="submit" disabled={busy}
              className="px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-bold disabled:opacity-50">
              Disable authenticator
            </button>
          </form>
        </div>
      )}
    </section>
  )
}
