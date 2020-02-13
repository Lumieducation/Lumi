import { createMuiTheme } from '@material-ui/core/styles';

export const drawerWidth = 240;

const gradientBackground = 'linear-gradient(45deg, #1abc9c 0%, #3498db 100%)';

// A custom theme for this app
const theme = createMuiTheme({
    palette: {
        error: {
            main: '#c0392b'
        },
        primary: {
            main: '#3498db'
        },
        secondary: {
            main: '#1abc9c'
        },

        background: {
            default: '#f1f3f4'
        }
    },
    props: {
        MuiAppBar: {
            style: {
                background: gradientBackground
            }
        }
        // MuiTab: {
        //     style: {
        //         color: 'white'
        //     }
        // }
    }
});

export default theme;
