import { WebLNProvider } from "@/lightning/useWebLN";
import WavmanPlayer from "./WavmanPlayer";
import RelayProvider from "@/nostr/relayProvider";
import { NIP07Provider } from "@/nostr/useNIP07Login";
import { Inter } from "next/font/google";
import Head from "next/head";

const inter = Inter({ subsets: ["latin"] });

const localRelay = "ws://0.0.0.0:8008";
const wavlakeProd = "wss://relay.wavlake.com/";

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
        <RelayProvider url={wavlakeProd}>
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
