import { defaultTheme, Theme } from 'evergreen-ui';

export default {
  components: {
    Heading: {
      baseStyle: {
        color: 'colors.gray200',
      },
    },
    Text: {
      baseStyle: {
        color: 'colors.gray200',
      },
    },
    Button: {
      baseStyle: {},
      appearances: {
        default: {
          backgroundColor: '#191A1A',
          borderColor: 'colors.gray600',
          color: 'colors.gray600',
          _hover: {
            backgroundColor: '#2E2E2E',
          },
          _focus: {
            backgroundColor: '#2E2E2E',
          },
          _active: {
            backgroundColor: '#2E2E2E',
          },
        },
        minimal: {
          backgroundColor: '#191A1A',
          _hover: {
            backgroundColor: '#2E2E2E',
          },
        },
      },
    },
    Table: {
      baseStyle: {
        border: '1px solid #474d66',
        _hover: {
          background: '#191A1A',
        },
      },
    },
    // Pane: {
    //   // @ts-ignore
    //   ...defaultTheme.components.Pane,
    //   baseStyle: {
    //     // @ts-ignore
    //     ...defaultTheme.components.Pane.baseStyle(defaultTheme, {}),
    //     backgroundColor: '#1B1E1E',
    //   },
    // },
    TableRow: {
      baseStyle: {
        background: '#191A1A',
        borderBottom: '1px solid #474d66',
      },
      appearances: {
        default: {
          _hover: {
            background: '#272828',
          },
          _active: {
            background: '#272828',
          },
          _focus: {
            background: '#272828',
          },
          _current: {
            background: '#272828',
          },
        },
      },
    },
    TableHead: {
      baseStyle: {
        color: '#c1c4d6',
        background: '#1D1F1F',
        borderBottom: '1px solid #474d66',
      },
    },
    MenuItem: {
      appearances: {
        default: {
          paddingX: 0,
          backgroundColor: '#3C3C3C',
          _hover: {
            backgroundColor: '#414242',
          },
          _current: {
            backgroundColor: '#414242',
          },
        },
      },
    },
  },
  colors: {
    icon: {
      default: 'colors.gray200',
    },
    default: '#f5f5f5',
    // greenTint: 'red'
  },
} as Theme;
