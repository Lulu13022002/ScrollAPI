# ScrollAPI
A simple scroll api for a website
The main usage of the library is to freeze the scrolling while display a modal box or a floating menu. But there are also a lot of utility things.

[![MIT License](https://img.shields.io/badge/License-MIT-lightgrey.svg)](https://opensource.org/licenses/MIT)
[![Generic badge](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Lulu13022002/ScrollAPI/blob/master/CONTRIBUTING)

### Usage
  There are two ways to use this library (one file per way)
  - scroll.js (modern API)
  - scroll_legacy.js (legacy API and support IE 5+)
  
  You should copy the file of your choice and add a script block in the html file as the following:\
  `<script src="/scroll.js"></script>`\
  The legacy version needs pipnet in order to work properly.
  Also if you decide to use pipnet you should be sure that pipnet will be loaded before this library (and initialized before).

### Usage of functions
  [parameter] = optional
  * scrollAPI.init([modules]) : [void] init the api with your own modules or empty
  * scrollAPI.isFrozen() : [boolean] check if the scroll bar is frozen
  * scrollAPI.scrollTo(target, x, y) : [void] scroll to the target defined with a marge (x or y). Target can be HTMLElement, "start" or "end"
  * scrollAPI.unfreeze() : [void] freeze the scroll bar
  * scrollAPI.freeze() : [void] unfreeze the scroll bar
  * scrollAPI.barWidthY([target]) : [number] get the width of scrollbar at right
  * scrollAPI.barHeightX([target]) : [number] get the width of scrollbar at bottom
  * scrollAPI.barMeter([target]) : [object] call {x: barHeightX([target]), y: barWidthY([target]}
  * scrollAPI.clickedOnBarY(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at right
  * scrollAPI.clickedOnBarX(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at bottom
  * scrollAPI.clickedOnBar(e[, x, y]) : [boolean] clickedOnBarY(e[, x, y]) || clickedOnBarX(e[, x, y]) 
  * scrollAPI.percentScroll([target, round]) : [number] get the percent of scrolled
  * scrollAPI.isScrollable([target]) : [boolean] check if the element is scrollable (child size > parent size: overflow, height)
  
### In practice (modern API)
  ```javascript
  scrollAPI.init();
  scrollAPI.attach(el);
  const instance = el.scrollAPI;
  window.addEventListener('load', () => {
    console.log(instance.isFrozen());
    console.log(instance.barWidthY());
    console.log(instance.isScrollable());
    instance.freeze();
    setTimeout(instance.enable, 1000); //1000ms == 1s
  }, false);
  
  // if you support old browser and use the legacy API you must check every "new" methods with pipnet
  // var supportsPassive = pipnet.event.supportsPassive;
  const supportsPassive = true;
  
  document.addEventListener('mousedown', e => {
    console.log("right bar: " + instance.clickedOnBarY(e));
    console.log("bottom bar: " + instance.clickedOnBarX(e));
    console.log("bottom/right bar: " + instance.clickedOnBar(e));
  }, supportsPassive ? {passive: true} : false);
  
  document.addEventListener('scroll', () => {
    console.log("scrolled percent: " + instance.percentScroll() + " %");
  }, supportsPassive ? {passive: true} : false);
  ```
  
  Implements your custom modules
  ```javascript
  const modules = {
    test: {
      vers: 1.5
    }
  };
  scrollAPI.init(modules);
  window.addEventListener('load', () => {
    console.log("Module test version -> " + scrollAPI.module.test.vers);
  }, false);
  ```
  > **Note**: You cannot implement a module with the same name that existing in default modules or in your modules. By default the reserved name are compatibility and polyfill. Maybe i will fix that in the future for the default modules to allow custom namespace like: custom@polyfill and custom@compatibility
  
  Debug and safe mode
  ```javascript
  scrollAPI.safeMode = true; // Disable all custom modules
  scrollAPI.debug = true; // Show debug messages
  scrollAPI.init();
  ```
  
  Static functions
  ```javascript
  window.addEventListener('load', function() {
    scrollAPI.scrollTo(el, 0, 10);
    console.log("scrolled percent: " + scrollAPI.percentScroll(el) + " %");
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
  - [master](https://github.com/Lulu13022002/ScrollAPI) stable state
  - [development](https://github.com/Lulu13022002/ScrollAPI/tree/development) lastest update of the library but there may be some bugs (test are mandatory)
