# TypeMotion

TypeMotion is a bookmarklet that provides information about vertical rythm on any page and let's you adjust it, live. Here's the code for the bookmarklet:

```
javascript:(function(){var a=document.createElement('script'),b=document.createElement('script');a.src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';b.src='http://y-lohse.github.io/TypeMotion/typemotion.js';document.body.appendChild(a);document.body.appendChild(b);})(document);
```