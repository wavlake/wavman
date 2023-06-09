import { useRelay } from "./useRelay";
import { Event } from "nostr-tools";
import { useState } from "react";

export type UsePublishEvent = () => [
  (event: Event) => void,
  { data?: Event; loading: boolean; error?: string }
];

export const usePublishEvent: UsePublishEvent = () => {
  const { relay } = useRelay();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<Event | undefined>(undefined);

  const mutation = (event: Event) => {
    setLoading(true);
    setError(undefined);
    setData(undefined);
    if (relay) {
      const pub = relay.publish(event);
      pub.on("ok", () => {
        setLoading(false);
        setData(event);
      });
      pub.on("failed", (reason: string) => {
        setLoading(false);
        setError(`failed to publish to ${relay.url}: ${reason}`);
      });
    }
  };

  return [mutation, { data, error, loading }];
};
