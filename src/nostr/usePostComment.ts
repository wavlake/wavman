import { Event } from "nostr-tools";
import { useContext, useState } from "react";
import { RelayContext } from "./relayContext";
// import { mutate, FetcherResponse } from 'swr/mutation'
 
export const usePostComment = (): [(event: Event) => Promise<void>, { data?: Event, loading: boolean, error?: string }] => {
	const { relay } = useContext(RelayContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<Event | undefined>(undefined);

  const mutation = async (event: Event) => {
    setLoading(true);
    setError(undefined);
    setData(undefined);
    if (relay) {
      const pub = relay.publish(event)
      pub.on('ok', () => {
        setLoading(false);
        setData(event);
      })
      pub.on('failed', (reason: string) => {
        setLoading(false);
        setError(`failed to publish to ${relay.url}: ${reason}`);
      })
    } else {
      setLoading(false);
      setError('usePostComment: relay is null');
    }
  }

  return [mutation, { data, error, loading }];
}