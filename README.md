# verse-core &middot; [![npm version](https://img.shields.io/npm/v/@verseengine%2Fverse-core.svg?style=flat)](https://www.npmjs.com/package/@verseengine%2Fverse-core)
 Web-based Metaverse Engine on P2P overlay network.

## Usage
```ts
import verseInit, * as VerseCore from "verse-core";

...

async function start() {
  // Initialize by specifying the URL of the WebAssembly file.
  await verseInit("./assets/verse_core_bg.wasm");

  const verse = VerseCore.Verse.new(
    "https://entrance.verseengine.cloud",
    player,
    new OtherPersonFactory(scene, adapter),
    {
      // WebRTC settings to connect to the overlay network.
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    } as RTCConfiguration,
  );
  await verse.start();
}
```

## API Reference
[Link](docs/verse-core.verse.md)
