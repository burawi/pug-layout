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
            console.log('"' + filename + '" file requested from "' + source + '".');
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

Layout.prototype.render = function (childFilename,locals) {
    var layout = this.data;
    var childAst = getAst(childFilename);
    childAst.nodes.splice(0,0,layout);
    childAst = link(childAst);

    var funcStr = generateCode(childAst, {
        compileDebug: false,
        pretty: false,
        inlineRuntimeFunctions: false,
        templateName: 'helloWorld'
    });

    var func = wrap(funcStr, 'helloWorld');
    return func(locals);
}

Layout.prototype.renderInFile = function(src, dist, locals){
    var html = this.render(src, locals);
    fs.writeFileSync(dist, html, 'utf-8');
}

module.exports = Layout;
