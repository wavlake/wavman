import WavmanPlayer from "./WavmanPlayer";
import { WebLNProvider } from "@/lightning/useWebLN";
import RelayProvider from "@/nostr/relayProvider";
import { NIP07Provider } from "@/nostr/useNIP07Login";
import Head from "next/head";

const relayUrl = process.env.NEXT_PUBLIC_RELAY_URL || "";

export default function Home() {
  return (
    <>
      <Head>
        <title>Wavman</title>
        <meta name="description" content="Wavman" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="/output.css" rel="stylesheet" />
      </Head>
      <main className="grid h-screen bg-wavpink">
        <RelayProvider url={relayUrl}>
          <NIP07Provider>
            <WebLNProvider>
              <WavmanPlayer />
            </WebLNProvider>
          </NIP07Provider>
        </RelayProvider>
      </main>
    </>
  );
}
