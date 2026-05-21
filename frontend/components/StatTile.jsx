export default function StatTile({ icon: Icon, bgClass, iconClass, label, value, subtle }) {
  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 shadow-soft hover:-translate-y-0.5 transition">
      <div className={`w-10 h-10 rounded-xl ${bgClass} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${iconClass}`} />
      </div>
      <div className="text-xs md:text-sm text-gray-500 mb-1">{label}</div>
      <div className="font-display text-xl md:text-2xl font-bold text-gray-800">{value}</div>
      {subtle && <div className="text-xs text-gray-400 mt-1">{subtle}</div>}
    </div>
  );
}
