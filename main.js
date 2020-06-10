/* ScrollAPI 1.1-beta . (c) The ScrollAPI contributors . github.com/Lulu13022002/ScrollAPI/blob/master/LICENSE */
(function(doc) {
  'use strict';
  var html = doc.documentElement, head = doc.getElementsByTagName('head')[0], body = doc.body;
  var self = {debug: 0, safeMode: false, useModule: false, pipoption: {'exclude': ['locate']}}, module = {}, api = {}, events = {};
  var focus = {target: null, needPatch: false};
  var G, isInit = false;

  self.init = function() {
    if(isInit) throw new EvalError("ScrollAPI << API already loaded");
    isInit = true;
    var scrollKeys = [32, 37, 38, 39, 40];

    G = module.generic = (function() {
      /* t1 = Width|Height */
      var hasValidScrollSize = function(target, isWindow, t1) {
        if(isWindow) {
          if(pipnet.canMeasureHTML) target = html;
          else target = body; // IE5
        }
        return target['scroll' + t1] > target['client' + t1];
      };
      return {
        /* t1 = Width|Height . t2 = Height|Width . t3 = x|y */
        bar: function(target, isInDOM, isWindow, t1, t2, t3) {
          if(!isInDOM) return NaN;
          if(isWindow == null) isWindow = pipnet.isWindow(target);
          if(isWindow) {
            if(('inner' + t1) in window) return window['inner' + t1] - html['client' + t1]; // Modern way
            else { // IE8- Find a shortcut...
              if(pipnet.canMeasureHTML) { // IE6-8
                var ie8 = html['offset' + t1] - html['client' + t1] - 3; // 3px is the border in IE
                if(ie8 > 0) return ie8; // IE8
                var PL = self.pip.PL;
                return html['scroll' + t2] > html['offset' + t2] && // In IE7- scrollBarY is always visible so we need an extra check for isScrollable
                       PL.CSS.get(html, 'overflow-' + t3, PL.CSS.styles(html)).indexOf('hidden') === -1 &&
                       PL.CSS.get(body, 'overflow-' + t3, PL.CSS.styles(body)).indexOf('hidden') === -1 ? 18 : 0; // IE6-7 Impossible to get this value but we know x|y = 21 with a border width of 1.5px (21 - (2*1.5) => 18) so detect only if this is scrollable (overflow)
              }
              return body['scroll' + t2] > body['offset' + t2] ? body['offset' + t1] - body['client' + t1] - 3 : 0; // IE5-
            }
          }
          return target['offset' + t1] - target['client' + t1];
        },
        /* t1 = Left|Top . t2 = Width|Height */
        percent: function(el, round, isInDOM, isWindow, t1, t2) {
          if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
          if(!isInDOM) return NaN;
          if(isWindow == null) isWindow = pipnet.isWindow(el);
          if(isWindow) el = html;
          var PL = self.pip.PL;
          var r = (PL.element['scroll' + t1](el, isWindow, 'round') / (PL.element['scroll' + t2](el, isWindow) - PL.element['client' + t2](el, isWindow))) * 100;
          return round ? Math.round(r) : r;
        },
        /* t1 = Width|Height . t2 = Height|Width . t3 = x|y . t4 = X|Y . t5 = Top|Left */
        isScrollable: function(el, isInDOM, isWindow, t1, t2, t3, t4, t5) {
          if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
          if(!isInDOM) throw new TypeError("ScrollAPI << " + el + " isn't a valid HTMLElement");
          if(isWindow == null) isWindow = pipnet.isWindow(el);
          if((isWindow ? Math.min(html['scroll' + t1], body['scroll' + t1]) : el['scroll' + t1]) === 0) return false;
          if(isWindow) el = html;

          if(!hasValidScrollSize(el, isWindow, t1)) return false;
          if(pipnet.isMobile) {
            var PL = self.pip.PL;
            var currentValue = PL.element['scroll' + t5](el, isWindow), isScrollable = !!(PL.element['increaseScroll' + t5](el, isWindow, true)); /* Simulate scroll then reset => This show if the element is scrollable but only with CODE so we need some extra check like overflow/touchaction */
            PL.element['setScroll' + t5](el, isWindow, currentValue); // Reset value before check. This check replace the check of barWidth
            if(!isScrollable) return false;
            var style = PL.CSS.styles(el);
            var targetCheck = PL.CSS.get(el, 'overflow-' + t3, style).indexOf('hidden') === -1 && PL.CSS.get(el, pipnet.deprecatedPrefix.CSS.get('-ms-') + 'touch-action', style) !== 'none';
            if(!isWindow) return targetCheck;
            else {
              var bStyle = PL.CSS.styles(body);
              return targetCheck && PL.CSS.get(body, 'overflow-' + t3, bStyle).indexOf('hidden') === -1 && PL.CSS.get(body, pipnet.deprecatedPrefix.CSS.get('-ms-') + 'touch-action', bStyle) !== 'none';
            }
          }
          return self['bar' + t2 + t4](el, isInDOM, isWindow) > 0;
        },
        /* t1 = Width|Height . t2 = Top|Left */
        atEnd: function(target, isWindow, scrollValue, t1, t2) {
          if(isWindow == null) isWindow = pipnet.isWindow(target);
          scrollValue || (scrollValue = self.pip.PL.element['scroll' + t2](target, isWindow, 'round'));
          if(isWindow) target = html;
          return target['scroll' + t1] - scrollValue === target['client' + t1];
        }
      }
    })();

    module.locate = {
      name: "ScrollAPI",
      callName: "scrollAPI",
      version: 1.1,
      state: "PRE-RELEASE"
    };

    var PL;
    pipnet.addEventListener('load', function() {
      pipnet.exports('scrollAPI', self, module, {writeInGlobal: false, writeInSelfModule: true});
      
      PL = pipnet.module['pipnet@polyfill'];
      events['barmousedown'] = PL.event.create('barMouseDown');
      events['barmouseup'] = PL.event.create('barMouseUp');
    });

    self.detach = function(target) {
      if(!target.scrollAPI) throw new EvalError("ScrollAPI << Target isn't attached to the API");
      target.scrollAPI.unassign();
    },
    self.attach = function(target) {
      if(!target) throw new ReferenceError("ScrollAPI << Target isn't defined");
      if(target.scrollAPI) throw new EvalError("ScrollAPI << API already attached for this element");
      target.scrollAPI = (function() {
        var _self = {}, _api = {};
        var scrollBar = {x: 0, y: 0, isFrozen: false}, styleS = Array(2);
        var assigned = false;

        _self.assign = function() {
          if(assigned) throw new EvalError("ScrollAPI << API already assigned for this element");
          if(!pipnet.isInDOM(target)) throw new TypeError("ScrollAPI << config::target: " + target + " isn't a valid HTMLElement");
          assigned = true;
          _api.isWindow = pipnet.isWindow(target);
          var loc = PL.element.scrollMeter(target, _api.isWindow);
          scrollBar.x = loc.x, scrollBar.y = loc.y;
          _api.addEventListener('scroll', _api.scrollOuput, false);

          if(self.debug >= 3) console.debug("ScrollAPI << New assigned element", target);
        },
        _self.unassign = function() {
          if(scrollBar.isFrozen) _self.enable();
          _api.removeEventListener('scroll', _api.scrollOuput, false);
          target.scrollAPI = null; // delete keyword is too slow and have some issues with IE7- In JS the GC is called automatically on idle object
          if(self.debug >= 3) console.debug("ScrollAPI << Unassigned element", target);
        },
        _self.isEnable = function() {
          return scrollBar.isFrozen;
        },
        _self.disable = function() {
          if(scrollBar.isFrozen) return;
          scrollBar.isFrozen = true;
          if(!pipnet.isMobile) {
            _api.addEventListener('click', api.applyFocus, false, doc); /* Apply focus to retrieve the good target for key event */
            _api.addEventListener('keydown', _api.preventDefaultForScrollKeys);
            _api.addEventListener('scroll', _api.resetBar);
            _api.addEventListener(pipnet.event.wheel.name, _api.preventDefault, {passive: false});
            _api.addEventListener('mousedown', _api.preventMiddleScroll);
          } else {
            var style = target.style;
            var msPrefix = pipnet.deprecatedPrefix.CSS.get('-ms-');
            styleS[0] = style.overflow, styleS[1] = style[msPrefix + 'touch-action'];
            target.style.overflow = "hidden"; /* Disable scroll for mobile emulation in Chromium */
            target.style[msPrefix + 'touch-action'] = "none";
          }
        },
        _self.enable = function() {
          if(!scrollBar.isFrozen) return;
          scrollBar.isFrozen = false;
          if(!pipnet.isMobile) {
            api.resetFocus();
            _api.removeEventListener('click', api.applyFocus, false, doc);
            _api.removeEventListener('keydown', _api.preventDefaultForScrollKeys);
            _api.removeEventListener('scroll', _api.resetBar);
            _api.removeEventListener(pipnet.event.wheel.name, _api.preventDefault, {passive: false});
            _api.removeEventListener('mousedown', _api.preventMiddleScroll);
          } else {
            target.style.overflow = styleS[0];
            target.style[pipnet.deprecatedPrefix.CSS.get('-ms-') + 'touch-action'] = styleS[1];
          }
        },
        _self.addEventListener = function(type, f, options) {
          self.addEventListener(target, type, f, options);
        },
        _self.removeEventListener = function(type, f, options) {
          self.removeEventListener(target, type, f, options);
        },
        _self.clickedOnBarX = function(e, x, y) {
          return self.clickedOnBarX(target, e, x, y, _api.isWindow);
        },
        _self.clickedOnBarY = function(e, x, y) {
          return self.clickedOnBarY(target, e, x, y, _api.isWindow);
        },
        _self.clickedOnBar = function(e, x, y) {
          return self.clickedOnBar(target, e, x, y, _api.isWindow);
        },
        _self.barWidthY = function() {
          return self.barWidthY(target, true, _api.isWindow);
        },
        _self.barHeightX = function() {
          return self.barHeightX(target, true, _api.isWindow);
        },
        _self.barMeter = function() {
          return self.barMeter(target, true, _api.isWindow);
        },
        _self.atEndY = function(scrollTop) {
          return self.atEndY(target, _api.isWindow, scrollTop);
        },
        _self.atEndX = function(scrollLeft) {
          return self.atEndX(target, _api.isWindow, scrollLeft);
        },
        _self.atEnd = function(scrollMeter) {
          return self.atEnd(target, _api.isWindow, scrollMeter);
        },
        _self.scrollTo = function(x, y) {
          return self.scrollTo(target, x, y, true);
        },
        _self.percentX = function(round) {
          return self.percentX(target, round, true, _api.isWindow);
        },
        _self.percentY = function(round) {
          return self.percentY(target, round, true, _api.isWindow);
        },
        _self.percent = function(round) {
          return self.percent(target, round, true, _api.isWindow);
        },
        _self.clientWidth = function() {
          return PL.element.clientWidth(target, _api.isWindow);
        },
        _self.clientHeight = function() {
          return PL.element.clientHeight(target, _api.isWindow);
        },
        _self.clientMeter = function() {
          return PL.element.clientMeter(target, _api.isWindow);
        },
        _self.isScrollableX = function(e, x, y) {
          return self.isScrollableX(target, e, x, y, _api.isWindow);
        },
        _self.isScrollableY = function(e, x, y) {
          return self.isScrollableY(target, e, x, y, _api.isWindow);
        },
        _self.isScrollable = function(e, x, y) {
          return self.isScrollable(target, e, x, y, _api.isWindow);
        };

        _api.scrollOuput = function(e) {
          if(scrollBar.isFrozen) return;
          var loc = PL.element.scrollMeter(target, _api.isWindow);
          scrollBar.x = loc.x, scrollBar.y = loc.y;
        },
        _api.addEventListener = function(type, f, arg) {
          PL.event.add(type, f, arg, target);
        },
        _api.removeEventListener = function(type, f, arg) {
          PL.event.remove(type, f, arg, target);
        },
        _api.preventMiddleScroll = function(e) {
          e = PL.source(e);
          if(e.button === 1) PL.event.preventDefault(e);
        },
        _api.preventDefaultForScrollKeys = function(e) { // Space and arrows
          e = PL.event.source(e);
          //if(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return; Different controls by each browser
          var keyCode = e.keyCode || e.which;
          if(PL.indexOf(scrollKeys, keyCode) === -1) return;

          var _target = PL.event.target(e);
          console.log(target);
          if(_target !== target) return; // Cancel prevent scroll keys in focusable element in target like textarea/input

          var parent = api.parentScrollable(_target);
          var isNull = parent == null;
          if(isNull) return;
          // check if focus element is not textarea but the target if we not change this focus method
          var loc = PL.element.scrollMeter(parent, _api.isWindow, 'round');
          if(((keyCode === 32 || keyCode === 40) && self.atEndY(parent, _api.isWindow, loc.y)) ||
             (keyCode === 39  && self.atEndX(parent, _api.isWindow, loc.x)) ||
             (keyCode === 37 && loc.x === 0) ||
             (keyCode === 38 && loc.y === 0)) return; // In IE scroll at maximum doesn't scroll the parent but this doesn't fix a feature lost in IE to avoid behavoir modifications. Moreover a patch will be too heavy including modified focus and new keydown event (api.parentScrollable(_target.parentElement)).dispatchEvent(e);
          _api.preventDefault(e, parent, !isNull); /* Deprecated but have more compatiblity and too slow to work with new value like e.key|code with support of old browsers */
        },
        _api.preventDefault = function(e, parent, isntNull) {
          e = PL.event.source(e);
          var _target = PL.event.target(e);
          parent = parent || api.parentScrollable(_target), isntNull = isntNull || parent != null;
          if(isntNull && (parent === target || (pipnet.isWindow(parent) && _api.isWindow))) PL.event.preventDefault(e);
        },
        _api.resetBar = function() {
          var wTarget = _api.isWindow ? window : target;
          if('scroll' in wTarget) wTarget.scroll(scrollBar.x, scrollBar.y);
          else PL.element.setScrollMeter(target, _api.isWindow, scrollBar.x, scrollBar.y);
        };

        return _self;
      })();
      target.scrollAPI.assign();
    };
  };

  /* Static functions */
  self.addEventListener = function(target, type, f, options) {
    if(type !== 'barMouseDown' && type !== 'barMouseUp') throw new EvalError("ScrollAPI << This method is only available with barMouseDown and barMouseUp events. Please use classic method for others events");
    this.handleEvent = function(e) {
      var type = e.type;
      if(type !== 'mousedown' && type !== 'mouseup') return;
      if(!self.clickedOnBar(target, e)) return;
      self.PL.event.fire(window, events['bar' + type], {originalTarget: target, wrapperEvent: e});
    };
    
    PL.event.add(type.substr(3).toLowerCase(), this, options, target);
    PL.event.add(type, f, options, window);
  },
  self.removeEventListener = function(target, type, f, options) {
    if(type !== 'barMouseDown' && type !== 'barMouseUp') throw new EvalError("ScrollAPI << This method is only available with barMouseDown and barMouseUp events. Please use classic method for others events");

    PL.event.remove(type.substr(3).toLowerCase(), this, options, target);
    PL.event.remove(type, f, options, window);
  },
  self.clickedOnBarX = function(target, e, x, y, isWindow) {
    return G.clickedOnBar(target, e, x, y, isWindow, 'x', 'y');
  },
  self.clickedOnBarY = function(target, e, x, y, isWindow) {
    return G.clickedOnBar(target, e, x, y, isWindow, 'y', 'x');
  },
  self.clickedOnBar = function(target, e, x, y, isWindow) {
    e = PL.source(e);
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    if(x == null || y == null) {
      var loc = pipnet.event.pointer(e, 'client');
      x = x || loc.x, y = y || loc.y;
    }
    return self.clickedOnBarX(target, e, x, y, isWindow) || self.clickedOnBarY(target, e, y, x, isWindow);
  },
  self.barHeightX = function(target, isInDOM, isWindow) {
    return G.bar(target, isInDOM, isWindow, 'Height', 'Width', 'x');
  },
  self.barWidthY = function(target, isInDOM, isWindow) {
    return G.bar(target, isInDOM, isWindow, 'Width', 'Height', 'y');
  },
  self.barMeter = function(target, isInDOM, isWindow) {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(target);
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    return {x: self.barHeightX(target, isInDOM, isWindow), y: self.barWidthY(target, isInDOM, isWindow)};
  },
  self.atEndX = function(target, isWindow, scrollTop) {
    return G.atEnd(target, isWindow, scrollTop, 'Width', 'Left');
  },
  self.atEndY = function(target, isWindow, scrollLeft) {
    return G.atEnd(target, isWindow, scrollLeft, 'Height', 'Top');
  },
  self.atEnd = function(target, isWindow, scrollMeter) {
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    scrollMeter || (scrollMeter = PL.element.scrollMeter(target, isWindow, 'round'));
    return self.atEndX(target, isWindow, scrollMeter.x) && self.atEndY(target, isWindow, scrollMeter.y);
  },
  self.scrollTo = function(target, x, y, isInDOM) { // The target is relative to window
    /* IE7- have some problem to call load event at the good time and return the good document.readyState value */
    if (!pipnet.isIE && (doc.readyState || 'complete') !== 'complete') {
      var stateChange = function() {
        setTimeout(function() {
          self.scrollTo(target, x, y, isInDOM);
        }); // Timeout is useless here but resolve bug in Chromium when user refresh the page
        PL.event.remove('load', stateChange, false, window);
      };
      PL.event.add('load', stateChange, false, window);
    } else {
      x || (x = 0), y || (y = 0);
      if(typeof target !== 'string') {
        if(isInDOM == null) isInDOM = pipnet.isInDOM(target);
        if(!isInDOM) throw new TypeError("ScrollAPI << " + target + " isn't a valid HTMLElement");
        if(x === 0 && y === 0 && 'scrollIntoView' in target) target.scrollIntoView();
        if('getBoundingClientRect' in target) { // Has more precision
          var clientRect = target.getBoundingClientRect();
          window.scrollBy(clientRect.left + x, clientRect.top + y);
        } else {
          var sM = PL.element.scrollMeter(target, true);
          window.scroll(sM.x + x, sM.y + y);
        }
      } else {
        switch(target.toLowerCase()) {
          case "start": window.scroll(x, y); break;
          case "end": window.scroll(x, (PL.element.scrollHeight(html, true) - PL.element.clientHeight(html, true)) + y); break;
        }
      }
    }
  },
  self.percentX = function(el, round, isInDOM, isWindow) {
    return G.percent(el, round, isInDOM, isWindow, 'Left', 'Width');
  },
  self.percentY = function(el, round, isInDOM, isWindow) {
    return G.percent(el, round, isInDOM, isWindow, 'Top', 'Height');
  },
  self.percent = function(el, round, isInDOM, isWindow) {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
    if(isWindow == null) isWindow = pipnet.isWindow(el);
    return {x: self.percentX(el, round, isInDOM, isWindow), y: self.percentY(el, round, isInDOM, isWindow)};
  },
  self.isScrollableX = function(el, isInDOM, isWindow) {
    return G.isScrollable(el, isInDOM, isWindow, 'Width', 'Height', 'x', 'X', 'Left');
  },
  self.isScrollableY = function(el, isInDOM, isWindow) {
    return G.isScrollable(el, isInDOM, isWindow, 'Height', 'Width', 'y', 'Y', 'Top');
  },
  self.isScrollable = function(el, isInDOM, isWindow) {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
    if(isWindow == null) isWindow = pipnet.isWindow(el);
    return self.isScrollableX(el, isInDOM, isWindow) || self.isScrollableY(el, isInDOM, isWindow);
  };

  /* API */
  api.parentScrollable = function(el) {
    while(!self.isScrollable(el, true) && el.parentElement != null) el = el.parentElement;
    if(el === html) return null; // Return body before html so body if scrollable window or html if not
    return el;
  },
  api.patchOutline = function(e) {
    e = PL.event.source(e);
    if(e.type === 'focus') {
      focus.outline = this.style.outline;
      this.style.outline = "none";
    } else this.style.outline = focus.outline; //maybe useless
  },
  api.applyFocus = function(e) {
    e = PL.event.source(e);
    var _target = PL.event.target(e);
    if(_target.tagName === 'TEXTAREA' || _target.tagName === 'INPUT') return;
    var parent = api.parentScrollable(_target);
    if(parent == null || parent === body || parent === focus.target) return;
    if(parent.getAttribute("tabindex") != null) return; /* Cancel if tabindex is predefined */
    focus.target = parent;

    if(focus.needPatch = (pipnet.useChromium && PL.CSS.get(parent, 'outline-style', PL.CSS.styles(parent)) === 'none')) { /* Cancel if outline style is predefined (this works with outline) */
      PL.event.add('focus', api.patchOutline, false, parent); /* Reset outline size and color in Chromium */
      PL.event.add('blur', api.patchOutline, false, parent);
    }

    PL.event.add('blur', api.resetFocus, false, parent);

    parent.setAttribute("tabindex", 1);
    parent.focus();
  },
  api.resetFocus = function() { /* IMPORTANT ORDER to avoid recursive functions (blur) / unstable */
    if(focus.target == null) return;
    PL.event.remove('blur', api.resetFocus, false, focus.target);

    /* Call blur event / Only for Chromium */
    if(focus.needPatch) {
      PL.event.remove('focus', api.patchOutline, false, focus.target);
      PL.event.remove('blur', api.patchOutline, false, focus.target);
    }

    focus.target.removeAttribute("tabindex"); /* Call blur event / reset focus */
    focus.target = null;
  };
  window['scrollAPI'] = self;
})(document);
