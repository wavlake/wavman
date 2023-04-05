import { RelayContext } from "./relayContext";
import { Filter, SubscriptionOptions } from "nostr-tools";
import { useContext } from "react";
import useSWR from "swr";

export const useRelayList = (
  filter: Filter[],
  skip: boolean = false,
  opts?: SubscriptionOptions
) => {
  const { relay } = useContext(RelayContext);
  const fetcher = async () => {
    if (relay && !skip) {
      const events = await relay.list(filter, opts);
      return events;
    }
  };
  const subKey = JSON.stringify(filter);
  const { data, error, isLoading, mutate } = useSWR(subKey, fetcher);

  return { data, loading: isLoading, error, mutate };
};
