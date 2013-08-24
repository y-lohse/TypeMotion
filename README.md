# TypeMotion

TypeMotion is a bookmarklet that provides information about typographic rythm on any page and let's you adjust it, live. More details & demo on [the project page](http://yannick-lohse.fr/TypeMotion/).

Here's the code for the bookmarklet:
```
javascript:(function(){var a=document.createElement('script'),b=document.createElement('script');a.src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';b.src='http://y-lohse.github.io/TypeMotion/typemotion.js?'+Math.floor((new Date)/(864e5));document.body.appendChild(a);document.body.appendChild(b);})(document);
```