# RegressJS
RegressJS is a conservative UI framework for the front-end that enables the programmer to create components by writing traditional html as well as programmatically using class instances.
Component styling is done eloquently using CSS-in-JS.

Components can be asynchronously extended using the following technique:

## In the source parent component class of component-table:

```js
require('../componentsConfigs/' + this.target.getAttribute('data-component-id'))(this, (extensions) => {
});
```

## In the custom extended component file e.g. myextended-component-table.js: 
```js
module.exports = (_super, extensions) => {
  .
  .
  .

  next({
    extension1:123
    .
    .
    .
  );

}
```
**WARNING** This project is undergoing very heavy, albeit sporadic development. It's almost certain that the current version does not work.


TODO: Add documentation...
