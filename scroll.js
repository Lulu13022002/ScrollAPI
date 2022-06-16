/* ScrollAPI 1.1-beta . (c) The ScrollAPI contributors . github.com/Lulu13022002/ScrollAPI/blob/master/LICENSE */
(doc => {
  'use strict';
  const html = doc.documentElement, head = doc.getElementsByTagName('head')[0], body = doc.body;
  const self = {debug: 0, safeMode: false, useModule: false, pipoption: {'exclude': ['locate']}}, module = {}, api = {}, events = {};
  const focus = {target: null, needPatch: false};
  let G, isInit = false;

  self.init = function() {
    if(isInit) throw new EvalError("ScrollAPI << API already loaded");
    isInit = true;
    const scrollKeys = [32, 37, 38, 39, 40];

    G = module.generic = (() => {
      /* t1 = Width|Height */
      const hasValidScrollSize = (target, isWindow, t1) => {
        if(isWindow) {
          if(pipnet.canMeasureHTML) target = html;
          else target = body; // IE5
        }
        return target['scroll' + t1] > target['client' + t1];
      };
      return {
        // todo rework fail for element on toggle bar
        /* t1 = Width|Height . t2 = Height|Width . t3 = x|y */
        bar: (target, isInDOM, isWindow, t1, t2, t3) => {
          if(!isInDOM) return NaN;
          if(isWindow == null) isWindow = pipnet.isWindow(target);

          const oldOverflowStyle = (isWindow ? html : target).style.msOverflowStyle;
          (isWindow ? html : target).style.msOverflowStyle = 'scrollbar'; // fix WinJS apps

          let result = 0;
          if(isWindow) result = window['inner' + t1] - Math.min(document.body['offset' + t1], html['client' + t1]);
          else result = target['offset' + t1] - target['client' + t1];

          (isWindow ? html : target).style.msOverflowStyle = oldOverflowStyle;

          return result;
        },
        /* t1 = Left|Top . t2 = Width|Height */
        percent: (el, round, isInDOM, isWindow, t1, t2) => {
          if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
          if(!isInDOM) return NaN;
          if(isWindow == null) isWindow = pipnet.isWindow(el);
          if(isWindow) el = html;
          const PL = self.pip.PL;
          const result = (Math.round(api['scroll' + t1](el, isWindow)) / (api['scroll' + t2](el, isWindow) - api['client' + t2](el, isWindow))) * 100;
          return round ? Math.round(result) : result;
        },
        /* t1 = Width|Height . t2 = Height|Width . t3 = x|y . t4 = X|Y . t5 = Top|Left */
        isScrollable: (el, isInDOM, isWindow, t1, t2, t3, t4, t5) => {
          console.log("scrollable");
          if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
          if(!isInDOM) throw new TypeError("ScrollAPI << " + el + " isn't a valid HTMLElement");
          if(isWindow == null) isWindow = pipnet.isWindow(el);
          if((isWindow ? Math.min(html['scroll' + t1], body['scroll' + t1]) : el['scroll' + t1]) === 0) return false;
          if(isWindow) el = html;

          if(!hasValidScrollSize(el, isWindow, t1)) return false;
          if(pipnet.isMobile) {
            //const PL = self.pip.PL;
            //const currentValue = api['scroll' + t5](el, isWindow), isScrollable = !!(PL.element['increaseScroll' + t5](el, isWindow, true)); /* Simulate scroll then reset => This show if the element is scrollable but only with CODE so we need some extra check like overflow/touchaction */
            const currentValue = api['scroll' + t5](el, isWindow), isScrollable = !!(++(isWindow ? html : el)['scroll' + t5]); /* Simulate scroll then reset => This show if the element is scrollable but only with CODE so we need some extra check like overflow/touchaction */
            (isWindow ? html : el)['scroll' + t5] = currentValue; // Reset value before check. This check replace the check of barWidth
            if(!isScrollable) return false;

            const targetCheck = el.style['overflow-' + t3].indexOf('hidden') === -1 && el.style['touch-action'] !== 'none';
            if(!isWindow) return targetCheck;
            
            return targetCheck && body.style['overflow-' + t3].indexOf('hidden') === -1 && body.style['touch-action'] !== 'none';
          }
          return true;
        },
        /* t1 = Width|Height . t2 = Top|Left */
        atEnd: (target, isWindow, scrollValue, t1, t2) => {
          if(isWindow == null) isWindow = pipnet.isWindow(target);
          scrollValue || (scrollValue = Math.round(api['scroll' + t2](target, isWindow)));
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

    // todo allow non dep
    let PL;
    pipnet.addEventListener('load', () => {
      pipnet.exports('scrollAPI', self, module, {writeInGlobal: false, writeInSelfModule: true});
      
      PL = pipnet.module['pipnet@polyfill'];
      events['barmousedown'] = api.createEvent('barMouseDown');
      events['barmouseup'] = api.createEvent('barMouseUp');
    }, false);

    self.detach = target => {
      if(!target.scrollAPI) throw new EvalError("ScrollAPI << Target isn't attached to the API");
      target.scrollAPI.unassign();
    },
    self.attach = target => {
      if(!target) throw new ReferenceError("ScrollAPI << Target isn't defined");
      if(target.scrollAPI) throw new EvalError("ScrollAPI << API already attached for this element");
      target.scrollAPI = (() => {
        const _self = {}, _api = {};
        const scrollBar = {x: 0, y: 0, isFrozen: false}, styleS = Array(2);
        let assigned = false;

        _self.assign = () => {
          if(assigned) throw new EvalError("ScrollAPI << API already assigned for this element");
          if(!pipnet.isInDOM(target)) throw new TypeError("ScrollAPI << config::target: " + target + " isn't a valid HTMLElement");
          assigned = true;
          _api.isWindow = pipnet.isWindow(target);
          const loc = api.scrollMeter(target, _api.isWindow);
          scrollBar.x = loc.x, scrollBar.y = loc.y;
          window.addEventListener('scroll', _api.scrollOuput, false);

          if(self.debug >= 3) console.debug("ScrollAPI << New assigned element", target);
        },
        _self.unassign = () => {
          if(scrollBar.isFrozen) _self.enable();
          _api.removeEventListener('scroll', _api.scrollOuput, false);
          target.scrollAPI = null; // delete keyword is too slow and have some issues with IE7- In JS the GC is called automatically on idle object
          if(self.debug >= 3) console.debug("ScrollAPI << Unassigned element", target);
        },
        _self.isFrozen = () => {
          return scrollBar.isFrozen;
        },
        _self.freeze = () => {
          if(scrollBar.isFrozen) return;
          scrollBar.isFrozen = true;
          if(!pipnet.isMobile) {
            window.addEventListener('click', api.applyFocus, false, doc); /* Apply focus to retrieve the good target for key event */
            window.addEventListener('keydown', _api.preventDefaultForScrollKeys);
            window.addEventListener('scroll', _api.resetBar);
            window.addEventListener(pipnet.event.wheel.name, _api.preventDefault, {passive: false});
            window.addEventListener('mousedown', _api.preventMiddleScroll);
          } else {
            const style = target.style;
            styleS[0] = style.overflow, styleS[1] = style['touch-action'];
            target.style.overflow = "hidden"; /* Disable scroll for mobile emulation in Chromium */
            target.style['touch-action'] = "none";
          }
        },
        _self.unfreeze = () => {
          if(!scrollBar.isFrozen) return;
          scrollBar.isFrozen = false;
          if(!pipnet.isMobile) {
            api.resetFocus();
            window.removeEventListener('click', api.applyFocus, false, doc);
            window.removeEventListener('keydown', _api.preventDefaultForScrollKeys);
            window.removeEventListener('scroll', _api.resetBar);
            window.removeEventListener(pipnet.event.wheel.name, _api.preventDefault, {passive: false});
            _api.removeEventListener('mousedown', _api.preventMiddleScroll);
          } else {
            target.style.overflow = styleS[0];
            target.style['touch-action'] = styleS[1];
          }
        },
        _self.addEventListener = (type, f, options) => {
          self.addEventListener(target, type, f, options);
        },
        _self.removeEventListener = (type, f, options) => {
          self.removeEventListener(target, type, f, options);
        },
        _self.clickedOnBarX = (e, x, y) => {
          return self.clickedOnBarX(target, e, x, y, _api.isWindow);
        },
        _self.clickedOnBarY = (e, x, y) => {
          return self.clickedOnBarY(target, e, x, y, _api.isWindow);
        },
        _self.clickedOnBar = (e, x, y) => {
          return self.clickedOnBar(target, e, x, y, _api.isWindow);
        },
        _self.barWidthY = () => {
          return self.barWidthY(target, true, _api.isWindow);
        },
        _self.barHeightX = () => {
          return self.barHeightX(target, true, _api.isWindow);
        },
        _self.barMeter = () => {
          return self.barMeter(target, true, _api.isWindow);
        },
        _self.atEndY = scrollTop => {
          return self.atEndY(target, _api.isWindow, scrollTop);
        },
        _self.atEndX = scrollLeft => {
          return self.atEndX(target, _api.isWindow, scrollLeft);
        },
        _self.atEnd = scrollMeter => {
          return self.atEnd(target, _api.isWindow, scrollMeter);
        },
        _self.scrollTo = (x, y) => {
          return self.scrollTo(target, x, y, true);
        },
        _self.percentX = round => {
          return self.percentX(target, round, true, _api.isWindow);
        },
        _self.percentY = round => {
          return self.percentY(target, round, true, _api.isWindow);
        },
        _self.percent = round => {
          return self.percent(target, round, true, _api.isWindow);
        },
        _self.clientWidth = () => {
          return (_api.isWindow ? html : target).clientWidth;
        },
        _self.clientHeight = () => {
          return (_api.isWindow ? html : target).clientHeight;
        },
        _self.clientMeter = () => {
          return api.clientMeter(target, _api.isWindow);
        },
        _self.isScrollableX = (e, x, y) => {
          return self.isScrollableX(target, e, x, y, _api.isWindow);
        },
        _self.isScrollableY = (e, x, y) => {
          return self.isScrollableY(target, e, x, y, _api.isWindow);
        },
        _self.isScrollable = (e, x, y) => {
          return self.isScrollable(target, e, x, y, _api.isWindow);
        };

        _api.scrollOuput = e => {
          if(scrollBar.isFrozen) return;
          const loc = api.scrollMeter(target, _api.isWindow);
          scrollBar.x = loc.x, scrollBar.y = loc.y;
        },
        _api.preventMiddleScroll = e => {
          if(e.button === 1) e.preventDefault();
        },
        _api.preventDefaultForScrollKeys = e => { // Space and arrows
          //if(e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return; Different controls by each browser
          const keyCode = e.keyCode || e.which;
          if(scrollKeys.indexOf(keyCode) === -1) return;

          const _target = e.target;
          console.log(target);
          if(_target !== target) return; // Cancel prevent scroll keys in focusable element in target like textarea/input

          const parent = api.parentScrollable(_target);
          const isNull = parent == null;
          if(isNull) return;
          // check if focus element is not textarea but the target if we not change this focus method
          const loc = Math.round(api.scrollMeter(parent, _api.isWindow));
          if(((keyCode === 32 || keyCode === 40) && self.atEndY(parent, _api.isWindow, loc.y)) ||
             (keyCode === 39  && self.atEndX(parent, _api.isWindow, loc.x)) ||
             (keyCode === 37 && loc.x === 0) ||
             (keyCode === 38 && loc.y === 0)) return; // In IE scroll at maximum doesn't scroll the parent but this doesn't fix a feature lost in IE to avoid behavoir modifications. Moreover a patch will be too heavy including modified focus and new keydown event (api.parentScrollable(_target.parentElement)).dispatchEvent(e);
          _api.preventDefault(e, parent, !isNull); /* Deprecated but have more compatiblity and too slow to work with new value like e.key|code with support of old browsers */
        },
        _api.preventDefault = (e, parent, notNull) => {
          const _target = e.target;
          parent = parent || api.parentScrollable(_target), notNull = notNull || parent != null;
          if(notNull && (parent === target || (pipnet.isWindow(parent) && _api.isWindow))) e.preventDefault();
        },
        _api.resetBar = () => {
          (_api.isWindow ? window : targe).scroll(scrollBar.x, scrollBar.y);
        };

        return _self;
      })();
      target.scrollAPI.assign();
    };
  };

  /* Static functions */
  self.addEventListener = function(target, type, f, options) {
    if(type !== 'barMouseDown' && type !== 'barMouseUp') throw new EvalError("ScrollAPI << This method is only available with barMouseDown and barMouseUp events. Please use classic method for others events");
    this.handleEvent = e => {
      const type = e.type;
      if(type !== 'mousedown' && type !== 'mouseup') return;
      if(!self.clickedOnBar(target, e)) return;

      const evn = events['bar' + type];
      evn.originalTarget = target;
      evn.wrapperEvent = e;
      window.dispatchEvent(evn);
    };
    
    target.addEventListener(type.substr(3).toLowerCase(), this, options, target);
    window.addEventListener(type, f, options, window);
  },
  self.removeEventListener = function(target, type, f, options) {
    if(type !== 'barMouseDown' && type !== 'barMouseUp') throw new EvalError("ScrollAPI << This method is only available with barMouseDown and barMouseUp events. Please use classic method for others events");

    target.removeEventListener(type.substr(3).toLowerCase(), this, options);
    window.removeEventListener(type, f, options);
  },
  self.clickedOnBarX = (target, e, x, y, isWindow) => {
    return G.clickedOnBar(target, e, x, y, isWindow, 'x', 'y');
  },
  self.clickedOnBarY = (target, e, x, y, isWindow) => {
    return G.clickedOnBar(target, e, x, y, isWindow, 'y', 'x');
  },
  self.clickedOnBar = (target, e, x, y, isWindow) => {
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    if(x == null || y == null) {
      const loc = pipnet.event.pointer(e, 'client');
      x = x || loc.x, y = y || loc.y;
    }
    return self.clickedOnBarX(target, e, x, y, isWindow) || self.clickedOnBarY(target, e, y, x, isWindow);
  },
  self.barHeightX = (target, isInDOM, isWindow) => {
    return G.bar(target, isInDOM, isWindow, 'Height', 'Width', 'x');
  },
  self.barWidthY = (target, isInDOM, isWindow) => {
    return G.bar(target, isInDOM, isWindow, 'Width', 'Height', 'y');
  },
  self.barMeter = (target, isInDOM, isWindow) => {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(target);
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    return {x: self.barHeightX(target, isInDOM, isWindow), y: self.barWidthY(target, isInDOM, isWindow)};
  },
  self.atEndX = (target, isWindow, scrollTop) => {
    return G.atEnd(target, isWindow, scrollTop, 'Width', 'Left');
  },
  self.atEndY = (target, isWindow, scrollLeft) => {
    return G.atEnd(target, isWindow, scrollLeft, 'Height', 'Top');
  },
  self.atEnd = (target, isWindow, scrollMeter) => {
    if(isWindow == null) isWindow = pipnet.isWindow(target);
    scrollMeter || (scrollMeter = Math.round(api.scrollMeter(target, isWindow)));
    return self.atEndX(target, isWindow, scrollMeter.x) && self.atEndY(target, isWindow, scrollMeter.y);
  },
  self.scrollTo = (target, x, y, isInDOM) => { // The target is relative to window
    if ((doc.readyState || 'complete') !== 'complete') {
      const stateChange = () => {
        setTimeout(() => {
          self.scrollTo(target, x, y, isInDOM);
        }); // Timeout is useless here but resolve bug in Chromium when user refresh the page
        window.removeEventListener('load', stateChange, false);
      };
      window.addEventListener('load', stateChange, false);
    } else {
      x || (x = 0), y || (y = 0);
      if(typeof target !== 'string') {
        if(isInDOM == null) isInDOM = pipnet.isInDOM(target);
        if(!isInDOM) throw new TypeError("ScrollAPI << " + target + " isn't a valid HTMLElement");
        if(x === 0 && y === 0 && 'scrollIntoView' in target) target.scrollIntoView();
        const clientRect = target.getBoundingClientRect();
        window.scrollBy(clientRect.left + x, clientRect.top + y);
      } else {
        switch(target.toLowerCase()) {
          case "start": window.scroll(x, y); break;
          case "end": window.scroll(x, (html.scrollHeight - html.clientHeight) + y); break;
        }
      }
    }
  },
  self.percentX = (el, round, isInDOM, isWindow) => {
    return G.percent(el, round, isInDOM, isWindow, 'Left', 'Width');
  },
  self.percentY = (el, round, isInDOM, isWindow) => {
    return G.percent(el, round, isInDOM, isWindow, 'Top', 'Height');
  },
  self.percent = (el, round, isInDOM, isWindow) => {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
    if(isWindow == null) isWindow = pipnet.isWindow(el);
    return {x: self.percentX(el, round, isInDOM, isWindow), y: self.percentY(el, round, isInDOM, isWindow)};
  },
  self.isScrollableX = (el, isInDOM, isWindow) => {
    return G.isScrollable(el, isInDOM, isWindow, 'Width', 'Height', 'x', 'X', 'Left');
  },
  self.isScrollableY = (el, isInDOM, isWindow) => {
    return G.isScrollable(el, isInDOM, isWindow, 'Height', 'Width', 'y', 'Y', 'Top');
  },
  self.isScrollable = (el, isInDOM, isWindow) => {
    if(isInDOM == null) isInDOM = pipnet.isInDOM(el);
    if(isWindow == null) isWindow = pipnet.isWindow(el);
    return self.isScrollableX(el, isInDOM, isWindow) || self.isScrollableY(el, isInDOM, isWindow);
  };

  /* API */
  api.parentScrollable = el => {
    while(!self.isScrollable(el, true) && el.parentElement != null) el = el.parentElement;
    if(el === html) return null; // Return body before html so body if scrollable window or html if not
    return el;
  },
  api.patchOutline = function(e) {
    if(e.type === 'focus') {
      focus.outline = this.style.outline;
      this.style.outline = "none";
    } else {
      this.style.outline = focus.outline; //maybe useless
    }
  },
  api.applyFocus = e => {
    const _target = e.target;
    if(_target.tagName === 'TEXTAREA' || _target.tagName === 'INPUT') return;
    const parent = api.parentScrollable(_target);
    if(parent == null || parent === body || parent === focus.target) return;
    if(parent.getAttribute("tabindex") != null) return; /* Cancel if tabindex is predefined */
    focus.target = parent;

    if(focus.needPatch = (pipnet.useChromium && parent.style['outline-style'] === 'none')) { /* Cancel if outline style is predefined (this works with outline) */
      parent.addEventListener('focus', api.patchOutline, false); /* Reset outline size and color in Chromium */
      parent.addEventListener('blur', api.patchOutline, false);
    }

    parent.addEventListener('blur', api.resetFocus, false);

    parent.setAttribute("tabindex", 1);
    parent.focus();
  },
  api.resetFocus = () => { /* IMPORTANT ORDER to avoid recursive functions (blur) / unstable */
    if(focus.target == null) return;
    focus.target.removeEventListener('blur', api.resetFocus, false);

    /* Call blur event / Only for Chromium */
    if(focus.needPatch) {
      focus.target.removeEventListener('focus', api.patchOutline, false);
      focus.target.removeEventListener('blur', api.patchOutline, false);
    }

    focus.target.removeAttribute("tabindex"); /* Call blur event / reset focus */
    focus.target = null;
  },
  api.scrollLeft = (target, isWindow) => {
    if(isWindow) return window.pageXOffset;
    return target.scrollLeft;
  },
  api.scrollTop = (target, isWindow) => {
    if(isWindow) return window.pageYOffset;
    return target.scrollTop;
  },
  api.scrollMeter = (target, isWindow) => {
    if(isWindow) return {x: window.pageXOffset, y: window.pageYOffset};
    return {x: target.scrollLeft, y: target.scrollTop};
  },
  api.clientMeter = (target, isWindow) => {
    if(isWindow) return {x: html.pageXOffset, y: html.pageYOffset};
    return {x: target.clientWidth, y: target.clientHeight};
  },
  api.clientWidth = (target, isWindow) => {
    if(isWindow) return html.pageXOffset;
    return target.clientWidth;
  },
  api.clientHeight = (target, isWindow) => {
    if(isWindow) return html.pageYOffset;
    return target.clientHeight;
  },
  api.createEvent = (name, params) =>{
    params || (params = {bubbles: false, cancelable: true, detail: null});
    return new CustomEvent(name, params);
  };
  window['scrollAPI'] = self;
})(document);
