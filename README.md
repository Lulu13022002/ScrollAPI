# ScrollAPI
A scroll api for a website only for body element

### Usage of functions
  scrollAPI.isEnable() : [boolean] check if the scrollbar is disable
  
  scrollAPI.enable() : [void] enable the scrollbar
  scrollAPI.disable() : [void] disable the scrollbar
  scrollAPI.barWidth() : [number] get the width of scrollbar
  scrollAPI.clickedOnBarX(mouseY) : [boolean] check if the user has clicked on the scrollbar at right
  scrollAPI.clickedOnBarY(mouseX) : [boolean] check if the user has clicked on the scrollbar at bottom
  scrollAPI.clickedOnBar(mouseX, mouseY) : [boolean] clickedOnBarY() || clickedOnBarX
  scrollAPI.isScrollable(element) : [boolean] check if the element is scrollable
  
### Examples
  ```javascript
  window.addEventListener("load", function() {
    console.log(scrollAPI.isEnable());
    console.log(scrollAPI.barWidth());
    console.log(scrollAPI.isScrollable(document.body));
    scrollAPI.disable();
    setTimeout(function() {
      scrollAPI.enable();
    }, 1000); //1000 == 1s
    document.addEventListener("mousedown", function(e) {
      console.log("right bar: " + scrollAPI.clickedOnBarX(e.offsetY));
      console.log("bottom bar: " + scrollAPI.clickedOnBarY(e.offsetX));
      console.log("bottom/right bar: " + scrollAPI.clickedOnBar(e.offsetX, e.offsetY));
    }, false);
  });```
