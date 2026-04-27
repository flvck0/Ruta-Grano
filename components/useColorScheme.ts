import { useColorScheme as _useColorScheme } from 'react-native';

export function useColorScheme(): 'light' | 'dark' {
    // We default to 'dark' on web to match +html.tsx and because light flicker is annoying.
    // On native, we respect the system.
    return _useColorScheme() ?? 'dark';
}
