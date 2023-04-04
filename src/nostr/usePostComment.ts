import { Event } from "nostr-tools";
import { useContext } from "react";
import { RelayContext } from "./relayContext";
// import { mutate, FetcherResponse } from 'swr/mutation'
 
export const usePostComment = async (key: string, { args }: { args: { event: Event }}): FetcherResponse<Event> => {
	const { relay } = useContext(RelayContext);
  if (relay) {
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

  // const mutation = 
  // return [mutation, { data, error, loading }];
}