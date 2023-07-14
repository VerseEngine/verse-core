<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@verseengine/verse-core](./verse-core.md) &gt; [Verse](./verse-core.verse.md) &gt; [getSessionID](./verse-core.verse.getsessionid.md)

## Verse.getSessionID() method

Uniquely identifying ID. The same user will have a different ID each time they connect

The session ID is the public key for ED25519. Verse holds the private key for the session ID internally

The session ID (public key) of the other person can be obtained when [OtherPersonFactory.create()](./verse-core.otherpersonfactory.create.md) is called

**Signature:**

```typescript
getSessionID(): string;
```
**Returns:**

string

{<!-- -->string<!-- -->}
