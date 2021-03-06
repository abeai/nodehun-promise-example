# Nodehun Promise Example

## Setup

    yarn install
    node index.js

## Test

<http://localhost:8111/spelling?utterance=%22what%20is%20goinng%20on%22>    

You will see the `console.log` from the spellSuggest callback immediately in the terminal.

However the `Promise.all()` is not fulfilled until a long time. Maybe 30 seconds to over a minute.

Eventually you will see `Are we here yet?` logged in the terminal and the response completed.

Next: Comment out the `return reject` and the `return resolve` lines in `spellSuggestPromise`

Uncomment out the `return setImmediate` lines.

So it looks like this ->

    function spellSuggestPromise(utterance) {
        return new Promise(function(resolve, reject) {
            dict.spellSuggest(utterance, function(err, correct, suggestion, origWord) {
                console.log(err, correct, suggestion, origWord);
                if (err) {
                    return setImmediate(reject, error);
                    // return reject(error);
                }
                if (suggestion) {
                    // return resolve(suggestion);
                    return setImmediate(resolve, suggestion);
                }
                // return resolve(origWord);
                return setImmediate(resolve, origWord);
            });
        });
    }

Now kill the server, start it again, and then hit the url again.

You will see the `console.log` immediately, and `Are we here yet?` as well. Functions as expected.

## Problem?

I think the issue is here <https://github.com/Wulf/nodehun/blob/master/src/post0.12.0/nodehun.cpp#L253>

at the end of the `void Nodehun::SpellDictionary::spellSuggest(const FunctionCallbackInfo<Value>& args)` function

    uv_queue_work(uv_default_loop(), &spellData->request,
        Nodehun::SpellDictionary::checkSuggestions, Nodehun::SpellDictionary::sendSuggestions);

Looking at <http://docs.libuv.org/en/v1.x/threadpool.html>

`uv_work_cb` is set to checkSuggestions, and then `uv_after_work_cb` is set to sendSuggestions

I'm not sure if this is it exactly, but I'm thinking the that since `uv_after_work_cb` is called
after the threadpool is completed... it may cause the resolves() in the promise to be lost somehow...
Although I can't say why they eventually get called... My guess is they're not marked at the end of a runloop,
and the loop is waiting for events.. eventually the runloop fires and we get the response


So again.. the workaround for now is to use `setImmediate`:

    return setImmediate(resolve, suggestion);

I just want to make sure I'm not missing anything... I'll be testing this under load soon.
