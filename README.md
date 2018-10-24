# ScrollAPI v1.0
A simple scroll api for a website

### Installation
  copy and paste the main.js and add `<script src="/main.js"></script> in the html file`
  
### Usage of functions
  * scroll.init(config) : [void] init the api
  * scrollAPI.isEnable() : [boolean] check if the scrollbar is enable
  * scrollAPI.scrollTo(el, marge) : [void] scroll to the element defined with a marge
  * scrollAPI.enable() : [void] enable the scrollbar
  * scrollAPI.disable() : [void] disable the scrollbar
  * scrollAPI.barWidthY() : [number] get the width of scrollbar at right
  * scrollAPI.barWidthX() : [number] get the width of scrollbar at bottom
  * scrollAPI.clickedOnBar({Y: mouseX}) : [boolean] check if the user has clicked on the scrollbar at right
  * scrollAPI.clickedOnBar({X: mouseY}) : [boolean] check if the user has clicked on the scrollbar at bottom
  * scrollAPI.clickedOnBar({Y: mouseX, X: mouseY}) : [boolean] clickedOnBarY() || clickedOnBarX()
  * scrollAPI.isScrollable([target]) : [boolean] check if the element is scrollable
  
### Examples
  ```javascript
  window.addEventListener("load", function() {
    scrollAPI.init({
      target: document.documentElement, //target
      scroll: -70 //scroll to the target with a marge of -70
    }),
    console.log(scrollAPI.isEnable());
    console.log(scrollAPI.barWidthY());
    console.log(scrollAPI.isScrollable()); //html element
    console.log(scrollAPI.isScrollable(document.body)); //body element
    scrollAPI.disable();
    setTimeout(function() {
      scrollAPI.enable();
    }, 1000); //1000 == 1s
    document.addEventListener("mousedown", function(e) {
      console.log("right bar: " + scrollAPI.clickedOnBar({Y: e.offsetX}));
      console.log("bottom bar: " + scrollAPI.clickedOnBar({X: e.offsetY}));
      console.log("bottom/right bar: " + scrollAPI.clickedOnBar({Y: e.offsetX, X: e.offsetY}));
    }, false);
  });
  ```
