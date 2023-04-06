import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <link
        rel="preload"
        href="/fonts/QuinqueFive.ttf"
        as="font"
        type="font/ttf"
        crossOrigin="anonymous"
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
