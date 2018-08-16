var se = false;
var scrollBar = {x: 0, y: 0};
var scrollAPI = {
  init : function() {
    document.addEventListener("scroll", function(e) {
      if(!se) {
        /* IE Browser */
        var x = typeof window.scrollX !== "undefined" ? window.scrollX : window.pageXOffset;
        var y = typeof window.scrollY !== "undefined" ? window.scrollY : window.pageYOffset;
        scrollBar.x = x;
        scrollBar.y = y;
      }
    });
  },
  barWidth : function() {
    return window.innerWidth - document.documentElement.clientWidth;
  },
  clickedOnBarY : function(mouseX) {
    if(document.documentElement.clientWidth <= mouseX){
      return true;
    }
    return false;
  },
  clickedOnBarX : function (mouseY){
    if(document.documentElement.clientHeight <= mouseY){
      return true;
    }
    return false;
  },
  clickedOnBar : function(mouseX, mouseY){
    return scrollAPI.clickedOnBarX(mouseY) || scrollAPI.clickedOnBarY(mouseX);
  },
  preventMiddleScroll : function(e) {
    if(scrollAPI.bodyScroll(e.target)) {
      if(e.button == 1) e.preventDefault();
    }
  },
  isScrollable : function(e) {
    return e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight;
  },
  body : function(e) {
    return e == document || e == document.documentElement;
  },
  bodyScroll : function(e) {
    if(scrollAPI.body(e)) {
      return true;
    } else if(!scrollAPI.isScrollable(e)) {
      var c = e;
      while(c.parentNode != null && !scrollAPI.isScrollable(c)) {
        c = c.parentNode;
      }
      if(scrollAPI.body(c)) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  },
  preventDefaultForScrollKeys : function(e) {
    var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1};
    if (keys[e.keyCode]) {
      scrollAPI.preventDefault(e);
      return false;
    }
  },
  preventDefault : function(e) {
    if(scrollAPI.bodyScroll(e.target)) {
      e = e || window.event;
      if (e.preventDefault) e.preventDefault();
      e.returnValue = false;
    }
  },
  resetBar : function(e) {
    if(scrollAPI.body(e.target)) scroll(scrollBar.x, scrollBar.y);
  },
  isEnable : function() {
    return !se;
  },
  disable : function() {
    se = true;
    if(!isPhone()) {
      if (document.addEventListener) {
        document.addEventListener('DOMMouseScroll', scrollAPI.preventDefault, false);
        document.addEventListener('keydown', scrollAPI.preventDefaultForScrollKeys, false);
        document.addEventListener("scroll", scrollAPI.resetBar, false);
        document.addEventListener("mousewheel", scrollAPI.preventDefault, false);
        document.addEventListener("mousedown", scrollAPI.preventMiddleScroll, false);
      }
    } else {
      document.documentElement.style.overflowY = "hidden";
      document.documentElement.style.touchAction = "none";
    }
  },
  enable : function() {
    se = false;
    if(!isPhone()) {
     if (document.removeEventListener) {
    document.removeEventListener('DOMMouseScroll', scrollAPI.preventDefault, false);
    document.removeEventListener('keydown', scrollAPI.preventDefaultForScrollKeys, false);
    document.removeEventListener("scroll", scrollAPI.resetBar, false);
    document.removeEventListener("mousewheel", scrollAPI.preventDefault, false);
    document.removeEventListener("mousedown", scrollAPI.preventMiddleScroll, false);
    }
    } else {
    document.documentElement.style.overflowY = "";
    document.documentElement.style.touchAction = "";
    }
  }
};
