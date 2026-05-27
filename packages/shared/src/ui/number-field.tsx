"use client";

import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import type { ValidationResult } from "../lib/validation/types";
import { fieldHasError, fieldHelperText } from "../lib/validation/field-errors";

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  /** Validation field id — used to surface error state and helper text. */
  field: string;
  validation: ValidationResult;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  field,
  validation,
  min = 0,
  max,
  step = 1,
  unit = "mm",
}: NumberFieldProps) {
  const helperText = fieldHelperText(validation, field);
  const error = fieldHasError(validation, field);

  return (
    <TextField
      label={label}
      type="number"
      size="small"
      value={value}
      error={error}
      helperText={helperText}
      onChange={(e) => onChange(Number.parseFloat(e.target.value) || 0)}
      slotProps={{
        htmlInput: { min, max, step },
        input: {
          endAdornment: unit ? (
            <InputAdornment position="end">
              <Typography variant="caption" sx={{
                color: "text.secondary"
              }}>
                {unit}
              </Typography>
            </InputAdornment>
          ) : undefined,
        },
      }}
      fullWidth
    />
  );
}
