import Logo from "./Logo";
import PlayerControls from "./PlayerControls/PlayerControls";
import Screen from "./Screen/Screen";
import {
  Actions,
  OFF_VIEW,
  PageView,
  PLAYER_VIEW,
  resetSelectionOnPageChange,
  SPLASH_VIEW,
} from "./shared";
import { useRelay } from "@/nostr";
import {
  Event,
  getPublicKey,
  generatePrivateKey,
  getEventHash,
  signEvent,
  UnsignedEvent,
} from "nostr-tools";
import { useEffect, useState } from "react";

// TODO replace with user PK/login feature
const sk = generatePrivateKey();
const pk = getPublicKey(sk);
const validateNostrPubKey = (nostrPubKey: string) => {
  if (nostrPubKey == null || nostrPubKey === undefined || typeof nostrPubKey !== 'string') {
    return false;
  }
  const schnorrSignatureRegex = /^[a-fA-F0-9]{64}$/;
  if (!schnorrSignatureRegex.test(nostrPubKey)) {
    return false;
  }

  return true;
};
const generateLNURLFromZapTag = (zapTag: string[]) => {
  const [zap, zapAddress, lud] = zapTag;
  const [username, domain] = zapAddress.split("@");
  if (!username || !domain) return false;
  return`http://${domain}/.well-known/lnurlp/${username}`
};
const signComment = (content: string, parentTrack: Event): Event => {
  const unsignedEvent: UnsignedEvent = {
    kind: 1,
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
    tags: [["e", parentTrack.id, "wss://relay.wavlake.com/", "reply"]],
    content,
  };

  return {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: signEvent(unsignedEvent, sk),
  };
};

const signZapEvent = ({
  content,
  amount,
  lnurl,
  recepientPubKey,
  zappedEvent,
}: {
  content: string;
  amount: number;
  lnurl: string;
  recepientPubKey: string;
  zappedEvent: Event;
}): Event => {
  const sats2millisats = (amount: number) => amount * 1000;
  const unsignedEvent = {
    kind: 9734,
    content,
    tags: [
      ["relays", "wss://relay.wavlake.com/"],
      ["amount", sats2millisats(amount).toString()],
      ["lnurl", lnurl],
      ["p", recepientPubKey],
      ["e", zappedEvent.id]
    ],
    pubkey: pk,
    created_at: Math.floor(Date.now() / 1000),
  };

  return {
    ...unsignedEvent,
    id: getEventHash(unsignedEvent),
    sig: signEvent(unsignedEvent, sk),
  };
};

const randomSHA256String = (length: number) => {
  const alphanumericString = Array.from(Array(length + 30), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
  const SHA256Regex = /[^A-Fa-f0-9-]/g;
  return alphanumericString.replace(SHA256Regex, "").slice(0, length);
};

const WavmanPlayer: React.FC<{}> = ({}) => {
  // 4 characters returns ~90-130 tracks
  // will need to re-randomize this filter once the user reaches the end of the list
  const [randomChar, setRandomChar] = useState<string[]>(
    Array.from(randomSHA256String(30))
  );

  ///////// NOSTR /////////
  const { useListEvents, useEventSubscription, usePublishEvent } = useRelay();

  // Get a batch of tracks
  const { data: tracks, loading: tracksLoading } = useListEvents([
    { kinds: [32123], ["#f"]: randomChar },
  ]);

  // Post a comment mutation
  const [
    postComment,
    {
      data: postedComment,
      loading: postCommentLoading,
      error: postCommentError,
    },
  ] = usePublishEvent();
  const [trackIndex, setTrackIndex] = useState(0);

  const [nowPlayingTrack, setNowPlayingTrack] = useState<Event>();

  // Get track comments, skip till a track is ready
  const shouldSkipComments = !nowPlayingTrack;
  const { allEvents: comments, loading: commentsLoading } =
    useEventSubscription(
      [{ ["#e"]: [nowPlayingTrack?.id || ""], limit: 20 }],
      shouldSkipComments
    );

  ///////// UI /////////
  const pickRandomTrack = (tracks: Event[]) => {
    setNowPlayingTrack(tracks[trackIndex]);
    setTrackIndex(trackIndex + 1);
    // setNowPlayingTrack(tracks[Math.floor(Math.random() * tracks.length)]);
  };
  const turnOnPlayer = () => setPageView(PLAYER_VIEW);
  const turnOffPlayer = () => setPageView(OFF_VIEW);

  // The player currently auto turns on when tracks are loaded
  // Tracks load automatically when the page loads
  useEffect(() => {
    if (tracks?.length) {
      pickRandomTrack(tracks);
      turnOnPlayer();
    }
  }, [tracks]);

  const skipHandler = () => {
    if (tracks?.length) pickRandomTrack(tracks);
  };
  const zapHandler = async () => {
    if (nowPlayingTrack) {
      const zapTag = nowPlayingTrack.tags.find((tag) => tag[0] === "zap");
      const lnurl = zapTag && generateLNURLFromZapTag(zapTag)
      if (!lnurl) return false;
      const res = await fetch(lnurl);
      const {
        allowsNostr,
        callback,
        maxSendable,
        metadata,
        minSendable,
        nostrPubKey,
        tag,
      } = await res.json();
      
      if (!allowsNostr) return false;
      if (!validateNostrPubKey(nostrPubKey)) return false;

      const amount = 100;
      const content = "Zapped!";
      const zapEvent = signZapEvent({
        content,
        amount,
        lnurl,
        recepientPubKey: nostrPubKey,
        zappedEvent: nowPlayingTrack,
      });

      const event = encodeURI(JSON.stringify(zapEvent));
      const invoiceRes = await fetch(`${callback}?amount=${amount}&nostr=${event}&lnurl=${lnurl}`);
      const { pr } = await invoiceRes.json();
      console.log({pr})
    }
  };
  const [isPlaying, setIsPlaying] = useState(false);
  const playHandler = () => {
    setIsPlaying(!isPlaying);
  };
  interface Form {
    comment: string;
  }

  const submitHandler = ({ comment }: Form) => {
    if (nowPlayingTrack) {
      const signedEvent = signComment(comment, nowPlayingTrack);
      postComment(signedEvent);
    }
  };

  ///////// NAVIGATION /////////
  const [selectedActionIndex, setSelectedActionIndex] = useState(0);
  const [pageView, setPageView] = useState<PageView>(SPLASH_VIEW);
  const toggleViewHandler = (pageView: PageView) => {
    resetSelectionOnPageChange(pageView, setSelectedActionIndex);
    setPageView(pageView);
  };

  return (
    <div className="max-h-192 grid h-[90vh] w-11/12 max-w-sm place-items-center place-self-center border-16 border-black bg-wavgray align-middle">
      <Screen
        nowPlayingTrack={nowPlayingTrack}
        isPlaying={isPlaying}
        commentsLoading={commentsLoading}
        comments={comments || []}
        submitHandler={submitHandler}
        pageView={pageView}
        selectedActionIndex={selectedActionIndex}
      />
      <Logo />
      <PlayerControls
        pageView={pageView}
        selectedActionIndex={selectedActionIndex}
        setSelectedActionIndex={setSelectedActionIndex}
        skipHandler={skipHandler}
        zapHandler={zapHandler}
        playHandler={playHandler}
        toggleViewHandler={toggleViewHandler}
      />
    </div>
  );
};

export default WavmanPlayer;
