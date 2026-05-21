import { CheckCircle2, Circle } from 'lucide-react';

export const passwordChecks = (password) => ({
  length: password.length >= 6,
  lower: /[a-z]/.test(password),
  upper: /[A-Z]/.test(password),
  special: /[^a-zA-Z0-9]/.test(password)
});

export const isPasswordValid = (password) =>
  Object.values(passwordChecks(password)).every(Boolean);

export default function PasswordRequirements({ password }) {
  const checks = passwordChecks(password);
  const items = [
    { key: 'length', label: 'At least 6 characters' },
    { key: 'lower', label: '1 lowercase letter (a–z)' },
    { key: 'upper', label: '1 uppercase letter (A–Z)' },
    { key: 'special', label: '1 special symbol (!@#$…)' }
  ];

  return (
    <div className="mt-2 space-y-1.5 pl-1">
      {items.map(({ key, label }) => {
        const met = checks[key];
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            {met ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-mint-400 flex-shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
            )}
            <span className={met ? 'text-gray-700' : 'text-gray-400'}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}
