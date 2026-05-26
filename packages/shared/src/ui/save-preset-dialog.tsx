"use client";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface SavePresetDialogProps {
  open: boolean;
  name: string;
  onNameChange: (name: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SavePresetDialog({
  open,
  name,
  onNameChange,
  onClose,
  onSave,
}: SavePresetDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Save preset</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Preset name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && name.trim()) {
              onSave();
            }
          }}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!name.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
