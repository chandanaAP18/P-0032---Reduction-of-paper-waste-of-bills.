import { Leaf, TreePine, Droplets, CloudSun } from 'lucide-react';
import { getEcoMetrics } from '../lib/billInsights';

export default function EcoImpact({ bills = [] }) {
  const metrics = getEcoMetrics(bills);

  return (
    <div className="bg-gradient-to-br from-leaf-900/40 to-ink-800 border border-leaf-700/40 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-leaf-500/20 rounded-lg flex items-center justify-center">
          <Leaf className="w-4 h-4 text-leaf-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Your Eco Impact</h3>
          <p className="text-ink-400 text-xs">Each digital bill reduces paper waste</p>
        </div>
      </div>

      <div className="mb-5">
        <p className="text-leaf-300 text-3xl font-bold font-mono">{metrics.digitalBills}</p>
        <p className="text-ink-300 text-sm mt-1">
          digital bills sent instead of printouts
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <ImpactBox icon={Leaf} label="Paper Saved" value={metrics.paperSavedGrams >= 1000 ? `${(metrics.paperSavedGrams / 1000).toFixed(2)} kg` : `${metrics.paperSavedGrams} g`} />
        <ImpactBox icon={Droplets} label="Water Saved" value={`${metrics.waterSavedLiters.toFixed(1)} L`} iconColor="text-blue-400" />
        <ImpactBox icon={CloudSun} label="CO2 Reduced" value={`${metrics.co2SavedKg.toFixed(2)} kg`} iconColor="text-amber-400" />
        <ImpactBox icon={TreePine} label="Tree Impact" value={`${metrics.treesEquivalent.toFixed(2)} tree eq.`} />
      </div>

      <div className="mt-4 rounded-lg border border-leaf-700/30 bg-leaf-950/30 px-3 py-2 text-xs text-leaf-100">
        {metrics.printedBills > 0
          ? `${metrics.printedBills} bill${metrics.printedBills === 1 ? '' : 's'} were still marked for print. Keeping digital-first as the default will improve your impact.`
          : 'You are running fully digital right now. Keep this default to maximize paper savings.'}
      </div>
    </div>
  );
}

function ImpactBox({ icon: Icon, label, value, iconColor = 'text-leaf-400' }) {
  return (
    <div className="bg-ink-900/50 rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-ink-400 text-xs">{label}</span>
      </div>
      <p className="text-white font-mono font-semibold text-sm">{value}</p>
    </div>
  );
}

