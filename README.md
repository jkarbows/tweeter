# Using Amazon's Alexa Javascript SDK to Tweet With Your Voice

We're going to build a skill to tweet with your voice. In Part 2 we'll talk about how to extend Amazon's code to support other card types, and some of the things you need to get your skill certified. We could totally have a Part 3 to talk about user authentication and certification.

## Our toolbelt

We're going to assume you have some level of familiarity with Alexa, [node.js](https://nodejs.org/)(this means having Node installed), and JavaScript in general. If not, check out Amazon's [getting started](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/getting-started-guide) material, and their [javascript samples](https://github.com/amzn/alexa-skills-kit-js) for Alexa skills. There's lots of material, as well as a handful of "my first skill" guides out there to get your feet wet with Alexa. While this article is meant to be accessible to everyone, we'll be glossing over some of the things those beginner tutorials address in step by step detail, such as where to find your skill's app ID and how to deploy AWS Lambda functions.
We'll be using the AlexaSkill.js file from Amazon's [Alexa Skills Kit sample code](https://github.com/amzn/alexa-skills-kit-js) on github and the [oauth package](https://www.npmjs.com/package/oauth) from npm to do most of the heavy lifting for our skill, and deploying it as an AWS Lambda function. You could of course use different packages or roll your own implementation of either of these to suit your particular project's needs, but these will do just fine for our purposes.

## First thing's first

Navigate to your project directory and run the following commands:
```
npm init
npm install oauth
```
Since you've used node before, you know these will just create a new project with whatever name and other settings you choose and download the oauth package off of [npm](https://npmjs.com) to your project's node_modules directory.

Next, download a copy of [AlexaSkill.js](https://github.com/jkarbows/tweeter/blob/master/AlexaSkill.js) and drop it in the main directory for your project. I've included a copy in the [repository](https://github.com/jkarbows/tweeter) for this article, along with the rest of the code for the skill, or you can download it straight from Amazon's [javascript samples](https://github.com/amzn/alexa-skills-kit-js/blob/master/samples/savvyConsumer/src/AlexaSkill.js) on github.

We'll need one more file before we're ready to start writing our skill - secrets.js will hold our user tokens and keys so we can share the source code of the main file without giving everyone access to our twitter account. I've structured mine as follows:
```javascript
module.exports.alexa = 'your-skills-app-id';

module.exports.twitter = {
    consumer: {
        public: 'your-twitter-consumer-token',
        secret: 'your-twitter-consumer-secret'
    },
    user: {
        public: 'your-twitter-user-token',
        secret: 'your-twitter-user-secret'
    }
}
```

## Time to write some code

We'll start off by requiring our oauth module, AlexaSkill.js, and our newly created secrets.js, so we can use them
```javascript
var AlexaSkill = require('./AlexaSkill');
var OAuth = require('oauth');
var secrets = require('./secrets');

var APP_ID = secrets.alexa;
```
Now that we've got these things available to us, we can sketch out the basic framework of our skill. I've named mine Tweeter, and given it a single intent for tweeting.
```javascript
var Tweeter = function() {
    AlexaSkill.call(this, APP_ID);
};

Tweeter.prototype = Object.create(AlexaSkill.prototype);
Tweeter.prototype.constructor = Tweeter;
```
Then, we set up two basic event handlers for our skill: onSessionStarted and onLaunch. Eventually we'll use onSessionStarted to reject unauthenticated users, but for now we'll just have it log some information and move on.
```javascript
Tweeter.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log('Twitter onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: ' + session.sessionId);
};

Tweeter.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log('Tweeter onLaunch requestId' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
};

Tweeter.prototype.intentHandlers = {
    "TweetIntent": function(intent, session, response) {

    }
};
```
The onLaunch function handles when our skill is launched without an intent. The Tweet intent is where the real magic will happen. Before that we have one last bit of code to add on to the end of our file so that it can execute.
```javascript
exports.handler = function(event, context) {
    var tweeterHelper = new Tweeter();
    tweeterHelper.execute(event, context);
};
```
This code will allow us to run our skill as an AWS Lambda function, invoking the execute method in AlexaSkill.js

## So how about that Tweeting thing


