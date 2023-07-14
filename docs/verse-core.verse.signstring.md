<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@verseengine/verse-core](./verse-core.md) &gt; [Verse](./verse-core.verse.md) &gt; [signString](./verse-core.verse.signstring.md)

## Verse.signString() method

Create a data signature with the private key of the session ID.

**Signature:**

```typescript
signString(data: string): string;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  data | string |  |

**Returns:**

string

{<!-- -->string<!-- -->}

## Example


```ts
const verse = VerseCore.Verse.new(...);
...
const data = ...;
const signature = verse.signString(data);
await fetch('...',
  headers: {
	    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    'sessionID': verse.getSessionID(),
    signature,
    data
  })
});

...
const valid = VerseCore.Verse.verifyString(sessionID, signature, data);
if(!valid) { throw new Error('invalid data'); }
```
