import { Filter, SubscriptionOptions } from "nostr-tools";
import { useContext } from "react";
import { RelayContext } from "./relayContext";
import useSWR from 'swr'

export const useListEvents = (
  filter: Filter[],
  skip: boolean = false,
  opts?: SubscriptionOptions,
) => {
	const { relay } = useContext(RelayContext);
  const fetcher = async () => {
    if (relay && !skip) {
      const events = await relay.list(filter, opts)
      return events;
    } else {
      console.log('useListEvents: relay is null');
    }
  }
  const subKey = JSON.stringify(filter);
  const { data, error, isLoading, mutate } = useSWR(subKey, fetcher);

  return { data, loading: isLoading, error, mutate };
};
