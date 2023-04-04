import { Filter, SubscriptionOptions, Event, Relay } from "nostr-tools";
import { EventHandler, useContext, useEffect, useState } from "react";
import { SignedEventKind32123 } from ".";
import { RelayContext } from "./relayContext";

// SubEvent not exported by nostr-tools
type EventsHandler = (event: Event[]) => void | Promise<void>;

export const useListEvents = (
  filter: Filter[],
  opts?: SubscriptionOptions
) => {
	const { relay } = useContext(RelayContext);
  const [loading, setLoading] = useState(true);
  const [tracks, setEvents] = useState<SignedEventKind32123[]>([]);

  const listEvents = async (relay: Relay) => {
    const events = await relay.list(filter, )
    setEvents([
      ...tracks,
      ...(events as any as SignedEventKind32123[])
    ]);
    relay.close();
  };
  
	useEffect(() => {
    if (relay) {
      listEvents(relay).catch((err) => console.log('error getting events: ', err));
    } else {
      console.log('useListEvents: relay is null');
    }
    setLoading(false);
	}, []);

  return { loading, tracks };
};
