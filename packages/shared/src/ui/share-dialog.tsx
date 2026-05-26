"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Check, Copy } from "lucide-react";

interface ShareDialogProps {
  open: boolean;
  /** Human-readable label for the kind of thing being shared (e.g. "tube"). */
  noun: string;
  summary: string;
  shareUrl: string;
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function ShareDialog({
  open,
  noun,
  summary,
  shareUrl,
  copied,
  onClose,
  onCopy,
}: ShareDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Share this configuration</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              What you&apos;re sharing
            </Typography>
            <Typography variant="body2">{summary}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              Anyone opening this link sees the same {noun} with every dimension
              and option preserved.
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ display: "block", mb: 0.5 }}
            >
              Link
            </Typography>
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <TextField
                fullWidth
                size="small"
                value={shareUrl}
                slotProps={{
                  input: {
                    readOnly: true,
                    onFocus: (e) => {
                      (e.target as HTMLInputElement).select();
                    },
                  },
                }}
              />
              <Button
                onClick={onCopy}
                variant="contained"
                startIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                sx={{ flexShrink: 0, whiteSpace: "nowrap" }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
