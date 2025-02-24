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
		<div className="inline-flex rounded-lg bg-[#1E1E1E] p-1">
			{options.map((option) => (
				<button
					key={option}
					onClick={() => onChange(option)}
					className={`
            px-6 py-2 text-sm font-medium transition-all duration-200
            ${
							value === option
								? "bg-[#7B7EF4] text-white rounded-md"
								: "text-gray-300 hover:text-white"
						}
          `}
				>
					{option}
				</button>
			))}
		</div>
	)
}
