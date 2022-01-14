import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';
import { defaultTheme } from 'evergreen-ui';

import light from './light';
import dark from './dark';

const themes = {
    light,
    dark
};

const preparedThemes = (Object.keys(themes) as ThemeName[]).reduce((acc, cur) => {
    const theme = themes[cur];
    return {
        ...acc,
        [cur]: merge(cloneDeep(defaultTheme), cloneDeep(theme))
    }
}, {} as typeof themes);

declare global {
    type ThemeName = keyof typeof themes;
}

export default preparedThemes;