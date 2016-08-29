// tweet skill
'use strict';

var AlexaSkill = require('./AlexaSkill');
var OAuth = require('oauth');
var secrets = require('./secrets');

var APP_ID = secrets.alexa;

var Tweeter = function() {
    AlexaSkill.call(this, APP_ID);
};

Tweeter.prototype = Object.create(AlexaSkill.prototype);
Tweeter.prototype.constructor = Tweeter;

Tweeter.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log('Twitter onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: ' + session.sessionId);
};

Tweeter.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log('Tweeter onLaunch requestId' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
    var speechOutput = "Welcome to Tweeter. Say 'tweet' followed by what you'd like me to tweet for you.";
    var cardTitle = "Tweeter";
    response.askWithCard(speechOutput, speechOutput, cardTitle, speechOutput);
};

Tweeter.prototype.intentHandlers = {
    "TweetIntent": function(intent, session, response) {

    }
};

exports.handler = function(event, context) {
    var tweeterHelper = new Tweeter();
    tweeterHelper.execute(event, context);
};
