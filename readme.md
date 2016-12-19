# pug-layout
A module that gives you the possibility of loading a layout in variable

## Install

```
npm install pug-layout

```

## Usage

**layout.pug:**

```pug
div(foo="bar")
    block content
```

**index.pug:**

```pug
block content
    span= text
```

**app.js:**

```javascript
var pl = require('pug-layout');

var layout = new pl.Layout('layout.pug');

layout.renderInFile('index.pug', 'index.html', {text: 'this is the content'});
```

And you will get this **index.html:**

```html
<div foo="bar">
    <span>this is the content</span>
</div>
```

## Load Mixin
You can load a file as a mixin, that means the content of the file can be used as mixin:

`.includeMixin(filePath,mixinArgs,mixinName)`:

- *mixinArgs*: string containing arguments of the mixin, if multiple separate them with comma `,`
- *mixinName*: the name of mixin (optional), if not provided the mixin will be named with its filename.

Ex:

**pet.pug:**
```pug
p
    div= type
    div= age
```

**index.pug:**
```pug
block content
    span= text
    +pet('dog',5)
```

**app.js:**
```javascript
var pl = require('pug-layout');

var layout = new pl.Layout('layout.pug');

layout.includeMixin('pet.pug','type,age');

layout.renderInFile('index.pug', 'index.html', {text: 'this is the content'});
```

And now you will get **index.html:**
```html

<div foo="bar"><span>this is the content</span>
  <p>
    <div>dog</div>
    <div>5</div>
  </p>
</div>
```

## Include at Top
You can include a file at top of layout. *Useful when you want to include multiple mixins from one file.*

`.includeAtTop(filePath)`:

Ex:

**head.pug:**
```pug
section.head I'm the header
```

**app.js:**
```javascript
var pl = require('pug-layout');

var layout = new pl.Layout('layout.pug');

layout.includeMixin('pet.pug','type,age');
layout.includeAtTop('head.pug');

layout.renderInFile('index.pug', 'index.html', {text: 'this is the content'});
```

And now you will get **index.html:**
```html

<section class="head">I'm the header</section>
<div foo="bar"><span>this is the content</span>
  <p>
    <div>dog</div>
    <div>5</div>
  </p>
</div>
```

## Get HTML
You can get the rendered HTML without writing it in a file, using `render(filePath)` instead of `renderInFile(filePath,dist)`.

Ex:
```javascript
var html = layout.render('index.pug',locals);
```
