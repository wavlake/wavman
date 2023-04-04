import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useContext, useEffect, useState } from "react";
import { RelayContext } from "./relayContext";

// SubEvent not exported by nostr-tools
type SubEvent = (event: Event) => void | Promise<void>;

export const useRelaySubscription = (filter: Filter[], listener: SubEvent, opts?: SubscriptionOptions) => {
	const { relay } = useContext(RelayContext);
  const [loading, setLoading] = useState(true);
	useEffect(() => {
    if (relay) {
      console.log('added sub: ', filter);
      const sub = relay.sub(filter, opts)
      sub.on('event', listener)
      sub.on('eose', () => {
        console.log('got the eose, unsubing? ', filter);
        // sub.unsub()
      })
      return () => {
        console.log('removed sub: ', filter);
        sub.unsub();
      };
    } else {
      console.log('useRelaySubscription: relay is null');
    }

  setLoading(false);
	}, [filter, listener, opts]);

  return { loading };
};
