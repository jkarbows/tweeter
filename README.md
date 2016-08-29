# Using Amazon's Alexa Javascript SDK to Tweet With Your Voice

We're going to build a skill to tweet with your voice. \

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
module.exports.alexa = 'your-alexa-skill-app-id';

module.exports.twitter = {
    consumer: {
        public: 'your-twitter-consumer-token',
        secret: 'your-twitter-consumer-secret'
    },
    user: {
        token: 'your-twitter-user-token',
        secret: 'your-twitter-user-secret'
    }
}
```
You can get these tokens from the [twitter developer console](https://apps.twitter.com/) and the [amazon developer console](https://developer.amazon.com/edw/home.html#/skills/list).

## Time to write some code

We'll start off by requiring our oauth module, AlexaSkill.js, and our newly created secrets.js, so we can use them
```javascript
var AlexaSkill = require('./AlexaSkill');
var OAuth = require('oauth');
var secrets = require('./secrets');

var APP_ID = secrets.alexa;
```
Now that we've got these things available to us, we can sketch out the basic framework of our skill. I've named mine Tweeter, and given it a single intent for handling the creation of new tweets. First, we'll pass in our app id to establish our skill.
```javascript
var Tweeter = function() {
    AlexaSkill.call(this, APP_ID);
};

Tweeter.prototype = Object.create(AlexaSkill.prototype);
Tweeter.prototype.constructor = Tweeter;
```
This is the way we'll set up our skill to use AlexaSkill.js to interact with the Alexa Service.

Then, we set up two basic event handlers for our skill: onSessionStarted and onLaunch. Eventually we'll use onSessionStarted to reject unauthenticated users, but for now we'll just have it log some information and move on.
```javascript
Tweeter.prototype.eventHandlers.onSessionStarted = function(sessionStartedRequest, session) {
    console.log('Twitter onSessionStarted requestId:' + sessionStartedRequest.requestId +', sessionId: '
        + session.sessionId);
};

Tweeter.prototype.eventHandlers.onLaunch = function(launchRequest, session, response) {
    console.log('Tweeter onLaunch requestId' + launchRequest.requestId + ', sessionId: ' + session.sessionId);
    var speechOutput = "Welcome to Tweeter. Say 'tweet' followed by what you'd like me to tweet for you.";
    var cardTitle = "Tweeter";
    response.askWithCard(speechOutput, speechOutput, cardTitle, speechOutput);
};
```
The onLaunch function handles when our skill is launched without an intent. It prompts the user to form a new tweet, and waits for a response. We're using the askWithCard method, so the user will receive a card in their Alexa app with some information about our skill. Right now we're using the same output to reprompt the user if they take too long to respond and to print on the card, but you can output anything there. Card formatting is still limited to only newlines and images, so Skills are forced into using rather simple cards. Right now we're limited to only simple cards, but we'll go over how to create cards with images in part 2.
```javascript
Tweeter.prototype.intentHandlers = {
    "TweetIntent": function(intent, session, response) {
        // Handle Tweet creation
    }
};
```
The Tweet intent is where the real magic will happen. But, before we write that we have one last bit of code to add on to the end of our file so that it can execute.
```javascript
exports.handler = function(event, context) {
    var tweeterHelper = new Tweeter();
    tweeterHelper.execute(event, context);
};
```
This will allow us to run our skill as an AWS Lambda function, invoking the execute method in AlexaSkill.js and running our code.

## So about that "Tweeting" thing

Alright, it's finally time to actually send out our tweets. First we'll prepare the oauth module to interact with Twitter.
```javascript
var oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    secrets.twitter.consumer.public,
    secrets.twitter.consumer.secret,
    '1.0A',
    null,
    'HMAC-SHA1'
);
```
Then, we'll set up our variables for our response to the user, and the store the user input and the url we're going to post to in our interaction with the twitter api.
```javascript
var speechOutput = "";
var cardTitle = "Tweeter";

var input = intent.slots.input.value;
var url = 'https://api.twitter.com/1.1/statuses/update.json?status=' + input;
```
And finally we send it out and we're good to go. Tack on a little bit of error handling and output a card to the user's Alexa app with the tweet content for good measure, and we've got our basic tweeting skill almost completed.
```javascript
oauth.post(
    url,
    secrets.twitter.user.token,
    secrets.twitter.user.secret,
    null,
    function(err, data, res) {
        if(err) {
            speechOutput = "There was an error communicating with Twitter. Try again later.";
            response.tell(speechOutput);
        }
        speechOutput = "Okay, I tweeted: \"" + input + "\" for you.";
        response.tellWithCard(speechOutput, cardTitle, speechOutput);
    }
)
```
Zip up your whole project folder, including the node_modules directory, and upload it to your lambda function, then we've only got to set up our interaction model and we'll be able to tweet from our echo!

## The Interaction Model

The interaction model for our skill is rather straightforward, since there's only one intent for the user to perform. Starting with the Intent Schema:
```javascript
{
  "intents": [
    {
      "intent": "TweetIntent",
      "slots": [
        {
          "name": "input",
          "type": "INPUT_VALUE"
        }
      ]
    }
  ]
}
```
Our Tweet intent accepts a single slot named to a generic input custom slot type named INPUT_VALUE that contains a short dictionary of common English vocabulary to enable users to tweet a wide variety of phrases. Amazon doesn't support this sort of general input model for skills very well, so tread carefully here. This is generally the best solution for trying to accept generic input from users. You can find the full list of slot values in the [interaction model folder](https://github.com/jkarbows/tweeter/tree/master/interaction-model) in the [github repository](https://github.com/jkarbows/tweeter).

The Sample Utterances are simply "tweet" followed by one to four inputs.
```
TweetIntent tweet {input}
TweetIntent tweet {input} {input}
TweetIntent tweet {input} {input} {input}
TweetIntent tweet {input} {input} {input} {input}
```
Collecting multi-word strings tends to not work unless you collect your input slots like this. While Amazon's certification team will recommend that you name each slot differently, and don't reuse the same slot multiple times in the same intent, this allows for strings of indefinite length and seems to allow for more flexible input in my testing.

## What now?

Congratulations, you(should) now have a skill you can use to tweet with your voice! If you're having trouble, all of the code we've written here today is available in a [github repo](https://github.com/jkarbows/tweeter), feel free to check it out, and reach out with any questions.

In Part 2 of this article we'll talk about how to extend Amazon's code to support other card types, and some of the things you need to get your skill certified. We could totally have a Part 3 to talk about user authentication and certification, too.
