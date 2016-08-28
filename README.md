# Using Amazon's Alexa Javascript SDK to build a Twitter Skill

We're going to build a skill to tweet with your voice. In Part 2 we'll talk about how to extend Amazon's code to support other card types, and some of the things you need to get your skill certified. We could totally have a Part 3 to talk about user authentication and certification.

## Our toolbelt

We're going to assume you have some level of familiarity with Alexa, Node.js, and JavaScript in general. If not, check out Amazon's [getting started](https://developer.amazon.com/public/solutions/alexa/alexa-skills-kit/getting-started-guide) material, and their [javascript samples](https://github.com/amzn/alexa-skills-kit-js) for Alexa skills. There's lots of material, as well as a handful of "my first skill" guides out there to get your feet wet with Alexa. While this article is meant to be accessible to everyone, we'll be glossing over some of the things those beginner tutorials address in step by step detail, such as where to find your skill's app ID.
In the interest of time, we'll be using the AlexaSkill.js file from Amazon's [Alexa Skils Kit sample code on github](https://github.com/amzn/alexa-skills-kit-js) and the [oauth package](https://www.npmjs.com/package/oauth) from npm to do most of the heavy lifting for our skill. You could of course use different packages or roll your own implementation of either of these to suit your particular project's needs, but these will do just fine for our purposes.

## First thing's first

```
npm init
```
