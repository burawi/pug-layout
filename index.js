var fs = require('fs');
var lex = require('pug-lexer');
var parse = require('pug-parser');
var generateCode = require('pug-code-gen');
var wrap = require('pug-runtime/wrap');
var load = require('pug-load');
var link = require('pug-linker');
var path = require('path');

var getAst = function (filename) {
    var str = fs.readFileSync(filename, 'utf-8');
    var tokens = lex(str);
    var ast = parse(tokens,{filename: filename, src: str});
    var ast = load(ast, {
        lex: lex,
        parse: parse,
        resolve: function(filename, source, options) {
            return load.resolve(filename, source, options);
        }
    });
    return ast;
}

var Layout = function (layoutFilename) {
    this.data = {
        type: "Extends",
        file: {
            ast: getAst(layoutFilename)
        }
    };
}

Layout.prototype.includeAtTop = function (layoutFilename) {
    var file = {
        type: "Include",
        file: {
            type: "FileReference",
            ast: getAst(layoutFilename)
        },
        block: {
            type: "Block",
            nodes: []
        }
    };
    this.data.file.ast.nodes.splice(0,0,file);
}

Layout.prototype.includeMixin = function (filename,args,name) {
    if(filename !== undefined){
        if(name === undefined){
            name = path.basename(filename,'.pug');
        }
        if(args === undefined){
            args = "";
        }
        var mixin = {
            type: "Mixin",
            name: name,
            args: args,
            block: getAst(filename)
        };
        this.data.file.ast.nodes.splice(0,0,mixin);
    }
}

Layout.prototype.render = function (child,locals) {
    var layout = this;
    child.extends(layout);
    return child.render(locals);
}

Layout.prototype.convert = function (childFilename,locals) {
    var layout = this;
    var child = new Page(childFilename);
    return layout.render(child);
}

Layout.prototype.renderInFile = function(child, dist, locals){
    var html = this.render(child, locals);
    fs.writeFileSync(dist, html, 'utf-8');
}

Layout.prototype.convertInFile = function(src, dist, locals){
    var html = this.convert(src, locals);
    fs.writeFileSync(dist, html, 'utf-8');
}

var Page = function (filename) {
    this.data = getAst(filename);
}

Page.prototype.extends = function (layout) {
    this.data.nodes.splice(0,0,layout.data);
}

Page.prototype.extendsFile = function (layoutFilename) {
    var layout = new Layout(layoutFilename);
    this.extends(layout);
}

Page.prototype.render = function (locals) {
    var ast = link(this.data);

    var funcStr = generateCode(ast, {
        compileDebug: false,
        pretty: false,
        inlineRuntimeFunctions: false,
        templateName: 'helloWorld'
    });

    var func = wrap(funcStr, 'helloWorld');
    return func(locals);
}

Page.prototype.renderInFile = function (dist,locals) {
    var html = this.render(locals);
    fs.writeFileSync(dist, html, 'utf-8');
}

module.exports = {
    Layout: Layout,
    Page: Page
};
