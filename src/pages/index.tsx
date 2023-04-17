import WavmanPlayer from "./WavmanPlayer";
import RelayProvider from "@/nostr/relayProvider";
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
      <main className="h-auto bg-wavpink pb-64">
        <div className="grid justify-center">
          <RelayProvider url={relayUrl}>
            <WavmanPlayer />
          </RelayProvider>
        </div>
      </main>
    </>
  );
}
