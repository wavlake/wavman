# WAVMAN

Wavman is an open-source Nostr client built to showcase the possibilities of interacting with music over relays. The client has been designed to interact with a specific type of Nostr event containing a standard document ([Nostr Open Media document, or NOM](https://github.com/wavlake/nom-spec)) in the content field.

## Getting Started

Clone this repo with the following command:

```bash
git clone https://github.com/wavlake/wavman.git
```

Once inside the newly cloned repo folder (`cd wavman`) install dependencies:

```bash
npm install
# or
yarn
```

Copy the `.env.example` file and rename it to `.env.local`

Next, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open up [http://localhost:3003](http://localhost:3003) with your browser to start jamming out!
