import { formatMoneyInput } from '../../domain/money';
import { inputClass } from './Field';

// Máscara estilo caixa eletrônico: os dígitos digitados são centavos.
export default function MoneyInput({ id, cents, onChange, invalid }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[15px] text-ink-3">R$</span>
      <input
        id={id}
        inputMode="numeric"
        autoComplete="off"
        placeholder="0,00"
        aria-invalid={invalid || undefined}
        className={`${inputClass} pl-11 text-right tabular-nums`}
        value={cents ? formatMoneyInput(cents) : ''}
        onChange={(event) => {
          const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
          onChange(digits ? Number(digits) : 0);
        }}
      />
    </div>
  );
}
