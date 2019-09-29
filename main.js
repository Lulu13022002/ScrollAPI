var scrollAPI = (function(html) {
  'use strict';
  var self = {debug: false, safeMode: false}, api = {}, module = {};
  var focus = {target: null, needPatch: false}
  var CT, PL, isInit = false;
  self.init = function(modules) {
    if(!isInit) {
      isInit = true;

      /* Polyfill for IE8-  */
      module.polyfill = (function() {
        var scrollLeft = function(el, isWindow) {
          el = el || config.target, isWindow = isWindow || api.isWindow(el);
          if(isWindow) return window.pageXOffset || html.scrollLeft || document.body.scrollLeft;
          return el.scrollLeft;
        },
        scrollTop = function(el, isWindow) {
          el = el || config.target, isWindow = isWindow || api.isWindow(el);
          if(isWindow) return window.pageYOffset || html.scrollTop || document.body.scrollTop; /* Modern browsers => IE6 - IE8 => IE5- */
          return el.scrollTop;
        };

        return {
          indexOf: function(o, searchElement, fromIndex) {
            if(Array.prototype.indexOf) return Array.prototype.indexOf.call(o, searchElement, fromIndex);
            else {
              if (o == null) throw new TypeError("PL.indexOf called on null or undefined"); // Firefox's error is "can't convert [array] to objectect" but chromium and microsoft return this message so i choose the majority to avoid a real check between navigator (CT::api.isBrowser('Firefox'))
              o = Object(o);
              var len = o.length >>> 0;
              if (len === 0) return -1;
              var n = fromIndex | 0;
              if (n >= len) return -1;
              var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
              for (; k < len; k++) {
                if (k in o && o[k] === searchElement) return k;
              }
              return -1;
            }
          },
          keys: function(o) {
            if(Object.keys) return Object.keys.call(null, o);
            else {
              var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
                  dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf', 'propertyIsEnumerable', 'constructor'],
                  dontEnumsLength = 7;

              if (typeof o !== 'function' && (typeof o !== 'object' || o === null)) throw new TypeError('PL.keys called on non-object');

              var result = [], prop, i;

              for (prop in o) {
                if (hasOwnProperty.call(o, prop)) result.push(prop);
              }

              if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                  if (hasOwnProperty.call(o, dontEnums[i])) result.push(dontEnums[i]);
                }
              }
              return result;
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
          /* jQuery polyfill: github.com/jquery/jquery */
          CSS: (function(core_pnum, rmargin, rposition, fcomputed) {
            var rnumnonpx = new RegExp("^(" + core_pnum + ")(?!px)[a-z%]+$", "i"), getStyles;
            var doc = html.ownerDocument, docView = doc.defaultView;
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
                    /* Edit - support jQuery to speed up this part */
                    if (ret === "") {
                      var jQ = window.jQuery;
                      if(jQ && !jQ.contains(elem.ownerDocument, elem)) ret = jQ.style(elem, name);
                    }
                    if(rnumnonpx.test(ret) && rmargin.test(name)) {
                      var width = style.width;
                      var minWidth = style.minWidth, maxWidth = style.maxWidth;
                      style.minWidth = style.maxWidth = style.width = ret;
                      ret = computed.width;
                      style.width = width;
                      style.minWidth = minWidth, style.maxWidth = maxWidth;
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

      module.compatibility = (function(agent) {
        if(!agent) throw new EvalError("ScrollAPI << Unknown browser; please change your navigator with a valid userAgent");
        /* These two variables and api.isEventSupported are based on facebook archive: github.com/facebookarchive/fixed-data-table */
        var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement),
            useHasFeature = document.implementation && document.implementation.hasFeature && document.implementation.hasFeature('', '') !== true;
        var api = {
          /* Edit - support target to work with specific event like change select error... */
          isEventSupported: function(eventNameSuffix, target, capture) {
            target = target || document;
            if (!canUseDOM || capture && !('addEventListener' in target)) return false;

            var eventName = "on" + eventNameSuffix;
            var isSupported = eventName in target;

            if (!isSupported) {
              var element = target || document.createElement('div');
              var nullAttribute = target == null || element.getAttribute(eventName) == null;
              if(nullAttribute) element.setAttribute(eventName, 'return;');
              isSupported = typeof element[eventName] === "function";
              if(nullAttribute) element.removevAttribute(eventName);
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
            return agent.indexOf(nameId) !== -1;
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
          supportsPassive: (function() {
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
            useChromium: api.isBrowser("Chrome") || api.isBrowser("Chromium"),
            msPrefix: api.isBrowser('Trident') ? "-ms-" : ""
          },
          isMobile: (function() {
            if(navigator.maxTouchPoints || 'ontouchstart' in html) return true
            if(typeof window.orientation !== 'undefined' || (window.screen.orientation != null && window.screen.orientation.type === "portrait-primary")) return true;
            try { document.createEvent("TouchEvent"); return true; } catch(e) {}
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(agent)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(agent.substr(0,4));
          })()
        };
      })(navigator.userAgent||navigator.vendor||window.opera||null);
      CT = module.compatibility;

      if(self.debug) {
        console.debug("ScrollAPI << Loaded 'scrollAPI@compatibility' module", CT);
        console.debug("ScrollAPI << Loaded 'scrollAPI@polyfill' module", PL);
      }
      if(modules) {
        if(typeof modules !== 'object') throw new TypeError("ScrollAPI << Can't automatically merge config because " + modules + " isn't an object");
        if(!self.safeMode) api.mergeObjects(module, modules, true);
        else {
          var nb = PL.keys(modules).length;
          console.warn("ScrollAPI << " + nb + " custom module" + (nb > 1 ? "s" : "") + " ignored because safeMode is enabled");
        }
      }
      self.module = module;
      if (!CT.canUseDOM || CT.eventType == 0) throw new EvalError("ScrollAPI << Deprecated browser; please update your navigator [" + CT.agent + "]");

      self.detach = function(target) {
        if(!target.scrollAPI) throw new ReferenceError("ScrollAPI << target isn't binded to the API");
        target.scrollAPI = undefined; // delete keyword too slow
      },
      self.attach = function(target, opt) {
        if(!target) throw new ReferenceError("ScrollAPI << target isn't defined");
        if(!target.scrollAPI) {
          target.scrollAPI = (function() {
            var childSelf = {}, childApi = {}, config = {};
            var scrollBar = {x: 0, y: 0, isFrozen: false}, styleS = Array(2);
            var called = false;

            childSelf.call = function(opt) {
              if(!called) {
                if(opt) {
                  if(typeof opt !== 'object') throw new TypeError("ScrollAPI << Can't automatically merge config because " + opt + " isn't an object");
                  api.mergeObjects(config, opt);
                }

                if(!api.isInDOM(target)) throw new TypeError("ScrollAPI << config::target: " + target + " isn't a valid HTMLElement");
                if(config.hasOwnProperty('scrollto')) { //api.config normalize string in toLowerCase
                  var y = 0, scrollTo = config.scrollto, type = typeof scrollTo, errVarMsg = "config::scrollTo";
                  if(type === "number" || type === "string") y = api.convertNumber(scrollTo, errMsg);
                  else if(type === "object") {
                    if(scrollTo.hasOwnProperty('pos')) target = scrollTo.pos;
                    if(scrollTo.hasOwnProperty('x')) x = api.convertNumber(scrollTo.x, errVarMsg + ".x");
                    else if(scrollTo.hasOwnProperty('y')) y = api.convertNumber(scrollTo.y, errVarMsg + ".y");
                    else throw new TypeError("ScrollAPI << " + errVarMsg + ": " + scrollTo + " isn't an object with x or y defined");
                  } else throw new TypeError("ScrollAPI << " + errVarMsg + ": " + scrollTo + " isn't a number or an object");
                  childApi.addEventListener('load', function() {
                    setTimeout(self.scrollTo.bind(target, x, y));
                  }, false, window);
                }
                var isWindow = api.isWindow(target);
                var loc = PL.scrollMeter(target, isWindow);
                scrollBar.x = loc.x, scrollBar.y = loc.y;

                childApi.addEventListener('scroll', function() {
                  if(!scrollBar.isFrozen) {
                    loc = PL.scrollMeter(target, isWindow);
                    scrollBar.x = loc.x, scrollBar.y = loc.y;
                  }
                }, true);
              } else throw new EvalError("ScrollAPI << already loaded for this element");
            },
            childSelf.isEnable = function() {
              return scrollBar.isFrozen;
            },
            childSelf.disable = function() {
              scrollBar.isFrozen = true;
              if(!CT.isMobile) {
                childApi.addEventListener('click', api.applyFocus, false, document); /* Apply focus to retrieve the good target for key event */
                childApi.addEventListener('keydown', childApi.preventDefaultForScrollKeys);
                childApi.addEventListener('keypress', childApi.preventDefaultForSpaceKey);
                childApi.addEventListener('scroll', childApi.resetBar, true);
                childApi.addEventListener(CT.event.wheelName, childApi.preventDefault);
                childApi.addEventListener('mousedown', childApi.preventMiddleScroll);
              } else {
                var style = target.style;
                styleS[0] = style.overflow, styleS[1] = style[CT.B.msPrefix + 'touch-action'];
                target.style.overflow = "hidden"; /* Disable scroll for mobile in pc devtools */
                target.style[CT.B.msPrefix + 'touch-action'] = "none";
              }
            },
            childSelf.enable = function() {
              if(!scrollBar.isFrozen) return;
              scrollBar.isFrozen = false;
              if(!CT.isMobile) {
                api.resetFocus();
                childApi.removeEventListener('click', api.applyFocus, false, document);
                childApi.removeEventListener('keydown', childApi.preventDefaultForScrollKeys);
                childApi.removeEventListener('keypress', childApi.preventDefaultForSpaceKey);
                childApi.removeEventListener('scroll', childApi.resetBar, true);
                childApi.removeEventListener(CT.event.wheelName, childApi.preventDefault);
                childApi.removeEventListener('mousedown', childApi.preventMiddleScroll);
              } else {
                target.style.overflow = styleS[0];
                target.style[CT.B.msPrefix + 'touch-action'] = styleS[1];
              }
            },
            childSelf.clickedOnBar = function(e, x, y) {
              e = e || window.event;
              var loc = api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
              return childSelf.clickedOnBarY(e, x, y, loc) || childSelf.clickedOnBarX(e, x, y, loc);
            },
            childSelf.clickedOnBarY = function(e, x, y, pointerEvent) {
              e = e || window.event;
              var doc = target;
              var loc = pointerEvent || api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
              if(api.isWindow(doc)) {
                var sM = PL.scrollMeter(html, true);
                return html.clientWidth + sM.x <= x && y - sM.y < html.clientHeight;
              }
              return doc.offsetLeft + doc.clientWidth <= x && y < doc.clientHeight + doc.offsetTop && typeof e.target !== "undefined" && e.target === target;
            },
            childSelf.clickedOnBarX = function(e, x, y, pointerEvent) {
              e = e || window.event;
              var doc = target;
              var loc = pointerEvent || api.pointerEvent(e), x = x || loc.x, y = y || loc.y;
              if(api.isWindow(doc)) {
                var sM = PL.scrollMeter(html, true);
                return html.clientHeight + sM.y <= y && x - sM.x < html.clientWidth;
              }
              return doc.offsetTop + doc.clientHeight <= y && x < doc.clientWidth + doc.offsetLeft && typeof e.target !== "undefined" && e.target === target;
            },
            childSelf.barWidthY = function(isInDOM, isWindow) {
              return self.barWidthY(target, isInDOM, isWindow);
            },
            childSelf.barHeightX = function(isInDOM, isWindow) {
              return self.barHeightX(target, isInDOM, isWindow);
            },
            childSelf.barMeter = function(isInDOM, isWindow) {
              return self.barMeter(target, isInDOM, isWindow);
            },
            childSelf.scrollTo = function(x, y) {
              return self.scrollTo(target, x, y);
            },
            childSelf.percentScroll = function(round) {
              return self.percentScroll(target, round);
            },
            childSelf.isScrollable = function() {
              return self.isScrollable(target);
            };

            childApi.addEventListener = function(type, f, argument) {
              api.addEventListener(type, f, argument, target);
            },
            childApi.removeEventListener = function(type, f, argument) {
              api.removeEventListener(type, f, argument, target);
            },
            childApi.preventMiddleScroll = function(e) {
              e = e || window.event;
              if(e.button == 1) childApi.preventDefault(e);
            },
            childApi.parentScrollable = function() {
              var el = target;
              while(!childSelf.isScrollable() && el.parentElement != null) el = el.parentElement;
              return el;
            },
            childApi.preventDefaultForKeys = function(e, keys) {
              e = e || window.event;
              //if(e.ctrlKey || e.altKey || e.shiftKey) return; Different controls by each browser
              var keyCode = e.keyCode || e.which; /* Deprecated but have more compatiblity and too slow to work with new value like e.key|code with support of old browsers */
              if (PL.indexOf(keys, keyCode) !== -1) childApi.preventDefault(e);
            },
            childApi.preventDefaultForScrollKeys = function(e) { // Arrows
              childApi.preventDefaultForKeys(e, [37, 38, 39, 40]);
            },
            childApi.preventDefaultForSpaceKey = function(e) { // Space
              childApi.preventDefaultForKeys(e, [32]);
            },
            childApi.preventDefault = function(e, isSave) {
              e = e || window.event;
              var parent = api.parentScrollable(e.target);
              if(parent == target || (api.isWindow(parent) && api.isWindow(target))) PL.preventDefault(e);
            },
            childApi.resetBar = function() {
              (api.isWindow(target) ? window : target).scroll(scrollBar.x, scrollBar.y);
            };

            return childSelf;
          })();
          target.scrollAPI.call(opt);
        }
      };
    } else throw new EvalError("ScrollAPI << API already loaded");
  };

  /* Static functions */
  self.barWidthY = function(target, isInDOM, isWindow) {
    isInDOM = isInDOM || api.isInDOM(target), isWindow = isWindow || api.isWindow(target);
    if(!isInDOM) return NaN;
    if(isWindow) return window.innerWidth - html.clientWidth;
    return target.offsetWidth - target.clientWidth;
  },
  self.barHeightX = function(target, isInDOM, isWindow) {
    isInDOM = isInDOM || api.isInDOM(target), isWindow = isWindow || api.isWindow(target);
    if(!isInDOM) return NaN;
    if(isWindow) return window.innerHeight - html.clientHeight;
    return target.offsetHeight - target.clientHeight;
  },
  self.barMeter = function(target, isInDOM, isWindow) {
    isInDOM = isInDOM || api.isInDOM(target), isWindow = isWindow || api.isWindow(target);
    return {x: self.barHeightX(target), y: self.barWidthY(target)};
  },
  self.scrollTo = function(target, x, y) {
    x = x || 0, y = y || 0;
    if(typeof target !== "string") {
      if(!api.isInDOM(target)) throw new TypeError("ScrollAPI << " + target + " isn't a valid HTMLElement");
      if('getBoundingClientRect' in target) {
        var clientRect = target.getBoundingClientRect();
        window.scrollBy(clientRect.left + x, clientRect.top + y);
      } else {
        var sM = PL.scrollMeter(target);
        window.scroll(sM.x + x, sM.y + y);
      }
    } else {
      switch(target.toLowerCase()) {
        case "start": window.scroll(0 + x, 0 + y); break;
        case "end": window.scroll((html.scrollWidth - html.clientWidth) + x, (html.scrollHeight - html.clientHeight) + y); break;
      }
    }
  },
  self.percentScroll = function(el, round) {
    if(!api.isInDOM(el)) return NaN;
    round = round || false;
    var r = (PL.scrollTop(el) / (el.scrollHeight - el.clientHeight)) * 100;
    return round ? Math.round(r) : r;
  },
  self.isScrollable = function(el) { /* Must be reevaluated for mobile in one context (Temporary fix) */
    var isInDOM = api.isInDOM(el);
    if(!isInDOM) throw new TypeError("ScrollAPI << " + el + " isn't a valid HTMLElement");

    var isWindow = api.isWindow(el);
    if(isWindow) el = html;
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
    var bar = self.barMeter(el, isInDOM, isWindow);
    return (bar.x > 0 && hasScrollHeight) || (bar.y > 0 && hasScrollWidth);
  };

  /* API */
  api.mergeObjects = function(config, opt, onlyNewKeys) {
    onlyNewKeys = onlyNewKeys || false;
    var keys = PL.keys(opt), i = keys.length;
    while (i--) {
      var key = keys[i];
      var lKey = key.toLowerCase();
      if(onlyNewKeys) {
        if(config.hasOwnProperty(lKey)) {
          console.warn("ScrollAPI << Module 'custom@" + key + "' ignored: this name is reserved for the default modules");
          continue;
        }
        if(self.debug) console.debug("ScrollAPI << Loaded 'custom@" + key + "' module", opt[key]);
      }
      config[lKey] = opt[key];
    }
  },
  api.isInDOM = function(target) {
    if(!target || typeof target !== "object" || !CT.canUseDOM || !('children' in target)) return false;
    if(PL.indexOf(['SCRIPT', 'STYLE', 'META', 'TITLE', 'HEAD', 'LINK'], target.nodeName) !== -1 || document.getElementsByTagName("head")[0].contains(target)) return false;
    var owner = target.ownerDocument;
    return owner && (window == (owner.defaultView || owner.parentWindow)); /*=== exception in IE8- => return false */
  },
  api.parentScrollable = function(el) {
    while(!self.isScrollable(el) && el.parentElement != null) el = el.parentElement;
    return el;
  },
  api.isPassiveEvent = function(type) {
    var events = ['scroll', CT.B.wheelName,
                  'touchstart', 'touchmove', 'touchenter', 'touchend', 'touchleave',
                  'mouseover', 'mouseenter', 'mousedown', 'mousemove', 'mouseup', 'mouseleave', 'mouseout'];
    return PL.indexOf(events, type) !== -1;
  },
  api.supportsDefaultValueOption = function(type, arg) {
    if(typeof arg === "boolean") {
      if(CT.supportsPassive && api.isPassiveEvent(type)) return {passive: arg};
      /* Scrolling intervention by Chromium => developers.google.com/web/updates/2019/02/scrolling-intervention#the_intervention
         => Default passive value to true: Chromium 73+ for wheel/mousewheel events / (Chromium 55+ and Firefox 61+) for touchstart/touchmove events */
    } else if(typeof arg === "object") {
      if(!arg.hasOwnProperty('passive')) return arg;
      else if(CT.supportsPassive) return arg;
    }
    return false;
  },
  api.patchOutline = function(e) {
    e = e || window.event;
    if(e.type == 'focus') {
      focus.outline = this.style.outline;
      this.style.outline = "none";
    } else this.style.outline = focus.outline; //maybe useless
  },
  api.applyFocus = function(e) {
    e = e || window.event;
    var parent = api.parentScrollable(e.target);
    if(parent == document.body) return;
    if(parent == focus.target) return;
    if(parent.getAttribute("tabindex") != null) return; /* Cancel if tabindex is predefined */
    focus.target = parent;

    if(focus.needPatch = (CT.B.useChromium && PL.CSS.get(parent, 'outlineStyle', PL.CSS.styles(parent)) == 'none')) { /* Cancel if outline style is predefined (this works with outline) */
      api.addEventListener('focus', api.patchOutline, false, parent); /* Reset outline size and color in Chromium */
      api.addEventListener('blur', api.patchOutline, false, parent);
    }

    api.addEventListener('blur', api.resetFocus, false, parent);

    parent.setAttribute("tabindex", 1);
    parent.focus();
  },
  api.resetFocus = function() { /* IMPORTANT ORDER to avoid recursive functions (blur) / unstable */
    if(focus.target == null) return;
    api.removeEventListener('blur', api.resetFocus, false, focus.target);

    /* Call blur event / Only for Chromium */
    if(focus.needPatch) {
      api.removeEventListener('focus', api.patchOutline, false, focus.target);
      api.removeEventListener('blur', api.patchOutline, false, focus.target);
    }

    focus.target.removeAttribute("tabindex"); /* Call blur event / reset focus */
    focus.target = null;
  },
  api.addEventListener = function(type, f, argument, el) {
    argument = argument || false;
    el = el || document;
    if (CT.event.type == 2) el.addEventListener(type, f, api.supportsDefaultValueOption(type, argument));
    else el.attachEvent(type, f); /* IE8- */
  },
  api.removeEventListener = function(type, f, argument, el) {
    argument = argument || false;
    el = el || document;
    if (CT.event.type == 2) el.removeEventListener(type, f, api.supportsDefaultValueOption(type, argument));
    else el.detachEvent(type, f);
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
    throw new EvalError("ScrollAPI << " + type + " isn't supported !");
  },
  api.convertNumber = function(nb, vari) {
    var cNb = Number(nb);
    if(isNaN(cNb)) throw new TypeError("ScrollAPI << " + vari + ": " + nb + " isn't a number");
    return cNb;
  },
  api.isWindow = function(el) {
    return el === html || el === document.body;
  };
  return self;
})(document.documentElement);
