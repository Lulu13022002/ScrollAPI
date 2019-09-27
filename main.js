'use strict';

var scrollAPI = (function() {
  var self = {debug: false}, api = {}, module = {}, config = { target: document.documentElement };
  var scrollBar = {x: 0, y: 0, isFrozen: false};
  var save = {style: Array(2), focus: null, needPatch: false};
  var CT, PL, isInit = false;
  self.init = function(opt) {
    if(!isInit) {
      if(self.debug) {
        console.debug("ScrollAPI << Compatibility data from 'scrollAPI@compatibility' module", CT);
        console.debug("ScrollAPI << Polyfill functions from 'scrollAPI@polyfill' module", PL);
      }
      if (!CT.canUseDOM || CT.eventType == 0) throw new EvalError("ScrollAPI << Deprecated browser; please update your navigator [" + CT.agent + "]");
    }

    if(opt) api.config(opt);

    if(!config.hasOwnProperty('target')) throw new ReferenceError("ScrollAPI << config::target is not defined");
    if(!api.isInDOM(config.target)) throw new TypeError("ScrollAPI << config::target: " + config.target + " is not a valid HTMLElement");
    if(config.hasOwnProperty('scrollto')) {
      var scrollValue = Number(config.scrollto); //api.config normalize string in toLowerCase
      if(isNaN(scrollValue)) throw new TypeError("ScrollAPI << config::scrollTo: " + config.scrollto + " is not a number");
      if(scrollValue === 0) throw new TypeError("ScrollAPI << config::scrollTo: 0 is useless");
      api.addEventListener('load', function() {
        setTimeout(function() { /* Resolve bug in chromium that disable scroll at load event when user refresh page / useless for other browser */
          self.scrollTo(config.target, scrollValue);
        });
      }, false, window);
    }
    var isWindow = api.isWindow();
    var loc = PL.scrollMeter(config.target, isWindow);
    scrollBar.x = loc.x, scrollBar.y = loc.y;

    api.addEventListener('scroll', function() {
      if(!scrollBar.isFrozen) {
        loc = PL.scrollMeter(config.target, isWindow);
        scrollBar.x = loc.x, scrollBar.y = loc.y;
      }
    }, true);

    if(!isInit) {
      isInit = true;
      self.isEnable = function() {
        return scrollBar.isFrozen;
      },
      self.disable = function() {
        scrollBar.isFrozen = true;
        if(!CT.isMobile) {
          api.addEventListener('click', api.applyFocus, false, document); /* Apply focus to retrieve the good target for key event */
          api.addEventListener('keydown', api.preventDefaultForScrollKeys);
          api.addEventListener('keypress', api.preventDefaultForSpaceKey);
          api.addEventListener('scroll', api.resetBar, true);
          api.addEventListener(CT.event.wheelName, api.preventDefault);
          api.addEventListener('mousedown', api.preventMiddleScroll);
        } else {
          var style = config.target.style;
          save.style[0] = style.overflow, save.style[1] = style[CT.B.msPrefix + 'touch-action'];
          config.target.style.overflow = "hidden"; /* Disable scroll for mobile in pc devtools */
          config.target.style[CT.B.msPrefix + 'touch-action'] = "none";
        }
      },
      self.enable = function() {
        if(!scrollBar.isFrozen) return;
        scrollBar.isFrozen = false;
        if(!CT.isMobile) {
          api.resetFocus();
          api.removeEventListener('click', api.applyFocus, false, document);
          api.removeEventListener('keydown', api.preventDefaultForScrollKeys);
          api.removeEventListener('keypress', api.preventDefaultForSpaceKey);
          api.removeEventListener('scroll', api.resetBar, true);
          api.removeEventListener(CT.event.wheelName, api.preventDefault);
          api.removeEventListener('mousedown', api.preventMiddleScroll);
        } else {
          config.target.style.overflow = save.style[0];
          config.target.style[CT.B.msPrefix + 'touch-action'] = save.style[1];
        }
      },
      self.clickedOnBar = function(e, x, y) {
        e = e || window.event;
        var loc = api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
        return self.clickedOnBarY(e, x, y) || self.clickedOnBarX(e, x, y);
      },
      self.clickedOnBarY = function(e, x, y) {
        e = e || window.event;
        var doc = config.target;
        var loc = api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
        if(api.isWindow()) {
          var de = document.documentElement, sM = PL.scrollMeter(de, true);
          return de.clientWidth + sM.x <= x && y - sM.y < de.clientHeight;
        }
        return doc.offsetLeft + doc.clientWidth <= x && y < doc.clientHeight + doc.offsetTop && typeof e.target !== "undefined" && e.target === config.target;
      },
      self.clickedOnBarX = function(e, x, y) {
        e = e || window.event;
        var doc = config.target;
        var loc = api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
        if(api.isWindow()) {
          var de = document.documentElement, sM = PL.scrollMeter(de, true);
          return de.clientHeight + sM.y <= y && x - sM.x < de.clientWidth;
        }
        return doc.offsetTop + doc.clientHeight <= y && x < doc.clientWidth + doc.offsetLeft && typeof e.target !== "undefined" && e.target === config.target;
      };
    }
  };

  /* Static functions */
  self.barWidthY = function(target) {
    target = target || (isInit ? config.target : null);
    if(!api.isInDOM(target)) return NaN;
    if(api.isWindow(target)) return window.innerWidth - document.documentElement.clientWidth;
    return target.offsetWidth - target.clientWidth;
  },
  self.barHeightX = function(target) {
    target = target || (isInit ? config.target : null);
    if(!api.isInDOM(target)) return NaN;
    if(api.isWindow(target)) return window.innerHeight - document.documentElement.clientHeight;
    return target.offsetHeight - target.clientHeight;
  },
  self.scrollTo = function(el, marge) {
    el = el || (isInit ? config.target : null);
    if(!api.isInDOM(el)) throw new TypeError("ScrollAPI << " + el + " is not a valid HTMLElement");
    marge = marge || 0;
    if('getBoundingClientRect' in el) window.scrollBy(0, el.getBoundingClientRect().top + marge);
    else window.scroll(0, PL.scrollTop(el) + marge);
  },
  self.percentScroll = function(el, round) {
    el = el || (isInit ? config.target : null);
    if(!api.isInDOM(el)) return NaN;
    round = round || false;
    var r = (PL.scrollTop(el) / (el.scrollHeight - el.clientHeight)) * 100;
    return round ? Math.round(r) : r;
  },
  self.isScrollable = function(el) { /* Must be reevaluated for mobile in one context (Temporary fix) */
    el = el || (isInit ? config.target : null);
    if(!api.isInDOM(el)) throw new TypeError("ScrollAPI << " + el + " is not a valid HTMLElement");

    var isWindow = api.isWindow(el);
    if(isWindow) el = document.documentElement;
    var hasScrollWidth = el.scrollWidth > el.clientWidth, hasScrollHeight = el.scrollHeight > el.clientHeight;
    if(CT.isMobile) {
      var style = PL.CSS.styles(el);
      var defaultCheck = (hasScrollWidth || hasScrollHeight) && PL.CSS.get(el, 'overflow', style) != 'hidden' && PL.CSS.get(el, CT.B.msPrefix + 'touch-action', style) != 'none';
      if(!isWindow) return defaultCheck;
      else {
        var body = document.body, bStyle = PL.CSS.styles(body);
        return defaultCheck && PL.CSS.get(body, 'overflow', bStyle) != 'hidden' && PL.CSS.get(body, CT.B.msPrefix + 'touch-action', bStyle) != 'none';
      }
    }

    return (self.barWidthY(el) > 0 && hasScrollWidth) || (self.barHeightX(el) > 0 && hasScrollHeight);
  };

  /* Modules (disable in safeMode [feature request]) */
  /* Polyfill for IE8- and older browsers like Netscape */
  module.polyfill = (function() {
    var scrollLeft = function(el, isWindow) {
      el = el || config.target, isWindow = isWindow || api.isWindow(el);
      if(isWindow) return window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft;
      return el.scrollLeft;
    },
    scrollTop = function(el, isWindow) {
      el = el || config.target, isWindow = isWindow || api.isWindow(el);
      if(isWindow) return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop; /* Modern browsers => IE6 - IE8 => IE5- */
      return el.scrollTop;
    };

    return {
      indexOf: function(array, searchElement, fromIndex) {
        if(Array.prototype.indexOf) return Array.prototype.indexOf.call(array, searchElement, fromIndex);
        else {
          if (array == null) throw new TypeError("can't convert " + array + " to object");
          array = Object(array); /* Support for string */
          var l = array.length >>> 0, i = Math.min(fromIndex | 0, l);
          if (i < 0) i = Math.max(0, l + i);
          else if (i >= l) return -1;
          if (searchElement === void 0) {        // undefined
            for (; i !== l; ++i) {
              if (array[i] === void 0 && i in array) return i;
            }
          } else if (searchElement !== searchElement) return -1; // Since NaN !== NaN, it will never be found. Fast-path it.
          else {                    // all else
            for (; i !== l; ++i) {
              if (array[i] === searchElement) return i;
            }
            return -1; // if the value was not found, then return -1
          }
        }
      },
      keys: function(obj) {
        if(Object.keys) return Object.keys.call(null, obj);
        else {
          var array = [];
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) array.push(key);
          }
          return array;
        }
      },
      preventDefault: function(e) {
        e.preventDefault();
        e.returnValue = false;
      },
      'scrollLeft': scrollLeft,
      'scrollTop': scrollTop,
      scrollMeter: function(el, isWindow) {
        el = el || config.target, isWindow = isWindow || api.isWindow(el);
        return {x: scrollLeft(el, isWindow), y: scrollTop(el, isWindow)};
      },
      /* JQuery polyfill: github.com/jquery/jquery */
      CSS: (function(core_pnum, rmargin, rposition, fcomputed) {
        var rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"), getStyles;
        var html = document.documentElement, doc = html.ownerDocument, docView = doc.defaultView;
        if(fcomputed || (doc && docView && 'getComputedStyle' in docView)) {
          getStyles = function(elem) {
            return (fcomputed ? window : elem.ownerDocument.defaultView).getComputedStyle(elem, null);
          };
          return {
            styles: getStyles,
            get: function(elem, name, _computed) {
              var computed = _computed || getStyles(elem),
                  ret = computed ? computed.getPropertyValue(name) || computed[name] : undefined,
                  style = elem.style;
              if(computed) {
                  /* Edit - removed edge case as requires lots more jQuery code
                  if (ret === "" && !jQuery.contains(elem.ownerDocument, elem)) {ret = jQuery.style(elem, name)}*/
                if(rnumnonpx.test(ret) && rmargin.test(name)) {
                  var width = style.width;
                  var minWidth = style.minWidth, maxWidth = style.maxWidth;
                  style.minWidth = style.maxWidth = style.width = ret;
                  ret = computed.width;
                  style.width = width;
                  style.minWidth = minWidth;
                  style.maxWidth = maxWidth;
                }
              }
              return ret;
            }
          };
        } else if ('currentStyle' in html) {
          getStyles = function(elem) { return elem.currentStyle; };
          return {
            styles: getStyles,
            get: function(elem, name, _computed) {
              try {
                var computed = _computed || getStyles(elem),
                    ret = computed ? computed[name] : undefined, style = elem.style;
                if(ret == null && style && style[name]) ret = style[name];
                if(rnumnonpx.test(ret) && !rposition.test(name)) {
                  var left = style.left, rs = elem.runtimeStyle;
                  var rsLeft = rs && rs.left;
                  if (rsLeft) rs.left = elem.currentStyle.left;
                  style.left = name === "fontSize" ? "1em" : ret;
                  ret = style.pixelLeft + "px";
                  style.left = left;
                  if (rsLeft) rs.left = rsLeft;
                }
                return ret === "" ? "auto" : ret;
              } catch(e) {}
            }
          };
        }
      })(/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source, /^margin/, /^(top|right|bottom|left)$/, 'getComputedStyle' in window)
    };
  })();
  PL = module.polyfill;

  module.compatiblity = (function(agent) {
    if(!agent) throw new EvalError("ScrollAPI << Unknown browser; please change your navigator with a valid userAgent");
    /* These two variables and api.isEventSupported are based on facebook archive: github.com/facebookarchive/fixed-data-table */
    var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement),
        useHasFeature = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature('', '') !== true;
    var api = {
      isEventSupported: function(eventNameSuffix, capture) {
        if (!canUseDOM || capture && !('addEventListener' in document)) return false;

        var eventName = "on" + eventNameSuffix;
        var isSupported = eventName in document;

        if (!isSupported) {
          var element = document.createElement('div');
          element.setAttribute(eventName, 'return;');
          isSupported = typeof element[eventName] === "function";
        }

        if (!isSupported && useHasFeature && eventNameSuffix === 'wheel')
          isSupported = document.implementation.hasFeature('Events.wheel', '3.0');
          // This is the only way to test support for the `wheel` event in IE9+.

        return isSupported;
      },
      getBrowserVersion: function(regex) {
        var raw = agent.match(regex);
        return raw ? parseInt(raw[raw.length -1], 10) : NaN;
      },
      isBrowser: function(nameId) {
        return PL.indexOf(agent, nameId) !== -1;
      }
    };

    return {
      'agent': agent,
      'canUseDOM': canUseDOM,
      'useHasFeature': useHasFeature,
      event: {
        type: (function() {
          if('addEventListener' in window && 'removeEventListener' in window) return 2;
          if('attachEvent' in window && 'detachEvent' in window) return 1;
          return 0;
        })(),
        wheelName: api.isEventSupported('wheel') ? 'wheel' : (api.isBrowser("Firefox") ? 'DOMMouseScroll' : 'mousewheel')
      },
      /* Mozilla ref: developer.mozilla.org/fr/docs/Web/API/EventTarget/addEventListener#Détection_en_toute_sécurité_du_support_des_options */
      supportsPassive: (function() { /* Find multiple way */
        var isSupported = false;
        try {
          var opts = Object.defineProperty({}, 'passive', {
            get: function() { isSupported = true; }
          });
          window.addEventListener('testPassive', null, opts);
          window.removeEventListener('testPassive', null, opts);
        } catch(e) {}
        return isSupported;
      })(),
      B: {
        chromium: api.getBrowserVersion(/Chrom(e|ium)\/([0-9]+)\./),
        msPrefix: api.isBrowser('Trident') ? "-ms-" : ""
      },
      /* Find multiple way */
      isMobile: /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(agent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0, 4))
    };
  })(navigator.userAgent||navigator.vendor||window.opera||null);
  CT = module.compatiblity;

  /* API */
  api.config = function(opt) {
    if(typeof opt === 'object') {
      var keys = PL.keys(opt), i = keys.length;
      while (i--) config[keys[i].toLowerCase()] = opt[keys[i]];
    }
  },
  api.isInDOM = function(target) {
    if(!target || typeof target !== "object" || !CT.canUseDOM || !('children' in target)) return false;
    if(PL.indexOf(['SCRIPT', 'STYLE', 'META', 'TITLE', 'HEAD', 'LINK'], target.nodeName) !== -1 || document.getElementsByTagName("head")[0].contains(target)) return false;
    var owner = target.ownerDocument;
    return owner && (window == (owner.defaultView || owner.parentWindow));
                          /*=== exception in IE8- => return false */
  },
  api.passiveCase = function(type, argument) {
    if(typeof argument === "boolean") {
      if(CT.supportsPassive) {
        if(!argument) {
          // Scrolling intervention by Chromium => developers.google.com/web/updates/2019/02/scrolling-intervention#the_intervention
          if(type == CT.event.wheelName && CT.B.chromium >= 73) return {passive: false}; /* Passive is defined by default to true in the latest Chromium for wheel/mousewheel event (73+) */
        } else return {passive: true};
      }
    } else if(typeof argument === "object") {
      if(!argument.hasOwnProperty('passive')) return argument;
      else if(CT.supportsPassive) return argument;
    }
    return false;
  },
  api.addEventListener = function(type, f, argument, el) {
    argument = argument || false;
    el = el || (api.isWindow() ? document : config.target);
    if (CT.event.type == 2) el.addEventListener(type, f, api.passiveCase(type, argument));
    else el.attachEvent(type, f);
  },
  api.removeEventListener = function(type, f, argument, el) {
    argument = argument || false;
    el = el || (api.isWindow() ? document : config.target);
    if (CT.event.type == 2) el.removeEventListener(type, f, api.passiveCase(type, argument));
    else el.detachEvent(type, f); /* IE8- */
  },
  api.patchOutline = function(e) {
    e = e || window.event;
    if(e.type == 'focus') {
      save.outline = this.style.outline;
      this.style.outline = "none";
    } else this.style.outline = save.outline; //maybe useless
  },
  api.applyFocus = function(e) {
    e = e || window.event;
    var parent = api.parentScrollable(e.target);
    if(parent == document.body) return;
    if(parent == save.focus) return;
    if(parent.getAttribute("tabindex") != null) return; /* Cancel if tabindex is predefined */
    save.focus = parent;

    if(save.needPatch = (CT.B.chromium != NaN && PL.CSS.get(parent, 'outlineStyle', PL.CSS.styles(parent)) == 'none')) { /* Cancel if outline style is predefined (this works with outline) */
      api.addEventListener('focus', api.patchOutline, false, parent); /* Reset outline size and color in Chromium */
      api.addEventListener('blur', api.patchOutline, false, parent);
    }

    api.addEventListener('blur', api.resetFocus, false, parent);

    parent.setAttribute("tabindex", 1);
    parent.focus();
  },
  api.resetFocus = function() { /* IMPORTANT ORDER to avoid recursive functions (blur) / unstable */
    if(save.focus == null) return;
    api.removeEventListener('blur', api.resetFocus, false, save.focus);

    /* Call blur event / Only for Chromium */
    if(save.needPatch) {
      api.removeEventListener('focus', api.patchOutline, false, save.focus);
      api.removeEventListener('blur', api.patchOutline, false, save.focus);
    }

    save.focus.removeAttribute("tabindex"); /* Call blur event / reset focus */
    save.focus = null;
  },
  api.preventMiddleScroll = function(e) {
    e = e || window.event;
    if(e.button == 1) api.preventDefault(e);
  },
  api.parentScrollable = function(el) {
    while(!self.isScrollable(el) && el.parentElement != null) el = el.parentElement;
    return el;
  },
  api.preventDefaultForKeys = function(e, keys) {
    e = e || window.event;
    //if(e.ctrlKey || e.altKey || e.shiftKey) return; Different controls by each browser
    var keyCode = e.keyCode || e.which; /* Deprecated but have more compatiblity and too slow to work with new value like e.key|code with support of old browsers */
    if (PL.indexOf(keys, keyCode) !== -1) api.preventDefault(e);
  },
  api.preventDefaultForScrollKeys = function(e) { // Arrows
    api.preventDefaultForKeys(e, [37, 38, 39, 40]);
  },
  api.preventDefaultForSpaceKey = function(e) { // Space
    api.preventDefaultForKeys(e, [32]);
  },
  api.preventDefault = function(e, isSave) {
    e = e || window.event;
    var parent = api.parentScrollable(e.target);
    if(parent == config.target || (api.isWindow(parent) && api.isWindow(config.target))) PL.preventDefault();
  },
  api.pointerEvent = function(e) {
    var type = e.type;
    var mobile = ['touchstart', 'touchmove', 'touchend', 'touchcancel'];
    var pc = ['mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'];
    var h = PL.indexOf(mobile, type) !== -1;
    if(h || PL.indexOf(pc, type) !== -1) {
      var tar = h ? (e.targetTouches || e.changedTouches || e.touches)[0] : e;
      return {x: tar.pageX, y: tar.pageY};
    }
    throw new EvalError("ScrollAPI << " + type + " is not supported !");
  },
  api.isWindow = function(el) {
    el = el || config.target;
    return el === document.documentElement || el === document.body;
  },
  api.resetBar = function() {
    (api.isWindow() ? window : config.target).scroll(scrollBar.x, scrollBar.y);
  };
  return self;
})();
