# DOMian

This library makes it possible to use lifecycle methods on DOM nodes without polling.
I built this library to hook into reactive pages that add and remove DOM nodes on user interaction,
like SPAs and/or pages that are build with component frameworks.

## Use cases

- Browser automation
- Browser plugins
- QA tasks

## This library is

- Not a component library
- No state handling
- No virtual DOM

## Usage
```
import Domian from 'domian';

// The constructor takes an array of components
const domian = new Domian([{
  // the classname of the element that you want to hook into
  name: 'header',
  // the element is the DOM node
  onMount((element) => {})
  onUpdate((element) => {})
  onUnMount((element) => {})
}]);
```

Or as a UMD

```
// In head or the end of body  
<script src="https://unpkg.com/domian"></script>

// be sure to call this after the body is there
const domian = new Domian(...);
```


## Requirements

This library relies on `Map` and `MutationObserver`. These features are not polyfilled since the
library should most likely be used on modern browsers. If you feel the urge to use it on older 
browsers please polyfill it for yourself.

## TODO

- install new rollup plugins (the corresponding ones under @rollup)
