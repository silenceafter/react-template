// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      light: '#63ccff',
      main: '#009be5',
      dark: '#006db3',
    },
  },
  typography: {
    fontSize: 13,
    h5: {
      fontWeight: 500,
      fontSize: 24, /* 26 */
      letterSpacing: 0.5,
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiTab: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
  mixins: {
    toolbar: {
      minHeight: 48,
    },
  },
});

theme.components = {
  ...theme.components,
  MuiDrawer: {
    styleOverrides: {
      paper: {
        backgroundColor: '#081627',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'none',
      },
      contained: {
        boxShadow: 'none',
        '&:active': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        marginLeft: theme.spacing(1),
      },
      indicator: {
        height: 3,
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
        backgroundColor: theme.palette.common.white,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        margin: '0 16px',
        minWidth: 0,
        padding: 0,
        [theme.breakpoints.up('md')]: {
          padding: 0,
          minWidth: 0,
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        padding: theme.spacing(1),
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 4,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgb(255,255,255,0.15)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        '&.Mui-selected': {
          color: '#4fc3f7',
        },
      },
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: {
        fontSize: 14,
        fontWeight: theme.typography.fontWeightMedium,
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        color: 'inherit',
        minWidth: 'auto',
        marginRight: theme.spacing(2),
        '& svg': {
          fontSize: 20,
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        width: 32,
        height: 32,
      },
    },
  },
};

/*export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});*/

export default theme;