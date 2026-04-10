export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-leaf-600 hover:bg-leaf-500 text-white focus:ring-leaf-500',
    secondary: 'bg-ink-700 hover:bg-ink-600 text-white focus:ring-ink-500',
    danger: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
    ghost: 'text-ink-300 hover:text-white hover:bg-ink-700 focus:ring-ink-500',
    outline: 'border border-ink-600 text-ink-200 hover:bg-ink-700 focus:ring-ink-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

export function Input({ label, error, icon: Icon, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink-200">{label}</label>}
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          className={`w-full bg-ink-800 border ${
            error ? 'border-red-500' : 'border-ink-600'
          } text-white placeholder-ink-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-colors ${
            Icon ? 'pl-10' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink-200">{label}</label>}
      <select
        className={`w-full bg-ink-800 border ${
          error ? 'border-red-500' : 'border-ink-600'
        } text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-colors ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-medium text-ink-200">{label}</label>}
      <textarea
        className={`w-full bg-ink-800 border ${
          error ? 'border-red-500' : 'border-ink-600'
        } text-white placeholder-ink-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-transparent transition-colors min-h-[96px] ${className}`}
        {...props}
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  );
}

export function Toggle({ label, description, checked, onChange }) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-xl border border-ink-700 bg-ink-900/40 px-4 py-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        {description && <p className="text-xs text-ink-400 mt-1">{description}</p>}
      </div>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-leaf-500' : 'bg-ink-600'
        }`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(event) => onChange?.(event.target.checked)}
        />
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
    </label>
  );
}

export function Card({ children, className = '', ...props }) {
  return (
    <div className={`bg-ink-800 border border-ink-700 rounded-xl p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-ink-700 text-ink-200',
    success: 'bg-leaf-900/50 text-leaf-400 border border-leaf-700/50',
    warning: 'bg-amber-900/50 text-amber-400 border border-amber-700/50',
    danger: 'bg-red-900/40 text-red-300 border border-red-700/40',
    info: 'bg-blue-900/40 text-blue-300 border border-blue-700/40',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StatCard({ label, value, icon: Icon, color = 'leaf', description }) {
  const colors = {
    leaf: 'text-leaf-400 bg-leaf-400/10',
    amber: 'text-amber-400 bg-amber-400/10',
    blue: 'text-blue-400 bg-blue-400/10',
    red: 'text-red-400 bg-red-400/10',
  };

  return (
    <Card className="flex items-start gap-4">
      <div className={`p-2.5 rounded-lg ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-ink-400 text-xs font-medium uppercase tracking-wide">{label}</p>
        <p className="text-white text-2xl font-bold font-mono mt-0.5">{value}</p>
        {description && <p className="text-ink-400 text-xs mt-1">{description}</p>}
      </div>
    </Card>
  );
}

