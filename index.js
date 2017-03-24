'use strict';
var express = require('express');
var router = express.Router();

var app = express();
var nodehun = require('nodehun');
var dictionaries = require('./dictionaries');
var affbuf = dictionaries.load('en_US.aff');
var dictbuf = dictionaries.load('en_US.dic');
var DEFAULT_PORT = 8111;
var port = process.env.PORT || DEFAULT_PORT;
var dict = new nodehun(affbuf, dictbuf);

var _ = require('lodash');

router.route('/spelling')
    .get(spelling);

app.use(router);

module.exports = router;

app.listen(port);
console.log('INFO: Listening on port %j', port);

function spelling(req, res, next) {

    fixSpelling(req.query.utterance)
        .then(function(results) {
            res.send(results);
        });

}

// setTimeout(fixSpelling, 3000, 'This is the first sentence');
function fixSpelling(utterance) {

    return new Promise(function(resolve, reject) {

        var promiseArray = [];

        _.each(utterance.split(' '), function(utteranceWord) {
            promiseArray.push(spellSuggestPromise(utteranceWord));
        });

        Promise.all(promiseArray)
            .then(function(results) {
                console.log('Are we here yet?');
                resolve(results.join(' '));
            })
            .catch(function(error) {
                reject(error);
            })
        ;

    });

}

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
