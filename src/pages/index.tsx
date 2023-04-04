import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Player from './Player'
import Comments from './Comments'
import { mockComments, signedMockTrackEvent } from '@/nostr/mockData'
import { useRelay } from '@/nostr'
import RelayProvider from '@/nostr/relayProvider'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Wavman</title>
        <meta name="description" content="Wavman" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="grid-row">
        <RelayProvider url="wss://relay.wavlake.com/" >
          <Player />
          <Comments comments={mockComments} />
        </RelayProvider>
      </main>
    </>
  )
}
