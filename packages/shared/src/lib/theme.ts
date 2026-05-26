"use client";

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5a9a9d",
      dark: "#3c6e71",
      contrastText: "#ffffff",
    },
    background: {
      default: "#353535",
      paper: "#2c2c2c",
    },
    divider: "#555555",
  },
  components: {
    MuiTab: {
      styleOverrides: {
        root: {
          color: "#999999",
          "&.Mui-selected": {
            color: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#555555",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#777777",
          },
        },
      },
    },
  },
});

export default theme;
