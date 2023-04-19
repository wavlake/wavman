import LiftedWavmanPlayer from "./LiftedWavmanPlayer";
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
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
      </Head>
      <main className="py-4 md:py8">
        <RelayProvider url={relayUrl}>
          <LiftedWavmanPlayer />
        </RelayProvider>
      </main>
    </>
  );
}
