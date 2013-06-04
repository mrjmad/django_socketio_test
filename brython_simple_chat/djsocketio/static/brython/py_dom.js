// cross-browser utility functions
function $getMouseOffset(target, ev){
    ev = ev || window.event;
    var docPos    = $getPosition(target);
    var mousePos  = $mouseCoords(ev);
    return {x:mousePos.x - docPos.x, y:mousePos.y - docPos.y};
}

function $getPosition(e){
    var left = 0;
    var top  = 0;
    var width = e.offsetWidth;
    var height = e.offsetHeight;

    while (e.offsetParent){
        left += e.offsetLeft;
        top  += e.offsetTop;
        e     = e.offsetParent;
    }

    left += e.offsetLeft;
    top  += e.offsetTop;

    return {left:left, top:top, width:width, height:height};
}

function $mouseCoords(ev){
    var posx = 0;
    var posy = 0;
    if (!ev) var ev = window.event;
    if (ev.pageX || ev.pageY){
        posx = ev.pageX;
        posy = ev.pageY;
    } else if (ev.clientX || ev.clientY){
        posx = ev.clientX + document.body.scrollLeft
            + document.documentElement.scrollLeft;
        posy = ev.clientY + document.body.scrollTop
            + document.documentElement.scrollTop;
    }
    var res = object()
    res.x = int(posx)
    res.y = int(posy)
    res.__getattr__ = function(attr){return this[attr]}
    res.__class__ = "MouseCoords"
    return res
}

var $DOMNodeAttrs = ['nodeName','nodeValue','nodeType','parentNode',
    'childNodes','firstChild','lastChild','previousSibling','nextSibling',
    'attributes','ownerDocument']

function $isNode(obj){
    for(var i=0;i<$DOMNodeAttrs.length;i++){
        if(obj[$DOMNodeAttrs[i]]===undefined){return false}
    }
    return true
}

var $DOMEventAttrs_W3C = ['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE',
    'type','target','currentTarget','eventPhase','bubbles','cancelable','timeStamp',
    'stopPropagation','preventDefault','initEvent']

var $DOMEventAttrs_IE = ['altKey','altLeft','button','cancelBubble',
    'clientX','clientY','contentOverflow','ctrlKey','ctrlLeft','data',
    'dataFld','dataTransfer','fromElement','keyCode','nextPage',
    'offsetX','offsetY','origin','propertyName','reason','recordset',
    'repeat','screenX','screenY','shiftKey','shiftLeft',
    'source','srcElement','srcFilter','srcUrn','toElement','type',
    'url','wheelDelta','x','y']

function $isEvent(obj){
    flag = true
    for(var i=0;i<$DOMEventAttrs_W3C.length;i++){
        if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}
    }
    if(flag){return true}
    for(var i=0;i<$DOMEventAttrs_IE.length;i++){
        if(obj[$DOMEventAttrs_IE[i]]===undefined){return false}
    }
    return true
}

// class for all DOM objects
function DOMObject(){}
DOMObject.__class__ = $type
DOMObject.__str__ = function(){return "<class 'DOMObject'>"}
DOMObject.toString = function(){return "<class 'DOMObject'>"}

$DOMtoString = function(){
    var res = "<DOMObject object type '" 
    return res+$NodeTypes[this.nodeType]+"' name '"+this.nodeName+"'>"
}

// DOM node types
$NodeTypes = {1:"ELEMENT",
    2:"ATTRIBUTE",
    3:"TEXT",
    4:"CDATA_SECTION",
    5:"ENTITY_REFERENCE",
    6:"ENTITY",
    7:"PROCESSING_INSTRUCTION",
    8:"COMMENT",
    9:"DOCUMENT",
    10:"DOCUMENT_TYPE",
    11:"DOCUMENT_FRAGMENT",
    12:"NOTATION"
}

function DOMEvent(){}
DOMEvent.__class__ = $type
DOMEvent.toString = function(){return "<class 'DOMEvent'>"}

function $DOMEvent(ev){
    ev.__class__ = DOMEvent
    ev.__getattr__ = function(attr){
        if(attr=="x"){return $mouseCoords(ev).x}
        if(attr=="y"){return $mouseCoords(ev).y}
        if(attr=="data"){return new $Clipboard(ev.dataTransfer)}
        if(attr=="target"){
            if(ev.target===undefined){return $DOMNode(ev.srcElement)}
            else{return $DOMNode(ev.target)}
        }
        return $getattr(ev,attr)
    }
    if(ev.preventDefault===undefined){ev.preventDefault = function(){ev.returnValue=false}}
    if(ev.stopPropagation===undefined){ev.stopPropagation = function(){ev.cancelBubble=true}}
    ev.__str__ = function(){return '<DOMEvent object>'}
    ev.toString = ev.__str__
    return ev
}

function $Clipboard(data){ // drag and drop dataTransfer
    return {
        data : data,
        __class__ : "Clipboard",
        __getattr__ : function(attr){return this[attr]},
        __getitem__ : function(name){return data.getData(name)},
        __setitem__ : function(name,value){data.setData(name,value)},
        __setattr__ : function(attr,value){data[attr]=value}
    }
}

function $OpenFile(file,mode,encoding){
    this.reader = new FileReader()
    if(mode==='r'){this.reader.readAsText(file,encoding)}
    else if(mode==='rb'){this.reader.readAsBinaryString(file)}
    
    this.file = file
    this.__class__ = dom.FileReader
    this.__getattr__ = function(attr){
        if(this['get_'+attr]!==undefined){return this['get_'+attr]}
        return this.reader[attr]
    }
    this.__setattr__ = (function(obj){
        return function(attr,value){
            if(attr.substr(0,2)=='on'){ // event
                // value is a function taking an event as argument
                if(window.addEventListener){
                    var callback = function(ev){return value($DOMEvent(ev))}
                    obj.addEventListener(attr.substr(2),callback)
                }else if(window.attachEvent){
                    var callback = function(ev){return value($DOMEvent(window.event))}
                    obj.attachEvent(attr,callback)
                }
            }else if('set_'+attr in obj){return obj['set_'+attr](value)}
            else if(attr in obj){obj[attr]=value}
            else{setattr(obj,attr,value)}
        }
    })(this.reader)
}


dom = { File : function(){},
    FileReader : function(){}
    }
dom.File.__class__ = $type
dom.File.__str__ = function(){return "<class 'File'>"}
dom.FileReader.__class__ = $type
dom.FileReader.__str__ = function(){return "<class 'FileReader'>"}

function $OptionsClass(parent){ 
    // class for collection "options" of a SELECT tag
    // implements Python list interface
    this.parent = parent

    this.__class__ = 'options'
   
    this.__delitem__ = function(arg){parent.options.remove(arg)}

    this.__getattr__ = function(attr){
        if(this['get_'+attr]!==undefined){return this['get_'+attr]}
        else if(this[attr]!==undefined){
            var res = $JS2Py(this[attr])
            return res
        }
        else{throw AttributeError("'DOM.Options' object has no attribute '"+attr+"'")}
    }
    
    this.__getitem__ = function(key){
        return $DOMNode(parent.options[key])
    }
    
    this.__len__ = function() {return parent.options.length}

    this.__setattr__ = function(attr,value){
        parent.options[attr]=value
    }

    this.__setitem__ = function(attr,value){
        parent.options[attr]= $JS2Py(value)
    }
    
    this.__str__ = function(){return "<object Options wraps "+parent.options+">"}

    this.get_append = function(element){
        parent.options.add(element)
    }

    this.get_insert = function(index,element){
        if(index===undefined){parent.options.add(element)}
        else{parent.options.add(element,index)}
    }

    this.get_item = function(index){
        return parent.options.item(index)
    }
    
    this.get_namedItem = function(name){
        return parent.options.namedItem(name)
    }
    
    this.get_remove = function(arg){parent.options.remove(arg)}
    
    this.toString = this.__str__
    
}

function JSObject(obj){
    if(obj===null){return new $JSObject(obj)}
    if(obj.__class__!==undefined){return obj}
    return new $JSObject(obj)
}
JSObject.__class__ = $type
JSObject.__str__ = function(){return "<class 'JSObject'>"}
JSObject.toString = JSObject.__str__

function $JSObject(js){
    this.js = js
    this.__class__ = JSObject
    this.__str__ = function(){return "<object 'JSObject' wraps "+this.js+">"}
    this.toString = this.__str__
}

$JSObject.prototype.__bool__ = function(){return (new Boolean(this.js)).valueOf()}

$JSObject.prototype.__getitem__ = function(rank){
    if(this.js.item!==undefined){return this.js.item(rank)}
    else{throw AttributeError,this+' has no attribute __getitem__'}
}

$JSObject.prototype.__item__ = function(rank){ // for iterator protocol
    if(this.js.item!==undefined){return this.js.item(rank)}
    else{throw AttributeError,this+' has no attribute __item__'}
}

$JSObject.prototype.__len__ = function(){
    if(this.js.length!==undefined){return this.js.length}
    else{throw AttributeError,this+' has no attribute __len__'}
}

$JSObject.prototype.__getattr__ = function(attr){
    if(this['get_'+attr]!==undefined){
      return this['get_'+attr]
    }else if(this.js[attr] !== undefined){
        var obj = this.js,obj_attr = this.js[attr]
        if(typeof this.js[attr]=='function'){
            return function(){
                var args = []
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                var res = obj_attr.apply(obj,args)
                if(typeof res == 'object'){return JSObject(res)}
                else if(res===undefined){return None}
                else{return $JS2Py(res)}
            }
        }else if(obj===window && attr==='location'){
            // special lookup because of Firefox bug 
            // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
            return $Location()
        }else{
            return $JS2Py(this.js[attr])
        }
    }else{
        throw AttributeError("no attribute "+attr)
    }
}

$JSObject.prototype.__setattr__ = function(attr,value){
    if(isinstance(value,JSObject)){
        this.js[attr]=value.js
    }else{
        this.js[attr]=value
    }
}

function $Location(){ // used because of Firefox bug #814622
    var obj = new object()
    for(var x in window.location){obj[x]=window.location[x]}
    obj.__class__ = new $class(this,'Location')
    obj.toString = function(){return window.location.toString()}
    return obj
}

win =  new $JSObject(window)

function DOMNode(){} // define a Node object
function $DOMNode(elt){ 
    // returns the element, enriched with an attribute $brython_id for 
    // equality testing and with all the attributes of Node
    if(elt['$brython_id']===undefined||elt.nodeType===9){
        // add a unique id for comparisons
        elt.$brython_id=Math.random().toString(36).substr(2, 8)
        // add attributes of Node to element
        for(var attr in DOMNode.prototype){elt[attr]=DOMNode.prototype[attr]}
        elt.__str__ = $DOMtoString
    }
    return elt
}

DOMNode.prototype.__add__ = function(other){
    // adding another element to self returns an instance of $TagSum
    var res = $TagSum()
    res.children = [this]
    if(isinstance(other,$TagSum)){
        for(var $i=0;$i<other.children.length;$i++){res.children.push(other.children[$i])}
    } else if(isinstance(other,[str,int,float,list,dict,set,tuple])){
        res.children.push(document.createTextNode(str(other)))
    }else{res.children.push(other)}
    return res
}

DOMNode.prototype.__class__ = DOMObject

DOMNode.prototype.__contains__ = function(key){
    try{this.__getitem__(key);return True}
    catch(err){return False}
}

DOMNode.prototype.__delitem__ = function(key){
    if(this.nodeType===9){ // document : remove by id
        var res = document.getElementById(key)
        if(res){res.parentNode.removeChild(res)}
        else{throw KeyError(key)}
    }else{ // other node : remove by rank in child nodes
        this.removeChild(this.childNodes[key])
    }
}

DOMNode.prototype.__eq__ = function(other){
    if(this.isEqualNode!==undefined){return this.isEqualNode(other)}
    else if(this.$brython_id!==undefined){return this.$brython_id===other.$brython_id}
    else{throw NotImplementedError('__eq__ is not implemented')}
}

DOMNode.prototype.__getattr__ = function(attr){
    if(attr==='__class__'){return DOMObject}
    if(this['get_'+attr]!==undefined){return this['get_'+attr]()}
    if(this.getAttribute!==undefined){
        var res = this.getAttribute(attr)
        if(res!==undefined&&res!==null){return res}
    }
    if(this[attr]!==undefined){
        var res = this[attr]
        if(typeof res==="function"){
            var func = (function(obj){
                return function(){
                    var args = []
                    for(var i=0;i<arguments.length;i++){
                        if(isinstance(arguments[i],JSObject)){
                            args.push(arguments[i].js)
                        }else{
                            args.push(arguments[i])
                        }
                    }
                    return $JS2Py(res.apply(obj,args))
                }
            })(this)
            func.__name__ = attr
            return func
        }else{
            return $JS2Py(this[attr])
        }
    }
    return $getattr(this,attr)
}

DOMNode.prototype.__getitem__ = function(key){
    if(this.nodeType===9){ // Document
        if(typeof key==="string"){
            var res = document.getElementById(key)
            if(res){return $DOMNode(res)}
            else{throw KeyError(key)}
        }else{
            try{
                var elts=document.getElementsByTagName(key.name),res=[]
                for(var $i=0;$i<elts.length;$i++){res.push($DOMNode(elts[$i]))}
                return res
            }catch(err){
                throw KeyError(str(key))
            }
        }    
    }else{
        return $DOMNode(this.childNodes[key])
    }
}

DOMNode.prototype.__in__ = function(other){return other.__contains__(this)}

DOMNode.prototype.__item__ = function(key){ // for iteration
    return $DOMNode(this.childNodes[key])
}

DOMNode.prototype.__le__ = function(other){
    var obj = this
    // for document, append child to document.body
    if(this.nodeType===9){obj = this.body} 
    if(isinstance(other,$TagSum)){
        var $i=0
        for($i=0;$i<other.children.length;$i++){
            obj.appendChild(other.children[$i])
        }
    }else if(typeof other==="string" || typeof other==="number"){
        var $txt = document.createTextNode(other.toString())
        obj.appendChild($txt)
    }else{
        obj.appendChild(other)
    }
}

DOMNode.prototype.__len__ = function(){return this.childNodes.length}

DOMNode.prototype.__mul__ = function(other){
    if(isinstance(other,int) && other.valueOf()>0){
        var res = $TagSum()
        for(var i=0;i<other.valueOf();i++){
            var clone = this.get_clone()()
            res.children.push(clone)
        }
        return res
    }else{
        throw ValueError("can't multiply "+this.__class__+"by "+other)
    }
}

DOMNode.prototype.__ne__ = function(other){return !this.__eq__(other)}

DOMNode.prototype.__radd__ = function(other){ // add to a string
    var res = $TagSum()
    var txt = document.createTextNode(other)
    res.children = [txt,this]
    return res        
}

DOMNode.prototype.__setattr__ = function(attr,value){
    if(attr.substr(0,2)=='on'){ // event
        // value is a function taking an event as argument
        if(window.addEventListener){
            var callback = function(ev){return value($DOMEvent(ev))}
            this.addEventListener(attr.substr(2),callback)
        }else if(window.attachEvent){
            var callback = function(ev){return value($DOMEvent(window.event))}
            this.attachEvent(attr,callback)
        }
    }else{
        attr = attr.replace('_','-')
        if(this['set_'+attr]!==undefined){return this['set_'+attr](value)}
        if(this[attr]!==undefined){this[attr]=value}
        var res = this.getAttribute(attr)
        if(res!==undefined&&res!==null){this.setAttribute(attr,value)}
        else{this[attr]=value}
    }
}
    
DOMNode.prototype.__setitem__ = function(key,value){
    this.childNodes[key]=value
}

DOMNode.prototype.get_get = function(){
    // for document : doc.get(key1=value1[,key2=value2...]) returns a list of the elements
    // with specified keys/values
    // key can be 'id','name' or 'selector'
    var obj = this
    return function(){
        var $ns=$MakeArgs('get',arguments,[],{},null,'kw')
        if('name'.__in__($ns['kw'])){
            if(obj.getElementsByName===undefined){
                throw TypeError("DOMNode object doesn't support selection by name")
            }
            var res = []
            var node_list = document.getElementsByName($ns['kw'].__getitem__('name'))
            if(node_list.length===0){return []}
            for(var i=0;i<node_list.length;i++){
                res.push($DOMNode(node_list[i]))
            }
        }
        if('tag'.__in__($ns['kw'])){
            if(obj.getElementsByTagName===undefined){
                throw TypeError("DOMNode object doesn't support selection by tag name")
            }
            var res = []
            var node_list = document.getElementsByTagName($ns['kw'].__getitem__('tag'))
            if(node_list.length===0){return []}
            for(var i=0;i<node_list.length;i++){
                res.push($DOMNode(node_list[i]))
            }
        }
        if('classname'.__in__($ns['kw'])){
            if(obj.getElementsByClassName===undefined){
                throw TypeError("DOMNode object doesn't support selection by class name")
            }
            var res = []
            var node_list = document.getElementsByClassName($ns['kw'].__getitem__('classname'))
            if(node_list.length===0){return []}
            for(var i=0;i<node_list.length;i++){
                res.push($DOMNode(node_list[i]))
            }
        }
        if('id'.__in__($ns['kw'])){
            if(obj.getElementById===undefined){
                throw TypeError("DOMNode object doesn't support selection by id")
            }
            var id_res = obj.getElementById($ns['kw'].__getitem__('id'))
            if(!id_res){return []}
            else{return [$DOMNode(id_res)]}
        }
        if('selector'.__in__($ns['kw'])){
            if(obj.querySelectorAll===undefined){
                throw TypeError("DOMNode object doesn't support selection by selector")
            }
            var node_list = obj.querySelectorAll($ns['kw'].__getitem__('selector'))
            var sel_res = []
            if(node_list.length===0){return []}
            for(var i=0;i<node_list.length;i++){
                sel_res.push($DOMNode(node_list[i]))
            }
            if(res===undefined){return sel_res}
            var to_delete = []
            for(var i=0;i<res.length;i++){
                var elt = res[i] // keep it only if it is also inside sel_res
                flag = false
                for(var j=0;j<sel_res.length;j++){
                    if(elt.__eq__(sel_res[j])){flag=true;break}
                }
                if(!flag){to_delete.push(i)}
            }
            for(var i=to_delete.length-1;i>=0;i--){
                res.splice(to_delete[i],1)
            }
            return res
        }
        return res
    }
}

DOMNode.prototype.get_clone = function(){
    res = $DOMNode(this.cloneNode(true))
    // copy events - may not work since there is no getEventListener()
    for(var attr in this){ 
        if(attr.substr(0,2)=='on' && this[attr]!==undefined){
            res[attr]=this[attr]
        }
    }
    var func = function(){return res}
    return func
}

DOMNode.prototype.get_remove = function(){
    var obj = this
    return function(child){obj.removeChild(child)}
}

DOMNode.prototype.get_getContext = function(){ // for CANVAS tag
    if(!('getContext' in this)){throw AttributeError(
        "object has no attribute 'getContext'")}
    var obj = this
    return function(ctx){return new $JSObject(obj.getContext(ctx))}
}

DOMNode.prototype.get_parent = function(){
    if(this.parentElement){return $DOMNode(this.parentElement)}
    else{return None}
}

DOMNode.prototype.get_id = function(){
    if(this.id !== undefined){return this.id}
    else{return None}
}

DOMNode.prototype.get_class = function(){
    if(this.className !== undefined){return this.className}
    else{return None}
}

DOMNode.prototype.get_tagName = function(){
    if(this.tagName !== undefined){return this.tagName}
    else{return None}
}

DOMNode.prototype.get_options = function(){ // for SELECT tag
    return new $OptionsClass(this)
}

DOMNode.prototype.get_left = function(){
    return int($getPosition(this)["left"])
}

DOMNode.prototype.get_top = function(){
    return int($getPosition(this)["top"])
}

DOMNode.prototype.get_children = function(){
    var res = []
    for(var i=0;i<this.childNodes.length;i++){
        res.push($DOMNode(this.childNodes[i]))
    }
    return res
}

DOMNode.prototype.get_reset = function(){ // for FORM
    var $obj = this
    return function(){$obj.reset()}
}

DOMNode.prototype.get_style = function(){
    return new $JSObject(this.style)
}
    
DOMNode.prototype.set_style = function(style){ // style is a dict
    for(var i=0;i<style.$keys.length;i++){
        this.style[style.$keys[i]] = style.$values[i]
    }
}

DOMNode.prototype.get_submit = function(){ // for FORM
    var $obj = this
    return function(){$obj.submit()}
}

DOMNode.prototype.get_text = function(){
    return this.innerText || this.textContent
}
    
DOMNode.prototype.get_html = function(){return this.innerHTML}

DOMNode.prototype.get_value = function(value){return this.value}

DOMNode.prototype.set_html = function(value){this.innerHTML=str(value)}

DOMNode.prototype.set_text = function(value){
    this.innerText=str(value)
    this.textContent=str(value)
}

DOMNode.prototype.set_value = function(value){this.value = value.toString()}


doc = $DOMNode(document)

doc.headers = function(){
    var req = new XMLHttpRequest();
    req.open('GET', document.location, false);
    req.send(null);
    var headers = req.getAllResponseHeaders();
    headers = headers.split('\r\n')
    var res = dict()
    for(var i=0;i<headers.length;i++){
        var header = headers[i]
        if(header.strip().length==0){continue}
        var pos = header.search(':')
        res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())
    }
    return res;
}

// return query string as an object with methods to access keys and values
// same interface as cgi.FieldStorage, with getvalue / getlist / getfirst
doc.query = function(){
    var res = new Object()
    res._keys = []
    res._values = new Object()
    var qs = location.search.substr(1).split('&')
    for(var i=0;i<qs.length;i++){
        var pos = qs[i].search('=')
        var elts = [qs[i].substr(0,pos),qs[i].substr(pos+1)]
        var key = decodeURIComponent(elts[0])
        var value = decodeURIComponent(elts[1])
        if(res._keys.indexOf(key)>-1){res._values[key].push(value)}
        else{res._values[key] = [value]}
    }
    res.__contains__ = function(key){
        return res._keys.indexOf(key)>-1
    }
    res.__getitem__ = function(key){
        // returns a single value or a list of values 
        // associated with key, or raise KeyError
        var result = res._values[key]
        if(result===undefined){throw KeyError(key)}
        else if(result.length==1){return result[0]}
        return result
    }
    res.getfirst = function(key,_default){
        // returns the first value associated with key
        var result = res._values[key]
        if(result===undefined){
            if(_default===undefined){return None}
            return _default
        }
        return result[0]
    }
    res.getlist = function(key){
        // always return a list
        var result = res._values[key]
        if(result===undefined){return []}
        return result
    }
    res.getvalue = function(key,_default){
        try{return res.__getitem__(key)}
        catch(err){
            $pop_exc()
            if(_default===undefined){return None}
            else{return _default}
        }
    }
    res.keys = function(){return res._keys}
    return res
}

// class used for tag sums
function $TagSumClass(){
    this.__class__ = $TagSum
    this.children = []
}
$TagSumClass.prototype.appendChild = function(child){    
    this.children.push(child)
}

$TagSumClass.prototype.__add__ = function(other){
    if(isinstance(other,$TagSum)){
        this.children = this.children.concat(other.children)
    }else if(isinstance(other,str)){
        this.children = this.children.concat(document.createTextNode(other))
    }else{this.children.push(other)}
    return this
}

$TagSumClass.prototype.__radd__ = function(other){
    var res = $TagSum()
    res.children = this.children.concat(document.createTextNode(other))
    return res
}

$TagSumClass.prototype.clone = function(){
    var res = $TagSum(), $i=0
    for($i=0;$i<this.children.length;$i++){
        res.children.push(this.children[$i].cloneNode(true))
    }
    return res
}

function $TagSum(){
    return new $TagSumClass()
}

//creation of jquery like helper functions..

var $toDOM = function (content) {
   if (isinstance(content,DOMNode)) {return content}

   if (isinstance(content,str)) {
      var _dom = document.createElement('html')
      _dom.innerHTML = content
      return _dom
   }

   // if we got this far there is a problem..
   $raise('Error', 'Invalid argument' + content)
}

DOMNode.prototype.addClass = function(classname){
   var _c = this.__getattr__('class')
   if (_c === undefined) {
      this.__setattr__('class', classname)
   } else {
      this.__setattr__('class', _c + " " + classname)
   }
   return this
}

DOMNode.prototype.after = function(content){
   var _content=$toDOM(content);

   if (this.nextSibling !== null) {
     this.parentElement.insertBefore(_content, this.nextSibling);
   } else {
     this.parentElement.appendChild(_content)
   }

   return this
}

DOMNode.prototype.append = function(content){
   var _content=$toDOM(content);
   this.appendChild(_content);
   return this
}

DOMNode.prototype.before = function(content){
   var _content=$toDOM(content);
   this.parentElement.insertBefore(_content, this);
   return this
}

// closest will return the first ancestor that it comes across
// while traversing up the tree.
// note that selector parameter in regular jquery will be implemented
// at a higher level (ie, python class).

//a python class will implement very high level 
// selector functions, which will allow maximum flexibility
// we can also emulate jquery style selectors with the
// python class. :)

DOMNode.prototype.closest = function(selector){
   var traverse=function(node, ancestors) {
       if (node === doc) return None
       for(var i=0; i<ancestors.length; i++) {
          if (node === ancestors[i]) { 
             return ancestors[i];
          }
       } 

       return traverse(this.parentElement, ancestors);
   }

   if (isinstance(selector, str)) {
      var _elements=doc.get(selector=selector)
      return traverse(this, _elements); 
   } 

   return traverse(this, selector);
}

DOMNode.prototype.css = function(property,value){
   if (value !== undefined) {
      this.set_style({property:value})
      return this   
   }

   if (isinstance(property, dict)) {
      // we also set styles here..
      this.set_style(property)
      return this
   }

   //this is a get request
   if (this.style[property] === undefined) { return None}
   return this.style[property]
}

DOMNode.prototype.empty = function(){
   for (var i=0; i <= this.childNodes.length; i++) {
       this.removeChild(this.childNodes[i])
   }
}

DOMNode.prototype.hasClass = function(name){
   var _c = this.__getattr__('class')
   if (_c === undefined) return False
   if (_c.indexOf(name) > -1) return True

   return False
}

DOMNode.prototype.prepend = function(content){
   var _content=$toDOM(content);
   this.insertBefore(_content, this.firstChild);
}

DOMNode.prototype.removeAttr = function(name){
   this.__setattr__(name, undefined)
}

DOMNode.prototype.removeClass = function(name){
   var _c = this.__getattr__('class')
   if (_c === undefined) return

   if (_c === name) {
      this.__setattr__('class', undefined)
      return
   }

   _index=_c.indexOf(name)
   if (_index == -1) return

   var _class_string=_c
   if (_index==0) {  // class is first in list
        _class_string=_c.substring(name.length)
   } else if (_index == _c.length - name.length) {  // at end of string
        _class_string=_c.substring(0, _index)
   } else { // must be somewhere in the middle
        _class_string=_c.replace(' '+name+' ', '')
   }
   this.__setattr('class', _class_string)
}

win.get_postMessage = function(msg,targetOrigin){
    if(isinstance(msg,dict)){
        var temp = new Object()
        temp.__class__='dict'
        for(var i=0;i<msg.__len__();i++){temp[msg.$keys[i]]=msg.$values[i]}
        msg = temp
    }
    return window.postMessage(msg,targetOrigin)
}
