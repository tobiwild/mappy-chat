Mappy Chat
==========

Run [Mappy commands](https://github.com/tobiwild/mappy-commands) from a XMPP chat. Just define some rules in `config.json`.
Some example:
```javascript
{
    "conditions": {
        "text": {
            "regex":"^!([a-z]{2}) (.*)",
            "modifier":""
        }
    },
    "message": {
        "command": "TextToSpeechCommand",
        "text": "{user} says: {text2}",
        "language": "{text1}",
        "speed":"1.0",
        "tempo":"1.0",
        "pitch":"0"
    }
}
```
When `Peter` now types the following in the chat:
```
> !en Can somebody please fix the build
```
then Mappy begins to talk:
```
Peter says: Can somebody please fix the build
```
