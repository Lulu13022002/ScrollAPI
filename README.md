# ScrollAPI v1.0
A simple scroll api for a website

### Installation
  copy and paste the main.js and add `<script src="/main.js"></script> in the html file`
  
### Usage of functions
  argument => [] = optional
  * scroll.init([config]) : [void] init the api (if the config is empty, target is document.documentElement)
  * scrollAPI.isEnable() : [boolean] check if the scrollbar is enable
  * scrollAPI.scrollTo(el, marge) : [void] scroll to the element defined with a marge
  * scrollAPI.enable() : [void] enable the scrollbar
  * scrollAPI.disable() : [void] disable the scrollbar
  * scrollAPI.barWidthY([target]) : [number] get the width of scrollbar at right
  * scrollAPI.barWidthX([target]) : [number] get the width of scrollbar at bottom
  * scrollAPI.clickedOnBarY(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at right
  * scrollAPI.clickedOnBarX(e[, x, y]) : [boolean] check if the user has clicked on the scrollbar at bottom
  * scrollAPI.clickedOnBar(e[, x, y]) : [boolean] clickedOnBarY(e[, x, y]) || clickedOnBarX(e[, x, y]) 
  * scrollAPI.isScrollable([target]) : [boolean] check if the element is scrollable
  
### Examples
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.init({ //target is document.documentElement by default
      scroll: -70 //scroll to the target with a marge of -70
    }),
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
    }),
    console.log(scrollAPI.isEnable());
    console.log(scrollAPI.barWidthY());
    console.log(scrollAPI.isScrollable()); //el element
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
  
  Static functions
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.scrollTo(document.getElementById('el'), 10);
    console.log(scrollAPI.barWidthY(document.getElementById('el')));
    console.log(scrollAPI.isScrollable(document.getElementById('el'))); //el element
  });
  ```
