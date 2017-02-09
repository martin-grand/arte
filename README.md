# arte.js
Smart, fast javascript render engine.

## Features:
- template functionality (conditions, variables, executes)
- component support
- preprocess templates (dictionary support)
- postprocess templates (smart class name conversions, minify output)

## Usage:
Let's create an Arte render engine:
```js
var Engine = new Arte({ /* options */ });
```

Lets run the render engine. First of all, you have to define templates:
```js
Engine.defineTemplate('template name', '<b>template string...<b>');
```

After it defined, you can compile template:
```js
Engine.run('template name', { /* template context */ });
// returns: '<b>template string...<b>'
```

You can create template content, what react to the context. Forexample you can simply pass variables:
```js
Engine.defineTemplate('welcome', '<b>Hello ${this.name}!<b>');

Engine.run('welcome', { name: 'Sheldon' }); // returns: '<b>Hello Sheldon!<b>'
Engine.run('welcome', { name: 'Leonard' }); // returns: '<b>Hello Leonard!<b>'
```

You can also do javascript stuffs in the templates:
```js
Engine.defineTemplate('default example', '<b>Hello ${this.name || 'Anonimus'}!<b>');

Engine.run('default example', { name: 'Sheldon' }); // returns: '<b>Hello Sheldon!<b>'
Engine.run('default example', {}); // returns: '<b>Hello Anonimus!<b>'
```

Evaluate, calculate, pretty much anything you want to do:
```js
Engine.defineTemplate('calculation example', '10 * 10 = ${10 * 10}');
Engine.run('calculation example', {}); // returns: '10 * 10 = 100'

Engine.defineTemplate('contexted calculation example', '${this.a} * ${this.b} = ${this.a * this.b}');
Engine.run('contexted calculation example', {a: 10, b: 10}); // returns: '10 * 10 = 100'
Engine.run('contexted calculation example', {a: 1, b: 2}); // returns: '1 * 2 = 2'

Engine.defineTemplate(
  'larger than example', 
  '${this.a > this.b ? this.a : this.b} larger than ${this.a < this.b ? this.a : this.b}'
);
Engine.run('larger than example', {a: 1, b: 7}); // returns: '7 larger than 1'
Engine.run('larger than example', {a: 6, b: 3}); // returns: '6 larger than 3'
```

You can also use block conditions:
```js
Engine.defineTemplate(
  'condition example', 
  '<b>${this.number} ?{if this.number % 2} is an odd number ?{else} is an even number  ?{endif}');

Engine.run('default example', { number: 3 }); // returns: '<b>Hello Sheldon!<b>'
Engine.run('default example', { number: 4 }); // returns: '<b>Hello Anonimus!<b>'
```


