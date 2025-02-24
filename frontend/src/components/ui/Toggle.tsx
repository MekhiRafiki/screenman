interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  leftLabel?: string;
  rightLabel?: string;
}

export default function Toggle({ checked, onChange, leftLabel, rightLabel }: ToggleProps) {
  return (
    <div className="flex items-center gap-3">
      {leftLabel && (
        <span 
          className={`text-white font-medium cursor-pointer ${!checked ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => onChange(false)}
        >
          {leftLabel}
        </span>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`
          relative inline-flex h-8 w-14 items-center rounded-full
          transition-colors duration-200 ease-in-out focus:outline-none
          ${checked ? 'bg-white' : 'bg-white'}
        `}
        onClick={() => onChange(!checked)}
      >
        <span
          className={`
            inline-block h-6 w-6 transform rounded-full bg-[#060CE9]
            transition duration-200 ease-in-out
            ${checked ? 'translate-x-7' : 'translate-x-1'}
          `}
        />
      </button>
      {rightLabel && (
        <span 
          className={`text-white font-medium cursor-pointer ${checked ? 'opacity-100' : 'opacity-50'}`}
          onClick={() => onChange(true)}
        >
          {rightLabel}
        </span>
      )}
    </div>
  );
}
