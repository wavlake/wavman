import { Filter, SubscriptionOptions } from "nostr-tools";
import useSWR from "swr";
import { useRelay } from "./useRelay";

export const useListEvents = (
  filter: Filter[],
  skip: boolean = false,
  opts?: SubscriptionOptions
) => {
  const { relay } = useRelay();
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
