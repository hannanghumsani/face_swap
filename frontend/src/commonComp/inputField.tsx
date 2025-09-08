import { Form } from "react-bootstrap";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "checkbox"
    | "radio";
  controlId: string;
  divClass?: string;
  inputClass?: string;
  disabled?: boolean;
  valid?: boolean;
  invalid?: boolean;
  errorMessage?: string;
  options?: { label: string; value: string | number }[];
  name: string;
  value: any;
  required?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  // checked?: boolean;
  onChange?: any;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type = "text",
  controlId,
  divClass = "",
  inputClass = "",
  disabled = false,
  valid = false,
  invalid = false,
  errorMessage = "",
  options = [],
  onChange,
  onBlur,
  onFocus,
  value,
  placeholder = "",
  name,
  required = false,
  autoFocus = false,
  readOnly = false,
  min,
  max,
  step,
}) => {
  return (
    <Form.Group controlId={controlId} className={`mb-3 ${divClass}`}>
      {label && (
        <Form.Label>
          {label} {required && <span className="text-danger">*</span>}
        </Form.Label>
      )}

      {type === "select" ? (
        <Form.Select
          className={`${inputClass} ${invalid ? "is-invalid" : ""} ${
            valid ? "is-valid" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          value={value}
          name={name}
          required={required}
        >
          <option value="">Select an option</option>
          {options.map((opt, index) => (
            <option key={index} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Form.Select>
      ) : type === "textarea" ? (
        <Form.Control
          as="textarea"
          className={`${inputClass} ${invalid ? "is-invalid" : ""} ${
            valid ? "is-valid" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          value={value}
          placeholder={placeholder}
          name={name}
          required={required}
          rows={3}
          readOnly={readOnly}
        />
      ) : type === "checkbox" || type === "radio" ? (
        <Form.Check
          type={type}
          className={`${inputClass} ${invalid ? "is-invalid" : ""} ${
            valid ? "is-valid" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          checked={value}
          label={label}
          name={name}
          required={required}
          readOnly={readOnly}
        />
      ) : (
        <Form.Control
          type={type}
          className={`${inputClass} ${invalid ? "is-invalid" : ""} ${
            valid ? "is-valid" : ""
          }`}
          disabled={disabled}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          value={value}
          placeholder={placeholder}
          name={name}
          required={required}
          autoFocus={autoFocus}
          readOnly={readOnly}
          min={min}
          max={max}
          step={step}
        />
      )}

      {invalid && errorMessage && (
        <Form.Text className="text-danger">{errorMessage}</Form.Text>
      )}
    </Form.Group>
  );
};

export default FormInput;
