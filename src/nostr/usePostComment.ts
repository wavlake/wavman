import { Filter, SubscriptionOptions, Event } from "nostr-tools";
import { useContext, useEffect, useState } from "react";
import { RelayContext } from "./relayContext";

export const usePostEvent = (event: Event) => {
	const { relay } = useContext(RelayContext);

  const [loading, setLoading] = useState(true);
	// when the component, *which uses this hook* mounts,
	// add a listener.
	useEffect(() => {
    if (relay) {
      console.log('posted event: ', Event);
      const pub = relay.publish(event)
      pub.on('ok', () => {
        console.log(`${relay.url} has accepted our event`)
      })
      pub.on('failed', (reason: string) => {
        console.log(`failed to publish to ${relay.url}: ${reason}`)
      })
    } else {
      console.log('usePostComment: relay is null');
    }
    setLoading(false);
	}, [event]);

  return { loading };
};