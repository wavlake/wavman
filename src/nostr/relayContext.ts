import { createContext } from 'react';
import { Relay } from 'nostr-tools'

export const RelayContext = createContext<{ relay: Relay | null }>({ relay: null });