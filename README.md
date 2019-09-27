# ScrollAPI v1.0
A simple scroll api for a website

[![MIT License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](https://opensource.org/licenses/MIT)
[![Generic badge](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Lulu13022002/ScrollAPI/blob/master/CONTRIBUTING)

### Installation
  copy and paste the main.js and add `<script src="/main.js"></script>` in the html file
  or use directly `$ git clone https://github.com/Lulu13022002/ScrollAPI`

### Usage of functions
  argument => [] = optional
  * scrollAPI.init([config]) : [void] init the api (if the config is empty, target is document.documentElement and debug is false)
    config = {target: [HTMLElement], scrollTo: [number], debug: [boolean]};
  * scrollAPI.isEnable() : [boolean] check if the scrollAPI.disable is enable
  * scrollAPI.scrollTo(el, marge) : [void] scroll to the element defined with a marge
  * scrollAPI.enable() : [void] enable the scrollbar
  * scrollAPI.disable() : [void] disable the scrollbar
  * scrollAPI.barWidthY([target]) : [number] get the width of scrollbar at right
  * scrollAPI.barWidthX([target]) : [number] get the width of scrollbar at bottom
  * scrollAPI.clickedOnBarY(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at right
  * scrollAPI.clickedOnBarX(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at bottom
  * scrollAPI.clickedOnBar(e[, x, y]) : [boolean] clickedOnBarY(e[, x, y]) || clickedOnBarX(e[, x, y]) 
  * scrollAPI.percentScroll([target, round]) : [number] get the percent of scrolled
  * scrollAPI.isScrollable([target]) : [boolean] check if the element is scrollable (overflow, height)
  
### Examples
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.init({ //target is document.documentElement by default
      scroll: -70 //scroll to the target with a marge of -70
    });
    console.log(scrollAPI.isEnable());
    console.log(scrollAPI.barWidthY());
    console.log(scrollAPI.isScrollable()); //html element
    scrollAPI.disable();
    setTimeout(function() {
      scrollAPI.enable();
    }, 1000); //1000 == 1s
    document.addEventListener("mousedown", function(e) {
      console.log("right bar: " + scrollAPI.clickedOnBarY(e));
      console.log("bottom bar: " + scrollAPI.clickedOnBarX(e));
      console.log("bottom/right bar: " + scrollAPI.clickedOnBar(e));
    }, false);
  });
  ```
  
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.init({
      target: document.getElementById('el')
    });
    console.log(scrollAPI.isEnable());
    console.log(scrollAPI.barWidthY());
    console.log(scrollAPI.isScrollable()); //el element
    scrollAPI.disable();
    setTimeout(function() {
      scrollAPI.enable();
    }, 1000); //1000 == 1s
    document.getElementById('el').addEventListener("mousedown", function(e) {
      console.log("right bar: " + scrollAPI.clickedOnBarY(e));
      console.log("bottom bar: " + scrollAPI.clickedOnBarX(e));
      console.log("bottom/right bar: " + scrollAPI.clickedOnBar(e));
    }, false);
  });
  ```
  
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.init();
    document.addEventListener('scroll', function() {
      console.log('scrolled percent: ' + scrollAPI.percentScroll() + ' %');
    });
   });
  ```
  
  Static functions
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.scrollTo(document.getElementById('el'), 10);
    console.log('scrolled percent: ' + scrollAPI.percentScroll(document.getElementById('el')) + ' %');
    console.log(scrollAPI.barWidthY(document.getElementById('el')));
    console.log(scrollAPI.isScrollable(document.getElementById('el'))); //el element
  });
  ```
  
  
### Modules
  * scrollAPI@compatibility: compatibility data
  * scrollAPI@polyfill: polyfill functions
  
### Branches
  - [master](https://github.com/Lulu13022002/ScrollAPI) stable project
  - [development](https://github.com/Lulu13022002/ScrollAPI/tree/development) last update
  of project but there may be some bugs
  
### References
  * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill), [Array.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill) from 'scrollAPI@compatibility'
  * isEventSupported, useHasFeature, canUseDOM from 'scrollAPI@polyfill': [facebookarchive/fixed-data-table](https://github.com/facebookarchive/fixed-data-table)
  * CSS interface from 'scrollAPI@polyfill': [JQuery](https://github.com/jquery/jquery)
  
  
