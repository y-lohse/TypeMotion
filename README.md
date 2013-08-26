# TypeMotion

TypeMotion is a bookmarklet that provides information about typographic rythm on any page and let's you adjust it, live. More details & demo on [the project page](http://yannick-lohse.fr/TypeMotion/).

Here's the code for the bookmarklet:
```
javascript:(function(){var a=document.createElement('script'),b=document.createElement('script');a.src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js';b.src='http://y-lohse.github.io/TypeMotion/typemotion.min.js?'+Math.floor((new Date)/(864e5));document.body.appendChild(a);document.body.appendChild(b);})(document);
```

### Sidenodes

TypeMotion tends to add a couple of spaces within certain circunstences. I'll fix it at some point, but it's not enough to thrown the computations off too much, so no big deal.

When computing the measures, the last lines of paragraphs are ignored because they would significantly impact the average.

[Other sidenotes](http://yannick-lohse.fr/2013/08/26/typemotion.html)
