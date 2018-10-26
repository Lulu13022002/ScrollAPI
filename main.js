/* Mobile */
/*
function isPhone() {
  return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(navigator.userAgent||navigator.vendor||window.opera)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).substr(0,4));
}*/

function storageAvailable(type) {
  try {
    var storage = window[type], x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch(e) {
    return false;
  }
}

function isMobile() {
  if(storageAvailable("sessionStorage") && "desktop" in sessionStorage) return false;
  else if(storageAvailable("localStorage") && "mobile" in localStorage) return true;
  if(navigator.maxTouchPoints || 'ontouchstart' in document.documentElement) return true
  if(typeof window.orientation !== 'undefined' || (window.screen.orientation != null && window.screen.orientation.type === "portrait-primary")) return true;
  mobile = ['iphone','ipad','android','blackberry','nokia','opera mini','windows mobile','windows phone','iemobile','tablet','mobi']; 
  var ua = navigator.userAgent.toLowerCase();
  for (var i in mobile) if(ua.indexOf(mobile[i]) > -1) return true;
  
  return false;
}

/* polyfill for IE 8 and older browsers */
(function() {
  if(!Event.prototype.preventDefault) {
    console.warn("Implement preventDefault function!");
    Event.prototype.preventDefault = function() {
     this.returnValue = false;
    };
  }

  if(!Event.prototype.stopPropagation) {
    console.warn("Implement stopPropagation function!");
    Event.prototype.stopPropagation = function() {
     this.cancelBubble = true;
    };
  }

  Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
  };
})();

var scrollAPI = (function() {
  var self = {},
  api = {},
  config = {
    target: document.documentElement
  };
  var mousewheel = (/Firefox/i.test(navigator.userAgent)) ? 'DOMMouseScroll' : 'mousewheel';
  var scrollBar = {x: 0, y: 0, scroll: true};
  self.init = function(opt) {
    opt = opt || {};
    if (!api.compatibility()) throw new EvalError('[ScrollAPI] Please update your navigator');
    api.config(opt);
    if(!config.hasOwnProperty('target')) throw new ReferenceError('[ScrollAPI] config.target is not defined');
    if(!api.isInDOM(config.target)) throw new TypeError('[ScrollAPI] config.target must be an htmlelement');
    var Pscroll = parseInt(config.scroll);
    if(config.hasOwnProperty('scroll') && !Pscroll){
      if(Pscroll === 0) throw new TypeError('[ScrollAPI] config.scroll is useless');
      else throw new TypeError('[ScrollAPI] config.scroll must be a number');
    }
    window.addEventListener("load", function() {
      setTimeout(function() {
        scrollAPI.scrollTo(config.target, Pscroll);
      });
    });
    api.addEventListener("scroll", function(e) {
      if(scrollBar.scroll) {
        /* IE Browser */
        scrollBar.x = window.pageXOffset;
        scrollBar.y = window.pageYOffset;
      }
    });
  },
  self.isEnable = function() {
    return scrollBar.scroll;
  },
  self.disable = function() {
    scrollBar.scroll = false;
    if(!isPhone()) {
      api.addEventListener('keydown', api.preventDefaultForScrollKeys);
      api.addEventListener('scroll', api.resetBar);
      api.addEventListener(mousewheel, api.preventDefault);
      api.addEventListener('mousedown', api.preventMiddleScroll);
    } else {
      config.target.style.overflow = "hidden";
      config.target.style.touchAction = "none";
    }
  },
  self.enable = function() {
    scrollBar.scroll = true;
    if(!isPhone()) {
      api.removeEventListener('keydown', api.preventDefaultForScrollKeys);
      api.removeEventListener('scroll', api.resetBar);
      api.removeEventListener(mousewheel, api.preventDefault);
      api.removeEventListener('mousedown', api.preventMiddleScroll);
    } else {
      config.target.style.overflow = "";
      config.target.style.touchAction = "";
    }
  },
  self.barWidthY = function(target) {
    target = typeof target === "undefined" ? config.target : target;
    if(api.global(target)) {
      return window.innerWidth - document.documentElement.clientWidth;
    } else {
      return target.offsetWidth - target.clientWidth;
    }
  },
  self.barWidthX = function(target) {
    target = typeof target === "undefined" ? config.target : target;
    if(api.global(target)) {
      return window.innerHeight - document.documentElement.clientHeight;
    } else {
      return target.offsetHeight - target.clientHeight;
    }
  },
  self.scrollTo = function(el, marge) {
    marge = typeof marge === "undefined" ? 0 : marge;
    window.scroll(0, el.offsetTop + marge);
  },
  self.clickedOnBar = function(opt) {
    opt = opt || {};
    if(typeof opt === 'object' && Object.size(opt)) {
      var nopt = {};
      for(var i in opt) nopt[i.toUpperCase()] = opt[i];
      return (nopt.hasOwnProperty('Y') && api.clickedOnBarY(nopt['Y'])) || (nopt.hasOwnProperty('X') && api.clickedOnBarX(nopt['X']));
    } else throw new TypeError('[ScrollAPI] clickedOnBar must have an object not empty');
  },
  self.isScrollable = function(target) {
    target = typeof target === "undefined" ? config.target : target;
    return api.isScrollable(target);
  },
  api.config = function(opt) {
    if(typeof opt === 'object' && Object.size(opt)) {
      for(var i in opt) config[i.toLowerCase()] = opt[i];
    } else throw new TypeError('[ScrollAPI] config must be an object not empty');
  },
  api.clickedOnBarY = function(mouseX) {
    var doc = config.target;
    if(doc == document.documentElement) {
      if(doc.clientWidth + doc.scrollLeft <= mouseX) return true;
    } else {
      if(doc.clientWidth <= mouseX && mouseX < doc.clientWidth + scrollAPI.barWidthY()) return true;
    }
    return false;
  },
  api.clickedOnBarX = function(mouseY) {
    var doc = config.target;
    if(doc == document.documentElement) {
      if(doc.clientHeight + doc.scrollTop <= mouseY) return true;
    } else {
      if(doc.clientHeight <= mouseY && mouseY < doc.clientHeight + scrollAPI.barWidthX()) return true;
    }
    return false;
  },
  api.compatibility = function() {
    return (document.addEventListener || document.attachEvent) && (document.removeEventListener || document.detachEvent);
  },
  api.addEventListener = function(e, f) {
    var el = config.target == document.documentElement ? document : config.target;
    if (el.addEventListener) {
      el.addEventListener(e, f, false);
    } else if (el.attachEvent) {
      el.attachEvent(e, f);
    }
  },
  api.isInDOM = function(target) {
    return (target !== undefined) && (target !== null) && !!target.ownerDocument && (window === (target.ownerDocument.defaultView || target.ownerDocument.parentWindow));
  },
  api.removeEventListener = function(e, f) {
    var el = config.target == document.documentElement ? document : config.target;
    if (el.removeEventListener) {
      el.removeEventListener(e, f, false);
    } else if (el.detachEvent) { /* IE Browser 8 */
      el.detachEvent(e, f);
    }
  },
  api.preventMiddleScroll = function(e) {
    if(api.bodyScroll(e.target)) {
      if(e.button == 1) e.preventDefault();
    }
  },
  api.isScrollable = function(e) {
    return e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight;
  },
  api.bodyScroll = function(e) {
    if(e == config.target) {
      return true;
    } else if(!api.isScrollable(e)) {
      var c = e;
      while(c.parentNode != null && !api.isScrollable(c))
        c = c.parentNode;
      return c == config.target;
    }
    return false;
  },
  api.preventDefaultForScrollKeys = function(e) {
    var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1};
    var keyCode = e.keyCode || e.which;
    if (keys[keyCode]) {
      api.preventDefault(e);
      return false;
    }
  },
  api.preventDefault = function(e) {
    e = e || window.event;
    if(api.bodyScroll(e.target)) {
      e.preventDefault();
    }
  },
  api.equals = function(e) {
    if(config.target === document.documentElement) {
      return e === document.documentElement || e === document;
    } else {
      return e === config.target;
    }
  },
  api.global = function(e) {
    return e === document.documentElement || e === document || e === window;
  },
  api.resetBar = function(e) {
    if(api.equals(e.target)) {
      config.target.scroll(scrollBar.x, scrollBar.y);
    }
  }

  return self;
})();
