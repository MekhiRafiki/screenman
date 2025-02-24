interface ButtonGroupProps {
	value: string
	onChange: (value: string) => void
	options: string[]
}

export default function ButtonGroup({
	value,
	onChange,
	options,
}: ButtonGroupProps) {
	return (
		<div className="inline-flex rounded-xl bg-[#1E1E1E] p-1.5">
			{options.map((option) => (
				<button
					key={option}
					onClick={() => onChange(option)}
					className={`
            px-8 py-3 text-base font-semibold transition-all duration-200 rounded-lg
            ${
							value === option
								? "bg-[#7B7EF4] text-white shadow-lg"
								: "text-gray-300 hover:text-white hover:bg-white/5"
						}
          `}
				>
					{option}
				</button>
			))}
		</div>
	)
}
