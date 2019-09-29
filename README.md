# ScrollAPI [Development branch]
A simple scroll api for a website

[![MIT License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](https://opensource.org/licenses/MIT)
[![Generic badge](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Lulu13022002/ScrollAPI/blob/master/CONTRIBUTING)

### Installation
  copy and paste the main.js and add `<script src="/main.js"></script>` in the html file
  or use directly `$ git clone https://github.com/Lulu13022002/ScrollAPI`

### Usage of functions
  argument => [] = optional
  * scrollAPI.init([modules]) : [void] init the api with your own modules or empty
  * scrollAPI.isEnable() : [boolean] check if the scrollAPI.disable has been called
  * scrollAPI.scrollTo(target, x, y) : [void] scroll to the target defined with a marge (x or y). Target can be HTMLElement, "start" or "end"
  * scrollAPI.enable() : [void] enable the scroll
  * scrollAPI.disable() : [void] disable the scroll
  * scrollAPI.barWidthY([target]) : [number] get the width of scrollbar at right
  * scrollAPI.barHeightX([target]) : [number] get the width of scrollbar at bottom
  * scrollAPI.barMeter([target]) : [object] call {x: barHeightX([target]), y: barWidthY([target]}
  * scrollAPI.clickedOnBarY(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at right
  * scrollAPI.clickedOnBarX(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at bottom
  * scrollAPI.clickedOnBar(e[, x, y]) : [boolean] clickedOnBarY(e[, x, y]) || clickedOnBarX(e[, x, y]) 
  * scrollAPI.percentScroll([target, round]) : [number] get the percent of scrolled
  * scrollAPI.isScrollable([target]) : [boolean] check if the element is scrollable (overflow, height)
  
### In practice
  ```javascript
  scrollAPI.init();
  scrollAPI.attach(el);
  var instance = el.scrollAPI;
  window.addEventListener("load", function() {
    console.log(instance.isEnable());
    console.log(instance.barWidthY());
    console.log(instance.isScrollable());
    instance.disable();
    setTimeout(instance.enable, 1000); //1000ms == 1s
  }, false);
  
  var supportsPassive = scrollAPI.module.compatibility.supportsPassive;
  document.addEventListener("mousedown", function(e) {
    console.log("right bar: " + instance.clickedOnBarY(e));
    console.log("bottom bar: " + instance.clickedOnBarX(e));
    console.log("bottom/right bar: " + instance.clickedOnBar(e));
  }, supportsPassive ? {passive: true} : false);
  
  document.addEventListener('scroll', function() {
    console.log('scrolled percent: ' + instance.percentScroll() + ' %');
  }, supportsPassive ? {passive: true} : false);
  ```
  
  Implements your custom modules
  ```javascript
  var modules = {
    test: {
      vers: 1.5
    }
  };
  scrollAPI.init(modules);
  window.addEventListener("load", function() {
    console.log("Module test version -> " + scrollAPI.module.test.vers);
  }, false);
  ```
  > **Note**: You cannot implement a module with the same name that existing in default modules or in your modules. By default the reserved name are compatibility and polyfill. Maybe i will fixe that in the future for the default modules to allow custom@polyfill and custom@compatibility
  
  Debug and safe mode
  ```javascript
  scrollAPI.safeMode = true; // Disable all custom modules
  scrollAPI.debug = true; // Show debug messages
  scrollAPI.init();
  ```
  
  Static functions
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.scrollTo(el, 0, 10);
    console.log('scrolled percent: ' + scrollAPI.percentScroll(el) + ' %');
    console.log(scrollAPI.barWidthY(el));
    console.log(scrollAPI.isScrollable(el));
    setTimeout(function() {
      scrollAPI.scrollTo("start", 0, 100);
    }, 1000);
    setTimeout(function() {
      scrollAPI.scrollTo("end", 0, -100);
    }, 2000);
  }, false);
  ```
  
  
### Modules
  * scrollAPI@compatibility: compatibility data
  * scrollAPI@polyfill: polyfill functions
  
### Branches
  - [master](https://github.com/Lulu13022002/ScrollAPI) stable project
  - [development](https://github.com/Lulu13022002/ScrollAPI/tree/development) last update of project but there may be some bugs
  
### References
  * [Object.keys](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Polyfill), [Array.prototype.indexOf](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf#Polyfill),
  [supportsPassive](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Improving_scrolling_performance_with_passive_listeners) from 'scrollAPI@compatibility': Mozilla
  * isEventSupported, useHasFeature, canUseDOM from 'scrollAPI@polyfill': [facebookarchive/fixed-data-table](https://github.com/facebookarchive/fixed-data-table)
  * CSS interface from 'scrollAPI@polyfill': [JQuery](https://github.com/jquery/jquery)
