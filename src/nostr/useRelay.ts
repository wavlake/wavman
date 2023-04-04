import { relayInit } from 'nostr-tools'
import { useEffect } from 'react'

export const useRelay = (url: string) => {
  const relay = relayInit(url);

  relay.on('connect', () => {
    console.log(`connected to ${relay.url}`)
  })
  relay.on('error', () => {
    console.log(`failed to connect to ${relay.url}`)
  });

  useEffect(() => {
    relay.connect()

    return () => {
      relay.close();
    }
  })

  return { relay }
};
