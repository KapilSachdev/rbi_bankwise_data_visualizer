import { createContext } from 'react';

export interface LayoutContextType {
    layout: string;
    setLayout: React.Dispatch<React.SetStateAction<string>>;
}

export const LayoutContext = createContext<LayoutContextType>({
    layout: 'grid',
    setLayout: () => { },
});
