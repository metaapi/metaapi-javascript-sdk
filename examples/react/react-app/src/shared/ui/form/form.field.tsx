export interface IFieldProps {
  label: string
  onChange: (value: string) => void
  value: string
  disabled?: boolean
}

export function Field({
  onChange, value, disabled, label
}: IFieldProps) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        onChange={({ target: { value: v } }) => onChange(v)}  
        value={value} 

        disabled={disabled}
        type="text"
      />
    </label>
  );
}
