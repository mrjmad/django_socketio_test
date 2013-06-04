// brython.js www.brython.info
// version 1.1.20130604-085135
// version compiled from commented, indented source files at https://bitbucket.org/olemis/brython/src

__BRYTHON__=new Object()
__BRYTHON__.__getattr__=function(attr){return this[attr]}
__BRYTHON__.language=window.navigator.userLanguage || window.navigator.language
__BRYTHON__.date=function(){
if(arguments.length===0){return JSObject(new Date())}
else if(arguments.length===1){return JSObject(new Date(arguments[0]))}
else if(arguments.length===7){return JSObject(new Date(arguments[0],
arguments[1]-1,arguments[2],arguments[3],
arguments[4],arguments[5],arguments[6]))}
}
__BRYTHON__.has_local_storage=typeof(Storage)!=="undefined"
if(__BRYTHON__.has_local_storage){
__BRYTHON__.local_storage=function(){return JSObject(localStorage)}
}
window.indexedDB=window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
window.IDBTransaction=window.IDBTransaction || window.webkitIDBTransaction
window.IDBKeyRange=window.IDBKeyRange || window.webkitIDBKeyRange
__BRYTHON__.has_indexedDB=typeof(window.indexedDB)!=="undefined"
if(__BRYTHON__.has_indexedDB){
__BRYTHON__.indexedDB=function(){return JSObject(window.indexedDB)}
}
__BRYTHON__.re=function(pattern,flags){return JSObject(new RegExp(pattern,flags))}
__BRYTHON__.has_json=typeof(JSON)!=="undefined"
__BRYTHON__.version_info=[1,1,"20130604-085135"]
__BRYTHON__.path=[]
function $MakeArgs($fname,$args,$required,$defaults,$other_args,$other_kw){
var i=null,$PyVars={},$def_names=[],$ns={}
for(var k in $defaults){$def_names.push(k);$ns[k]=$defaults[k]}
if($other_args !=null){$ns[$other_args]=[]}
if($other_kw !=null){$dict_keys=[];$dict_values=[]}
var upargs=[]
for(var i=0;i<$args.length;i++){
if($args[i]===null){upargs.push(null)}
else if(isinstance($args[i],$ptuple)){
for(var j=0;j<$args[i].arg.length;j++){
upargs.push($args[i].arg[j])
}
}else if(isinstance($args[i],$pdict)){
for(var j=0;j<$args[i].arg.$keys.length;j++){
upargs.push($Kw($args[i].arg.$keys[j],$args[i].arg.$values[j]))
}
}else{
upargs.push($args[i])
}
}
for(var $i=0;$i<upargs.length;$i++){
$arg=upargs[$i]
$PyVar=$JS2Py($arg)
if(isinstance($arg,$Kw)){
$PyVar=$arg.value
if($arg.name in $PyVars){
throw new TypeError($fname+"() got multiple values for argument '"+$arg.name+"'")
}else if($required.indexOf($arg.name)>-1){
var ix=$required.indexOf($arg.name)
eval('var '+$required[ix]+"=$PyVar")
$ns[$required[ix]]=$PyVar
}else if($arg.name in $defaults){
$ns[$arg.name]=$PyVar
}else if($other_kw!=null){
$dict_keys.push($arg.name)
$dict_values.push($PyVar)
}else{
throw new TypeError($fname+"() got an unexpected keyword argument '"+$arg.name+"'")
}
if($arg.name in $defaults){delete $defaults[$arg.name]}
}else{
if($i<$required.length){
eval('var '+$required[$i]+"=$PyVar")
$ns[$required[$i]]=$PyVar
}else if($i<$required.length+$def_names.length){
$ns[$def_names[$i-$required.length]]=$PyVar
}else if($other_args!=null){
eval('$ns["'+$other_args+'"].push($PyVar)')
}else{
msg=$fname+"() takes "+$required.length+' positional arguments '
msg +='but more were given'
throw TypeError(msg)
}
}
}
if($other_kw!=null){$ns[$other_kw]=new $DictClass($dict_keys,$dict_values)}
return $ns
}
function $list_comp(){
var $env=arguments[0]
for(var $arg in $env){
eval("var "+$arg+'=$env["'+$arg+'"]')
}
var $ix=Math.random().toString(36).substr(2,8)
var $py='def func'+$ix+"():\n"
$py +="    res=[]\n"
var indent=4
for(var $i=2;$i<arguments.length;$i++){
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +=arguments[$i]+':\n'
indent +=4
}
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +='res.append('+arguments[1]+')\n'
$py +="    return res\n"
$py +="res"+$ix+"=func"+$ix+"()"
var $js=__BRYTHON__.py2js($py,'list comprehension').to_js()
eval($js)
return eval("res"+$ix)
}
function $gen_expr(){
var $env=arguments[0]
for(var $arg in $env){
eval("var "+$arg+'=$env["'+$arg+'"]')
}
var $res='res'+Math.random().toString(36).substr(2,8)
var $py=$res+"=[]\n"
var indent=0
for(var $i=2;$i<arguments.length;$i++){
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +=arguments[$i]+':\n'
indent +=4
}
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +=$res+'.append('+arguments[1]+')'
var $js=__BRYTHON__.py2js($py,'generator expression').to_js()
eval($js)
return eval($res)
}
function $dict_comp(){
var $env=arguments[0]
for(var $arg in $env){
eval("var "+$arg+'=$env["'+$arg+'"]')
}
var $res='res'+Math.random().toString(36).substr(2,8)
var $py=$res+"={}\n"
var indent=0
for(var $i=2;$i<arguments.length;$i++){
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +=arguments[$i]+':\n'
indent +=4
}
for(var $j=0;$j<indent;$j++){$py +=' '}
$py +=$res+'.update({'+arguments[1]+'})'
var $js=__BRYTHON__.py2js($py,'dict comprehension').to_js()
eval($js)
return eval($res)
}
function $generator(func){
var res=function(){
func.$iter=[]
func.apply(this,arguments)
var obj=new Object()
obj.$iter=-1
obj.__class__=$generator
obj.__getattr__=function(attr){return obj[attr]}
obj.__len__=function(){return func.$iter.__len__()}
obj.__item__=function(rank){return func.$iter.__item__(rank)}
obj.__iter__=function(){return obj}
obj.__next__=function(){
obj.$iter++
if(obj.$iter<obj.__len__()){return obj.__item__(obj.$iter)}
else{throw StopIteration("")}
}
obj.__repr__=function(){return "<generator object>"}
obj.__str__=function(){return "<generator object>"}
return iter(obj)
}
res.__repr__=function(){return "<function "+func.__name__+">"}
return res
}
function $ternary(env,cond,expr1,expr2){
for(var attr in env){eval('var '+attr+'=env["'+attr+'"]')}
var res='if ('+cond+'){\n'
res +='    var $res = '+expr1+'\n}else{\n'
res +='    var $res = '+expr2+'\n}'
eval(res)
return $res
}
function $lambda($env,$args,$body){
for(var $attr in $env){eval('var '+$attr+'=$env["'+$attr+'"]')}
var $res='res'+Math.random().toString(36).substr(2,8)
var $py='def '+$res+'('+$args+'):\n'
$py +='    return '+$body
var $js=__BRYTHON__.py2js($py,'lambda').to_js()
eval($js)
return eval($res)
}
function $JS2Py(src){
if(src===null||src===undefined){return None}
if(typeof src==='number'){
if(src%1===0){return src}
else{return float(src)}
}
if(src.__class__!==undefined){return src}
if(typeof src=="object"){
if(src.constructor===Array){return src}
else if($isNode(src)){return $DOMNode(src)}
else if($isEvent(src)){return $DOMEvent(src)}
}
return JSObject(src)
}
function $module(){}
$module.__class__=$type
$module.__str__=function(){return "<class 'module'>"}
function $getattr(obj,attr){
if(obj[attr]!==undefined){
var res=obj[attr]
if(typeof res==="function"){
res=$bind(res, obj)
}
return $JS2Py(res)
}
}
function $bind(func, thisValue){
return function(){return func.apply(thisValue, arguments)}
}
function $raise(){
if(__BRYTHON__.exception_stack.length>0){throw $last(__BRYTHON__.exception_stack)}
else{throw Error('Exception')}
}
function $report(err){
if(err.py_error===undefined){err=RuntimeError(err+'')}
var trace=err.__name__+': '+err.message
if(err.__name__=='SyntaxError'||err.__name__==='IndentationError'){
trace +=err.info
}
document.$stderr.__getattr__('write')(trace)
err.message +=err.info
throw err
}
function $src_error(name,module,msg,pos){
var pos2line={}
var lnum=1
var src=document.$py_src[module]
var line_pos={1:0}
for(i=0;i<src.length;i++){
pos2line[i]=lnum
if(src.charAt(i)=='\n'){lnum+=1;line_pos[lnum]=i}
}
var line_num=pos2line[pos]
var lines=src.split('\n')
info="\nmodule '"+module+"' line "+line_num
info +='\n'+lines[line_num-1]+'\n'
var lpos=pos-line_pos[line_num]
for(var i=0;i<lpos;i++){info+=' '}
info +='^\n'
err=new Error()
err.name=name
err.__class__=Exception
err.__name__=name
err.__getattr__=function(attr){return err[attr]}
err.__str__=function(){return msg}
err.message=msg
err.info=info
err.py_error=true
__BRYTHON__.exception_stack.push(err)
throw err
}
function $SyntaxError(module,msg,pos){
$src_error('SyntaxError',module,msg,pos)
}
function $IndentationError(module,msg,pos){
$src_error('IndentationError',module,msg,pos)
}
function $pop_exc(){__BRYTHON__.exception_stack.pop()}
function $resolve_attr(obj,factory,attr){
if(attr==='__class__'){return obj.__class__}
if(__BRYTHON__.forbidden.indexOf(attr)!==-1){attr='$$'+attr}
if(obj[attr]!==undefined){
if(typeof obj[attr]==='function'){
var res=function(){return obj[attr].apply(obj,arguments)}
res.__str__=function(){
return "<bound method '"+attr+"' of "+obj.__class__.__name__+" object>"
}
return res
}
else{
res=obj[attr]
if(res.__get__ !=undefined && typeof res.__get__==='function' && res===factory[attr])
res=res.__get__.apply(res,[obj, factory])
return res
}
}
if(factory[attr]!==undefined){
var res=factory[attr]
if(typeof res==='function'){
res=(function(func){
return function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return func.apply(obj,args)
}
})(res)
res.__str__=(function(x){
return function(){
var res="<bound method "+factory.__name__+'.'+x
res +=' of '+obj.__str__()+'>'
return res
}
})(attr)
}
if(res.__get__ !==undefined && typeof res.__get__==='function')
res=res.__get__.apply(res,[obj, factory])
return res
}else{
for(var i=0;i<factory.parents.length;i++){
try{
return $resolve_attr(obj,factory.parents[i],attr)
}catch(err){
void(0)
}
}
throw AttributeError("'"+factory.__name__+"' object has no attribute '"+attr+"'")
}
}
function $class_constructor(class_name,factory,parents){
var parent_classes=[]
if(parents!==undefined){
if(isinstance(parents,tuple)){
for(var i=0;i<parents.length;i++){
if(parents[i]!==object){
parent_classes.push(parents[i])
}
}
}else if(parents!==object){parent_classes=[parents]}
}
factory.parents=parent_classes
factory.__name__=class_name
var f=function(){
var obj=new Object()
obj.$initialized=false
var fact=factory
while(fact.parents!==undefined && fact.parents.length>0){
if(fact.parents.length && 
fact.parents[0].__new__!==undefined){
var obj=fact.parents[0].__new__.apply(null,arguments)
break
}
fact=fact.parents[0]
}
obj.__class__=f
for(var attr in factory){
if(attr=='__class__'){return f}
else if(typeof factory[attr]==="function"){
var func=factory[attr]
obj[attr]=(function(func){
return function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return func.apply(obj,args)
}
})(func)
obj[attr].__str__=(function(x){
return function(){
var res="<bound method "+class_name+'.'+x
res +=' of '+obj.__str__()+'>'
return res
}
})(attr)
}else{obj[attr]=factory[attr]}
}
if(factory['__getattr__']==undefined){
obj.__getattr__=function(attr){return $resolve_attr(obj,factory,attr)}
}
obj.__getattr__.__name__="<bound method __getattr__ of "+class_name+" object>"
if(factory['__setattr__']==undefined){
obj.__setattr__=function(attr,value){obj[attr]=value}
}
obj.__setattr__.__name__="<bound method __setattr__ of "+class_name+" object>"
try{$resolve_attr(obj,factory,'__str__')}
catch(err){
$pop_exc()
obj.__str__=function(){return "<"+class_name+" object>"}
obj.__str__.__name__="<bound method __str__ of "+class_name+" object>"
}
try{$resolve_attr(obj,factory,'__repr__')}
catch(err){
$pop_exc()
obj.__repr__=function(){return "<"+class_name+" object>"}
obj.__repr__.__name__="<bound method __repr__ of "+class_name+" object>"
}
obj.toString=obj.__str__
try{$resolve_attr(obj,factory,'__eq__')}
catch(err){
$pop_exc()
obj.__eq__=function(other){return obj===other}
obj.__eq__.__name__="<bound method __eq__ of "+class_name+" object>"
}
if(!obj.$initialized){
try{
var init_func=$resolve_attr(obj,factory,'__init__')
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
init_func.apply(null,arguments)
obj.$initialized
}catch(err){$pop_exc()}
}
return obj
}
f.__str__=function(){return "<class '"+class_name+"'>"}
for(var attr in factory){
if(attr==='__call__'){continue}
f[attr]=factory[attr]
if(typeof f[attr]==='function'){
f[attr].__str__=(function(x){
return function(){return "<function "+class_name+'.'+x+'>'}
})(attr)
}
}
f.__getattr__=function(attr){
if(f[attr]!==undefined){return f[attr]}
return factory[attr]
}
f.__setattr__=function(attr,value){
factory[attr]=value;f[attr]=value
}
return f
}
var $dq_regexp=new RegExp('"',"g")
function $escape_dq(arg){return arg.replace($dq_regexp,'\\"')}
document.$stderr={
__getattr__:function(attr){return this[attr]},
'write':function(data){console.log(data)}
}
document.$stderr_buff='' 
document.$stdout={
__getattr__:function(attr){return this[attr]},
write: function(data){console.log(data)}
}
function $type(){}
$type.__class__=$type
$type.__name__='type'
$type.__str__=function(){return "<class 'type'>"}
$type.toString=$type.__str__
function $UnsupportedOpType(op,class1,class2){
$raise('TypeError',
"unsupported operand type(s) for "+op+": '"+class1+"' and '"+class2+"'")
}
function $KwClass(name,value){
this.__class__=$Kw
this.name=name
this.value=value
}
$KwClass.prototype.toString=function(){
return '<kw '+this.name+' : '+this.value.toString()+'>'
}
function $Kw(name,value){
return new $KwClass(name,value)
}
function $ptuple_class(arg){
this.__class__=$ptuple
this.arg=arg
}
function $ptuple(arg){return new $ptuple_class(arg)}
function $pdict_class(arg){
this.__class__=$pdict
this.arg=arg
}
function $pdict(arg){return new $pdict_class(arg)}
function $test_item(expr){
document.$test_result=expr
return bool(expr)
}
function $test_expr(){
return document.$test_result
}
Function.prototype.__call__=function(){
var res=this.apply(null,arguments)
if(res===undefined){return None}else{return res}
}
Function.prototype.__eq__=function(other){
if(typeof other !=='function'){return False}
return other+''===this+''
}
Function.prototype.__class__=Function
Function.prototype.__repr__=function(){return "<function "+this.__name__+">"}
Function.prototype.__str__=function(){return "<function "+this.__name__+">"}
Array.prototype.match=function(other){
var $i=0
while($i<this.length && $i<other.length){
if(this[$i]!==other[$i]){return false}
$i++
}
return true
}
if(!Array.indexOf){
Array.prototype.indexOf=function(obj){
for(var i=0;i<this.length;i++){
if(this[i]==obj){
return i;
}
}
return -1;
}
}
try{console}
catch(err){
console={'log':function(data){void(0)}}
}
function $List2Dict(){
var res={}
var i=0
if(arguments.length==1 && arguments[0].constructor==Array){
for(i=0;i<arguments[0].length;i++){
res[arguments[0][i]]=0
}
}else{
for(i=0;i<arguments.length;i++){
res[arguments[i]]=0
}
}
return res
}
function $last(item){
if(typeof item=="string"){return item.charAt(item.length-1)}
else if(typeof item=="object"){return item[item.length-1]}
}
function pyobject2jsobject(obj){
if(isinstance(obj,dict)){
var temp=new Object()
temp.__class__='dict'
for(var i=0;i<obj.__len__();i++){temp[obj.$keys[i]]=obj.$values[i]}
return temp
}
return obj
}
function jsobject2pyobject(obj){
if(obj===undefined)return None
if(obj.__class__==='dict'){
var d=dict()
for(var attr in obj){
if(attr !=='__class__')d.__setitem__(attr, obj[attr])
}
return d
}
return obj
}
if(window.IDBObjectStore !==undefined){
window.IDBObjectStore.prototype._put=window.IDBObjectStore.prototype.put
window.IDBObjectStore.prototype.put=function(obj, key){
var myobj=pyobject2jsobject(obj)
return window.IDBObjectStore.prototype._put.apply(this,[myobj, key])
}
window.IDBObjectStore.prototype._add=window.IDBObjectStore.prototype.add
window.IDBObjectStore.prototype.add=function(obj, key){
var myobj=pyobject2jsobject(obj)
return window.IDBObjectStore.prototype._add.apply(this,[myobj, key])
}
}
if(window.IDBRequest !==undefined){
window.IDBRequest.prototype.pyresult=function(){
return jsobject2pyobject(this.result)
}
}

function abs(obj){
if(isinstance(obj,int)){return int(Math.abs(obj))}
else if(isinstance(obj,float)){return float(Math.abs(obj.value))}
else if('__abs__' in obj){return obj.__abs__()}
else{throw TypeError("Bad operand type for abs(): '"+str(obj.__class__)+"'")}
}
function $alert(src){alert(str(src))}
function all(iterable){
while(true){
try{
var elt=next(iterable)
if(!bool(elt)){return False}
}catch(err){return True}
}
}
function any(iterable){
if(iterable.__item__===undefined){
throw TypeError("'"+iterable.__class__.__name__+"' object is not iterable")
}
while(true){
try{
var elt=next(iterable)
if(bool(elt)){return True}
}catch(err){return False}
}
}
function ascii(obj){
function padWithLeadingZeros(string,pad){
return new Array(pad+1-string.length).join("0")+ string
}
function charEscape(charCode){
if(charCode>255){return "\\u" + padWithLeadingZeros(charCode.toString(16),4)}
else{return "\\x" + padWithLeadingZeros(charCode.toString(16),2)}
}
return obj.split("").map(function(char){
var charCode=char.charCodeAt(0)
return charCode > 127 ? charEscape(charCode): char
})
.join("")
}
function assert_raises(){
var $ns=$MakeArgs('assert_raises',arguments,['exc','func'],{},'args','kw')
var args=$ns['args']
try{$ns['func'].apply(this,args)}
catch(err){
if(err.name!==$ns['exc']){
throw AssertionError(
"exception raised '"+err.name+"', expected '"+$ns['exc']+"'")
}
return
}
throw AssertionError("no exception raised, expected '"+$ns['exc']+"'")
}
function $builtin_base_convert_helper(obj, base){
var value
if(isinstance(obj, int)){
value=obj
}else if(obj.__index__ !==undefined){
value=obj.__index__()
}
if(value===undefined){
Exception('TypeError', 'Error, argument must be an integer or contains an __index__ function')
return
}
var prefix=""
if(base==8){prefix="0o" }
else if(base==16){prefix='0x' }
else if(base==2){prefix='0b' }
else{
prefix=''
}
if(value >=0){
return prefix + value.toString(base)
}else{
return '-' + prefix +(-value).toString(base)
}
}
function bin(obj){
return $builtin_base_convert_helper(obj, 2)
}
function bool(obj){
if(obj===null){return False}
else if(obj===undefined){return False}
else if(typeof obj==="boolean"){return obj}
else if(typeof obj==="number" || typeof obj==="string"){
if(obj){return true}else{return false}
}else if(obj.__bool__ !==undefined){return obj.__bool__()}
else if('__len__' in obj){return obj.__len__()>0}
return true
}
bool.__class__=$type
bool.__name__='bool'
bool.__str__=function(){return "<class 'bool'>"}
bool.toString=bool.__str__
bool.__hash__=function(){
if(this.valueOf())return 1
return 0
}
function bytearray(source, encoding, errors){
throw NotImplementedError('bytearray has not been implemented')
}
function bytes(source, encoding, errors){
throw NotImplementedError('bytes has not been implemented')
}
function callable(obj){
if(obj.__call__)return True
return False
}
function chr(i){
if(i < 0 || i > 1114111){Exception('ValueError', 'Outside valid range')}
return String.fromCharCode(i)
}
function $ClassMethodClass(){
this.__class__="<class 'classmethod'>"
}
$ClassMethodClass.prototype.__hash__=object.__hash__
$ClassMethodClass.prototype.toString=$ClassMethodClass.prototype.__str__=function(){return "<classmethod object at " + hex(this.__hash__())+ ">" }
function classmethod(func){
var c=new $ClassMethodClass()
c.__get__=function(instance, factory){return func.__call__(instance)};
c.__doc__=doc || ""
return c
}
classmethod.__class__=$type
classmethod.__name__='classmethod'
classmethod.toString=classmethod.__str__=function(){return "<class 'classmethod'>" }
classmethod.__hash__=object.__hash__
function $class(obj,info){
this.obj=obj
this.info=info
this.__class__=Object
this.toString=function(){return "<class '"+info+"'>"}
}
function compile(source, filename, mode){
return __BRYTHON__.py2js(source, filename).to_js()
}
function $confirm(src){return confirm(src)}
function delattr(obj, attr){
if(obj.__delattr__ !==undefined){obj.__delattr(attr)
}else{
getattr(obj, attr).__del__()
}
}
function $DictClass($keys,$values){
var x=null
var i=null
this.iter=null
this.__class__=dict
this.$keys=$keys 
this.$values=$values 
}
function dict(){
if(arguments.length==0){return new $DictClass([],[])}
else if(arguments.length===1 && isinstance(arguments[0],dict)){
return arguments[0]
}
var $ns=$MakeArgs('dict',arguments,[],{},'args','kw')
var args=$ns['args']
var kw=$ns['kw']
if(args.length>0){
var iterable=args[0]
var obj=new $DictClass([],[])
for(var i=0;i<iterable.__len__();i++){
var elt=iterable.__item__(i)
obj.__setitem__(elt.__item__(0),elt.__item__(1))
}
return obj
}else if(kw.$keys.length>0){
return kw
}
}
dict.__name__='dict'
dict.toString=function(){return "<class 'dict'>"}
dict.__add__=function(self,other){
var msg="unsupported operand types for +:'dict' and "
throw TypeError(msg+"'"+(str(other.__class__)|| typeof other)+"'")
}
dict.__bool__=function(self){return self.$keys.length>0}
dict.__class__=$type
dict.__contains__=function(self,item){
return self.$keys.__contains__(item)
}
dict.__delitem__=function(self,arg){
for(var i=0;i<self.$keys.length;i++){
if(arg.__eq__(self.$keys[i])){
self.$keys.splice(i,1)
self.$values.splice(i,1)
return
}
}
throw KeyError(str(arg))
}
dict.__eq__=function(self,other){
if(other===undefined){
return self===dict
}
if(!isinstance(other,dict)){return False}
if(other.$keys.length!==self.$keys.length){return False}
for(var i=0;i<self.$keys.length;i++){
var key=self.$keys[i]
for(j=0;j<other.$keys.length;j++){
try{
if(other.$keys[j].__eq__(key)){
if(!other.$values[j].__eq__(self.$values[i])){
return False
}
}
}catch(err){$pop_exc()}
}
}
return True
}
dict.__getattr__=function(attr){
if(this[attr]!==undefined){return this[attr]}
else{throw AttributeError("'dict' object has no attribute '"+attr+"'")}
}
dict.__getitem__=function(self,arg){
for(var i=0;i<self.$keys.length;i++){
if(arg.__eq__(self.$keys[i])){return self.$values[i]}
}
throw KeyError(str(arg))
}
dict.__hash__=function(self){throw TypeError("unhashable type: 'dict'");}
dict.__in__=function(self,item){return item.__contains__(self)}
dict.__item__=function(self,i){return self.$keys[i]}
dict.__iter__=function(self){return new $iterator_getitem(self.$keys)}
dict.__len__=function(self){return self.$keys.length}
dict.__ne__=function(self,other){return !dict.__eq__(self,other)}
dict.__new__=function(){return dict()}
dict.__next__=function(self){
if(self.iter==null){self.iter==0}
if(self.iter<self.$keys.length){
self.iter++
return self.$keys[self.iter-1]
}else{
self.iter=null
throw StopIteration()
}
}
dict.__not_in__=function(self,item){return !self.__in__(item)}
dict.__repr__=function(self){
if(self===undefined){return "<class 'dict'>"}
var res="{",key=null,value=null,i=null 
var qesc=new RegExp('"',"g")
for(var i=0;i<self.$keys.length;i++){
res +=repr(self.$keys[i])+':'+repr(self.$values[i])
if(i<self.$keys.length-1){res +=','}
}
return res+'}'
}
dict.__setitem__=function(self,key,value){
for(var i=0;i<self.$keys.length;i++){
try{
if(key.__eq__(self.$keys[i])){
self.$values[i]=value
return
}
}catch(err){
$pop_exc()
}
}
self.$keys.push(key)
self.$values.push(value)
}
dict.__str__=dict.__repr__
dict.clear=function(self){
self.$keys=[]
self.$values=[]
}
dict.copy=function(self){
var res=dict()
for(var i=0;i<self.__len__();i++){
res.__setitem__(self.$keys[i],self.$values[i])
}
return res
}
dict.get=function(self,key,_default){
try{return dict.__getitem__(self,key)}
catch(err){
$pop_exc()
if(_default!==undefined){return _default}
else{return None}
}
}
dict.items=function(self){
return new $dict_iterator(zip(self.$keys,self.$values),"dict_items")
}
dict.keys=function(self){
return new $dict_iterator(self.$keys,"dict keys")
}
dict.pop=function(self,key,_default){
try{
var res=dict.__getitem__(self,key)
dict.__delitem__(self,key)
return res
}catch(err){
$pop_exc()
if(err.__name__==='KeyError'){
if(_default!==undefined){return _default}
throw err
}else{throw err}
}
}
dict.popitem=function(self){
if(self.$keys.length===0){throw KeyError("'popitem(): dictionary is empty'")}
return tuple([self.$keys.pop(),self.$values.pop()])
}
dict.setdefault=function(self,key,_default){
try{return dict.__getitem__(self,key)}
catch(err){
if(_default===undefined){_default=None}
dict.__setitem__(self,key,_default)
return _default
}
}
dict.update=function(self){
var params=[]
for(var i=1;i<arguments.length;i++){params.push(arguments[i])}
var $ns=$MakeArgs('dict.update',params,[],{},'args','kw')
var args=$ns['args']
if(args.length>0 && isinstance(args[0],dict)){
var other=args[0]
for(var i=0;i<other.$keys.length;i++){
dict.__setitem__(self,other.$keys[i],other.$values[i])
}
}
var kw=$ns['kw']
var keys=list(kw.keys())
for(var i=0;i<keys.__len__();i++){
dict.__setitem__(self,keys[i],kw.__getitem__(keys[i]))
}
}
dict.values=function(self){
return new $dict_iterator(self.$values,"dict values")
}
$DictClass.prototype.__class__=dict
for(var attr in dict){
if(typeof dict[attr]==='function'){dict[attr].__str__=function(){return "<dict method "+attr+">"}}
var func=(function(attr){
return function(){
var args=[this]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return dict[attr].apply(this,args)
}
})(attr)
func.__str__=(function(attr){
return function(){return "<method-wrapper '"+attr+"' of dict object>"}
})(attr)
$DictClass.prototype[attr]=func
}
$DictClass.prototype.__getattr__=function(attr){
if(attr==='__class__'){return this.__class__}
if(dict[attr]===undefined){throw AttributeError("'dict' object has no attribute '"+attr+"'")}
var obj=this
var res=(function(attr){
return function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return dict[attr].apply(obj,args)
}
})(attr)
res.__str__=function(){return "<built-in method "+attr+" of dict object>"}
return res
}
function $dict_iterator(obj,info){
this.__getattr__=function(attr){
var res=this[attr]
if(res===undefined){throw AttributeError(
"'"+info+"' object has no attribute '"+attr+"'")}
else{return $bind(this[attr],this)}
}
this.__len__=function(){return obj.__len__()}
this.__item__=function(i){return obj.__item__(i)}
this.__iter__=function(){return new $iterator_getitem(obj)}
this.__class__=new $class(this,info)
this.toString=function(){return info+'('+obj.toString()+')'}
this.__str__=this.toString
}
function dir(obj){
var res=[]
for(var attr in obj){res.push(attr)}
res.sort()
return res
}
function divmod(x,y){
if(x < 0){
var x2=(Number(y)+Number(x))%y
if(abs(x)<=y){
return[int(Math.floor(x/y)), x2]
}
return[int(Math.ceil(x/y)), x2]
}
return[int(Math.floor(x/y)), x%y]
}
function enumerate(iterator){
var res=[]
for(var i=0;i<iterator.__len__();i++){
res.push([i,iterator.__item__(i)])
}
return res
}
function filter(){
if(arguments.length!=2){throw TypeError(
"filter expected 2 arguments, got "+arguments.length)}
var func=arguments[0],iterable=arguments[1]
var res=[]
for(var i=0;i<iterable.__len__();i++){
if(func(iterable.__item__(i))){
res.push(iterable.__item__(i))
}
}
return res
}
function float(value){
if(value===undefined){return new $FloatClass(0.0)}
if(typeof value=="number" ||(typeof value=="string" && !isNaN(value))){
return new $FloatClass(parseFloat(value))
}
if(isinstance(value,float))return value
if(value=='inf')return new $FloatClass(Infinity)
if(value=='-inf')return new $FloatClass(-Infinity)
if(typeof value=='string' && value.toLowerCase()=='nan')return new $FloatClass(Number.NaN)
throw ValueError("Could not convert to float(): '"+str(value)+"'")
}
float.__bool__=function(){return bool(this.value)}
float.__class__=$type
float.__name__='float'
float.__new__=function(){return new $FloatClass(0.0)}
float.toString=float.__str__=function(){return "<class 'float'>"}
float.__hash__=function(){
frexp=function(re){
var ex=Math.floor(Math.log(re)/ Math.log(2))+ 1
var frac=re / Math.pow(2, ex)
return[frac, ex]
}
if(this.value===Infinity || this.value===-Infinity){
if(this.value < 0.0)return -271828
return 314159
}else if(isNaN(this.value)){
return 0
}
var r=frexp(this.value)
r[0]*=Math.pow(2,31)
hipart=int(r[0])
r[0]=(r[0]- hipart)* Math.pow(2,31)
var x=hipart + int(r[0])+(r[1]<< 15)
return x & 0xFFFFFFFF
}
function $FloatClass(value){
this.value=value
this.__class__=float
this.__hash__=float.__hash__
}
$FloatClass.prototype.toString=function(){
var res=this.value+'' 
if(res.indexOf('.')==-1){res+='.0'}
return str(res)
}
$FloatClass.prototype.__class__=float
$FloatClass.prototype.__bool__=function(){return bool(this.value)}
$FloatClass.prototype.__eq__=function(other){
if(isinstance(other,int)){return this.valueOf()==other.valueOf()}
else if(isinstance(other,float)){return this.valueOf()==other.value}
else{return this.valueOf()===other}
}
$FloatClass.prototype.__floordiv__=function(other){
if(isinstance(other,int)){
if(other===0){throw ZeroDivisionError('division by zero')}
else{return float(Math.floor(this.value/other))}
}else if(isinstance(other,float)){
if(!other.value){throw ZeroDivisionError('division by zero')}
else{return float(Math.floor(this.value/other.value))}
}else{throw TypeError(
"unsupported operand type(s) for //: 'int' and '"+other.__class__+"'")
}
}
$FloatClass.prototype.__getattr__=function(attr){
if(attr==='__class__'){return float}
if(this[attr]!==undefined){
if(typeof this[attr]==='function'){return $bind(this[attr],this)}
else{return this[attr]}
}
else{throw AttributeError("'float' object has no attribute '"+attr+"'")}
}
$FloatClass.prototype.__hash__=float.__hash__
$FloatClass.prototype.__in__=function(item){return item.__contains__(this)}
$FloatClass.prototype.__ne__=function(other){return !this.__eq__(other)}
$FloatClass.prototype.__neg__=function(other){return -this.value}
$FloatClass.prototype.__not_in__=function(item){return !(item.__contains__(this))}
$FloatClass.prototype.__repr__=$FloatClass.prototype.toString
$FloatClass.prototype.__str__=$FloatClass.prototype.toString
$FloatClass.prototype.__truediv__=function(other){
if(isinstance(other,int)){
if(other===0){throw ZeroDivisionError('division by zero')}
else{return float(this.value/other)}
}else if(isinstance(other,float)){
if(!other.value){throw ZeroDivisionError('division by zero')}
else{return float(this.value/other.value)}
}else{throw TypeError(
"unsupported operand type(s) for //: 'int' and '"+other.__class__+"'")
}
}
var $op_func=function(other){
if(isinstance(other,int)){return float(this.value-other)}
else if(isinstance(other,float)){return float(this.value-other.value)}
else if(isinstance(other,bool)){
var bool_value=0;
if(other.valueOf())bool_value=1
return float(this.value-bool_value)}
else{throw TypeError(
"unsupported operand type(s) for -: "+this.value+" (float) and '"+other.__class__+"'")
}
}
$op_func +='' 
var $ops={'+':'add','-':'sub','*':'mul','%':'mod'}
for($op in $ops){
eval('$FloatClass.prototype.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}
$FloatClass.prototype.__pow__=function(other){
if(isinstance(other,int)){return float(Math.pow(this,other))}
else if(isinstance(other,float)){return float(Math.pow(this.value,other.value))}
else{throw TypeError(
"unsupported operand type(s) for -: "+this.value+" (float) and '"+other.__class__+"'")
}
}
var $comp_func=function(other){
if(isinstance(other,int)){return this.value > other.valueOf()}
else if(isinstance(other,float)){return this.value > other.value}
else{throw TypeError(
"unorderable types: "+this.__class__+'() > '+other.__class__+"()")
}
}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
eval("$FloatClass.prototype.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
var $notimplemented=function(other){
throw TypeError(
"unsupported operand types for OPERATOR: '"+this.__class__+"' and '"+other.__class__+"'")
}
$notimplemented +='' 
for($op in $operators){
var $opfunc='__'+$operators[$op]+'__'
if(!($opfunc in $FloatClass.prototype)){
eval('$FloatClass.prototype.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
}
}
function frozenset(){
var res=set.apply(null,arguments)
res.__class__=frozenset
var x=str(res)
res.__str__=function(){return "frozenset("+x+")"}
return res
}
frozenset.__class__=$type
frozenset.__str__=function(){return "<class 'frozenset'>"}
frozenset.add=function(){throw AttributeError("'frozenset' object has no attribute 'add'")}
function getattr(obj,attr,_default){
if(obj.__getattr__!==undefined &&
obj.__getattr__(attr)!==undefined){
return obj.__getattr__(attr)
}
else if(_default !==undefined){return _default}
else{throw AttributeError(
"'"+str(obj.__class__)+"' object has no attribute '"+attr+"'")}
}
function hasattr(obj,attr){
try{getattr(obj,attr);return True}
catch(err){return False}
}
function hash(obj){
if(isinstance(obj, int)){return obj.valueOf();}
if(isinstance(obj, bool)){return int(obj);}
if(obj.__hashvalue__ !==undefined){return obj.__hashvalue__;}
if(obj.__hash__ !==undefined){
obj.__hashvalue__=obj.__hash__()
return obj.__hashvalue__
}else{
throw AttributeError(
"'"+str(obj.__class__)+"' object has no attribute '__hash__'")
}
}
function hex(x){
return $builtin_base_convert_helper(x, 16)
}
function id(obj){
if(obj.__hashvalue__ !==undefined){
return obj.__hashvalue__
}
if(obj.__hash__===undefined || isinstance(obj, set)||
isinstance(obj, list)|| isinstance(obj, dict)){
__BRYTHON__.$py_next_hash+=1
obj.__hashvalue=__BRYTHON__.$py_next_hash
return obj.__hashvalue__
}
if(obj.__hash__ !==undefined){
return obj.__hash__()
}
return null
}
function input(src){
return prompt(src)
}
function int(value){
if(value===undefined){return 0}
else if(isinstance(value,int)){return value}
else if(value===True){return 1}
else if(value===False){return 0}
else if(typeof value=="number" ||
(typeof value=="string" && parseInt(value)!=NaN)){
return parseInt(value)
}else if(isinstance(value,float)){
return parseInt(value.value)
}else{throw ValueError(
"Invalid literal for int() with base 10: '"+str(value)+"'"+value.__class__)
}
}
int.__bool__=function(){if(value===0){return False}else{return True}}
int.__class__=$type
int.__name__='int'
int.__new__=function(){return 0}
int.toString=int.__str__=function(){return "<class 'int'>"}
Number.prototype.__and__=function(other){return this & other}
Number.prototype.__bool__=function(){return new Boolean(this.valueOf())}
Number.prototype.__class__=int
Number.prototype.__eq__=function(other){
if(isinstance(other,int)){return this.valueOf()==other.valueOf()}
else if(isinstance(other,float)){return this.valueOf()==other.value}
else{return this.valueOf()===other}
}
Number.prototype.__floordiv__=function(other){
if(isinstance(other,int)){
if(other==0){throw ZeroDivisionError('division by zero')}
else{return Math.floor(this/other)}
}else if(isinstance(other,float)){
if(!other.value){throw ZeroDivisionError('division by zero')}
else{return float(Math.floor(this/other.value))}
}else{$UnsupportedOpType("//","int",other.__class__)}
}
Number.prototype.__getattr__=function(attr){
if(attr==='__class__'){return int}
if(this[attr]!==undefined){
if(typeof this[attr]==='function'){return $bind(this[attr],this)}
else{return this[attr]}
}
throw AttributeError("'int' object has no attribute '"+attr+"'")
}
Number.prototype.__hash__=function(){return this.valueOf()}
Number.prototype.__in__=function(item){return item.__contains__(this)}
Number.prototype.__int__=function(){return this}
Number.prototype.__invert__=function(){return ~this}
Number.prototype.__lshift__=function(other){return this << other}
Number.prototype.__mul__=function(other){
var val=this.valueOf()
if(isinstance(other,int)){return this*other}
else if(isinstance(other,float)){return float(this*other.value)}
else if(isinstance(other,bool)){
var bool_value=0
if(other.valueOf())bool_value=1
return this*bool_value}
else if(typeof other==="string"){
var res=''
for(var i=0;i<val;i++){res+=other}
return res
}else if(isinstance(other,[list,tuple])){
var res=[]
var $temp=other.slice(0,other.length)
for(var i=0;i<val;i++){res=res.concat($temp)}
if(isinstance(other,tuple)){res=tuple(res)}
return res
}else{$UnsupportedOpType("*",int,other)}
}
Number.prototype.__ne__=function(other){return !this.__eq__(other)}
Number.prototype.__neg__=function(){return -this}
Number.prototype.__not_in__=function(item){
res=item.__getattr__('__contains__')(this)
return !res
}
Number.prototype.__or__=function(other){return this | other}
Number.prototype.__pow__=function(other){
if(isinstance(other, int)){return int(Math.pow(this.valueOf(),other.valueOf()))}
else if(isinstance(other, float)){return float(Math.pow(this.valueOf(), other.valueOf()))}
else{$UnsupportedOpType("**",int,other.__class__)}
}
Number.prototype.__repr__=function(){return this.toString()}
Number.prototype.__rshift__=function(other){return this >> other}
Number.prototype.__setattr__=function(attr,value){throw AttributeError(
"'int' object has no attribute "+attr+"'")}
Number.prototype.__str__=function(){return this.toString()}
Number.prototype.__truediv__=function(other){
if(isinstance(other,int)){
if(other==0){throw ZeroDivisionError('division by zero')}
else{return float(this/other)}
}else if(isinstance(other,float)){
if(!other.value){throw ZeroDivisionError('division by zero')}
else{return float(this/other.value)}
}else{$UnsupportedOpType("//","int",other.__class__)}
}
Number.prototype.__xor__=function(other){return this ^ other}
var $op_func=function(other){
if(isinstance(other,int)){
var res=this.valueOf()-other.valueOf()
if(isinstance(res,int)){return res}
else{return float(res)}
}
else if(isinstance(other,float)){return float(this.valueOf()-other.value)}
else if(isinstance(other,bool)){
var bool_value=0
if(other.valueOf())bool_value=1
return this.valueOf()-bool_value}
else{throw TypeError(
"unsupported operand type(s) for -: "+this.value+" (float) and '"+str(other.__class__)+"'")
}
}
$op_func +='' 
var $ops={'+':'add','-':'sub','%':'mod'}
for($op in $ops){
eval('Number.prototype.__'+$ops[$op]+'__ = '+$op_func.replace(/-/gm,$op))
}
var $comp_func=function(other){
if(isinstance(other,int)){return this.valueOf()> other.valueOf()}
else if(isinstance(other,float)){return this.valueOf()> other.value}
else{throw TypeError(
"unorderable types: "+str(this.__class__)+'() > '+str(other.__class__)+"()")}
}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
eval("Number.prototype.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
var $notimplemented=function(other){
throw TypeError(
"unsupported operand types for OPERATOR: '"+str(this.__class__)+"' and '"+str(other.__class__)+"'")
}
$notimplemented +='' 
for($op in $operators){
var $opfunc='__'+$operators[$op]+'__'
if(!($opfunc in Number.prototype)){
eval('Number.prototype.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
}
}
function isinstance(obj,arg){
if(obj===null){return arg===None}
if(obj===undefined){return false}
if(arg.constructor===Array){
for(var i=0;i<arg.length;i++){
if(isinstance(obj,arg[i])){return true}
}
return false
}else{
if(arg===int){
return((typeof obj)=="number"||obj.constructor===Number)&&(obj.valueOf()%1===0)
}
if(arg===float){
return((typeof obj=="number" && obj.valueOf()%1!==0))||
(obj.__class__===float)
}
if(arg===str){return(typeof obj=="string")}
if(arg===list){return(obj.constructor===Array)}
if(obj.__class__!==undefined){return obj.__class__===arg}
return obj.constructor===arg
}
}
function iter(obj){
if(obj.__iter__!==undefined){return obj.__iter__()}
else if(obj.__getitem__!==undefined){return new $iterator_getitem(obj)}
throw TypeError("'"+str(obj.__class__)+"' object is not iterable")
}
function $iterator_getitem(obj){
this.counter=-1
this.__getattr__=function(attr){
if(attr==='__next__'){return $bind(this[attr],this)}
}
this.__next__=function(){
this.counter++
if(this.counter<obj.__len__()){return obj.__getitem__(this.counter)}
else{throw StopIteration("")}
}
if(obj.__class__ !==undefined){
this.__class__=obj.__class__
}
}
function len(obj){
try{return obj.__len__()}
catch(err){
try{return obj.__getattr__('__len__')()}
catch(err){
throw TypeError("object of type '"+obj.__class__.__name__+"' has no len()")}
}
}
function locals(obj_id){
var res=dict()
var scope=__BRYTHON__.scope[obj_id].__dict__
for(var name in scope){res.__setitem__(name,scope[name])}
return res
}
function map(){
var func=arguments[0],res=[],rank=0
while(true){
var args=[],flag=true
for(var i=1;i<arguments.length;i++){
var x=arguments[i].__item__(rank)
if(x===undefined){flag=false;break}
args.push(x)
}
if(!flag){break}
res.push(func.apply(null,args))
rank++
}
return res
}
function $extreme(args,op){
if(op==='__gt__'){var $op_name="max"}
else{var $op_name="min"}
if(args.length==0){throw TypeError($op_name+" expected 1 argument, got 0")}
var last_arg=args[args.length-1]
var last_i=args.length-1
var has_key=false
if(isinstance(last_arg,$Kw)){
if(last_arg.name==='key'){
var func=last_arg.value
has_key=true
last_i--
}else{throw TypeError($op_name+"() got an unexpected keyword argument")}
}else{var func=function(x){return x}}
if((has_key && args.length==2)||(!has_key && args.length==1)){
var arg=args[0]
var $iter=iter(arg)
var res=null
while(true){
try{
var x=next($iter)
if(res===null || bool(func(x)[op](func(res)))){res=x}
}catch(err){
if(err.__name__=="StopIteration"){return res}
throw err
}
}
}else{
var res=null
for(var i=0;i<=last_i;i++){
var x=args[i]
if(res===null || bool(func(x)[op](func(res)))){res=x}
}
return res
}
}
function max(){
var args=[]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return $extreme(args,'__gt__')
}
function memoryview(obj){
throw NotImplementedError('memoryview is not implemented')
}
function min(){
var args=[]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return $extreme(args,'__lt__')
}
function next(obj){
if(obj.__next__!==undefined){return obj.__next__()}
throw TypeError("'"+str(obj.__class__)+"' object is not an iterator")
}
function $not(obj){return !bool(obj)}
function $ObjectClass(cls){
this.__class__="<class 'object'>"
if(cls !==undefined){
for(attr in cls){
this[attr]=cls[attr]
}
}
}
$ObjectClass.prototype.__getattr__=function(attr){
if(attr in this){return this[attr]}
else{throw AttributeError("object has no attribute '"+attr+"'")}
}
$ObjectClass.prototype.__delattr__=function(attr){delete this[attr]}
$ObjectClass.prototype.__setattr__=function(attr,value){this[attr]=value}
function object(){
return new $ObjectClass()
}
object.__new__=function(cls){return new $ObjectClass(cls)}
object.__class__=$type
object.__name__='object'
object.toString=object.__str__=function(){return "<class 'object'>" }
object.__getattr__=function(attr){
if(attr in this){return this[attr]}
else{throw AttributeError("object has no attribute '"+attr+"'")}
}
object.__hash__=function(){
__BRYTHON__.$py_next_hash+=1;
return __BRYTHON__.$py_next_hash
}
$ObjectClass.prototype.__hash__=object.__hash__
function oct(x){
return $builtin_base_convert_helper(x, 8)
}
function $open(){
var $ns=$MakeArgs('open',arguments,['file'],{'mode':'r','encoding':'utf-8'},'args','kw')
for(var attr in $ns){eval('var '+attr+'=$ns["'+attr+'"]')}
if(args.length>0){var mode=args[0]}
if(args.length>1){var encoding=args[1]}
if(isinstance(file,JSObject)){return new $OpenFile(file.js,mode,encoding)}
}
function ord(c){
return c.charCodeAt(0)
}
function pow(x,y){
var a,b
if(isinstance(x, float)){a=x.value}else{a=x}
if(isinstance(y, float)){b=y.value}else{b=y}
return Math.pow(a,b)
}
function $print(){
var $ns=$MakeArgs('print',arguments,[],{},'args','kw')
var args=$ns['args']
var kw=$ns['kw']
var end=kw.get('end','\n')
var res=''
for(var i=0;i<args.length;i++){
res +=str(args[i])
if(i<args.length-1){res +=' '}
}
res +=end
document.$stdout.__getattr__('write')(res)
}
log=function(arg){console.log(arg)}
function $prompt(text,fill){return prompt(text,fill || '')}
function $PropertyClass(){
this.__class__="<class 'property'>"
}
$PropertyClass.prototype.__hash__=object.__hash__
$PropertyClass.prototype.toString=$PropertyClass.prototype.__str__=function(){return "<property object at " + hex(this.__hash__())+ ">" }
function property(fget, fset, fdel, doc){
var p=new $PropertyClass()
p.__get__=function(instance, factory){return fget.__call__(instance)};
p.__doc__=doc || ""
return p
}
property.__class__=$type
property.__name__='property'
property.toString=property.__str__=function(){return "<class 'property'>" }
property.__hash__=object.__hash__
function range(){
var $ns=$MakeArgs('range',arguments,[],{},'args',null)
var args=$ns['args']
if(args.length>3){throw TypeError(
"range expected at most 3 arguments, got "+args.length)
}
var start=0
var stop=0
var step=1
if(args.length==1){stop=args[0]}
else if(args.length>=2){
start=args[0]
stop=args[1]
}
if(args.length>=3){step=args[2]}
if(step==0){throw ValueError("range() arg 3 must not be zero")}
var res=[]
if(step>0){
for(var i=start;i<stop;i+=step){res.push(i)}
}else if(step<0){
for(var i=start;i>stop;i+=step){res.push(i)}
}
return res
}
function repr(obj){
if(obj.__repr__!==undefined){return obj.__repr__()}
else{throw AttributeError("object has no attribute __repr__")}
}
function reversed(seq){
if(isinstance(seq,list)){seq.reverse();return seq}
else if(isinstance(seq,str)){
var res=''
for(var i=seq.length-1;i>=0;i--){res+=seq.charAt(i)}
return res
}else{throw TypeError(
"argument to reversed() must be a sequence")}
}
function round(arg,n){
if(!isinstance(arg,[int,float])){
throw TypeError("type "+str(arg.__class__)+" doesn't define __round__ method")
}
if(n===undefined){n=0}
if(!isinstance(n,int)){throw TypeError(
"'"+n.__class__+"' object cannot be interpreted as an integer")}
var mult=Math.pow(10,n)
var res=Number(Math.round(arg*mult)).__truediv__(mult)
if(n==0){return int(res)}else{return float(res)}
}
function set(){
if(arguments.length==0){return new $SetClass()}
else if(arguments.length==1){
var arg=arguments[0]
if(isinstance(arg,set)){return arg}
var obj=new $SetClass()
try{
for(var i=0;i<arg.__len__();i++){
set.add(obj,arg.__getitem__(i))
}
return obj
}catch(err){
console.log(err)
throw TypeError("'"+arg.__class__.__name__+"' object is not iterable")
}
}else{
throw TypeError("set expected at most 1 argument, got "+arguments.length)
}
}
set.__class__=$type
set.__name__='set'
set.__new__=function(){return set()}
function $SetClass(){
var x=null
var i=null
this.iter=null
this.__class__=set
this.items=[]
}
$SetClass.prototype.toString=function(){
var res="{"
for(var i=0;i<this.items.length;i++){
var x=this.items[i]
if(isinstance(x,str)){res +="'"+x+"'"}
else{res +=x.toString()}
if(i<this.items.length-1){res +=','}
}
return res+'}'
}
set.__add__=function(self,other){
return set(self.items.concat(other.items))
}
set.__and__=function(self,other){
var res=set()
for(var i=0;i<self.items.length;i++){
if(other.__contains__(self.items[i])){res.add(self.items[i])}
}
return res
}
set.__contains__=function(self,item){
for(var i=0;i<self.items.length;i++){
try{if(self.items[i].__eq__(item)){return True}
}catch(err){void(0)}
}
return False
}
set.__eq__=function(self,other){
if(other===undefined){
return self===set
}
if(isinstance(other,set)){
if(other.items.length==self.items.length){
for(var i=0;i<self.items.length;i++){
if(set.__contains__(self,other.items[i])===False){
return False
}
}
return True
}
}
return False
}
$SetClass.prototype.__getattr__=function(attr){
if(attr==='__class__'){return this.__class__}
if(set[attr]===undefined){throw AttributeError("'set' object has no attribute '"+attr+"'")}
var obj=this
var res=function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return set[attr].apply(obj,args)
}
res.__str__=function(){return "<built-in method "+attr+" of set object>"}
return res
}
set.__ge__=function(self,other){
return !set.__lt__(self,other)
}
set.__gt__=function(self,other){
return !set.__le__(self,other)
}
set.__hash__=function(self){throw TypeError("unhashable type: 'set'");}
set.__in__=function(self,item){return item.__contains__(self)}
set.__iter__=function(self){return new $iterator_getitem(self.items)}
set.__le__=function(self,other){
for(var i=0;i<self.items.length;i++){
if(!other.__contains__(self.items[i])){return false}
}
return true 
}
set.__lt__=function(self,other){
return set.__le__(self,other)&&set.__len__(self)<other.__len__()
}
set.__len__=function(self){return int(self.items.length)}
set.__item__=function(self,i){return self.items[i]}
set.__ne__=function(self,other){return !set.__eq__(self,other)}
set.__not_in__=function(self,item){return !set.__in__(self,item)}
set.__or__=function(self,other){
var res=self.copy()
for(var i=0;i<other.items.length;i++){
res.add(other.items[i])
}
return res
}
set.__repr__=function(self){
if(self===undefined){return "<class 'set'>"}
var res="{"
for(var i=0;i<self.items.length;i++){
res +=repr(self.items[i])
if(i<self.items.length-1){res +=','}
}
return res+'}'
}
set.__str__=set.__repr__
set.__sub__=function(self,other){
var res=set()
for(var i=0;i<self.items.length;i++){
if(!other.__contains__(self.items[i])){res.items.push(self.items[i])}
}
return res
}
set.__xor__=function(self,other){
var res=set()
for(var i=0;i<self.items.length;i++){
if(!other.__contains__(self.items[i])){
res.add(self.items[i])
}
}
for(var i=0;i<other.items.length;i++){
if(!self.__contains__(other.items[i])){
res.add(other.items[i])
}
}
return res
}
set.add=function(self,item){
if(self.__class__===frozenset){throw AttributeError("'frozenset' object has no attribute 'add'")}
for(var i=0;i<self.items.length;i++){
try{if(item.__eq__(self.items[i])){return}}
catch(err){void(0)}
}
self.items.push(item)
}
set.clear=function(self){
if(self.__class__===frozenset){throw AttributeError("'frozenset' object has no attribute 'clear'")}
self.items=[]
}
set.copy=function(self){
var res=set()
for(var i=0;i<self.items.length;i++){res.items[i]=self.items[i]}
return res
}
set.discard=function(self,item){
if(self.__class__===frozenset){throw AttributeError("'frozenset' object has no attribute 'discard'")}
try{set.remove(self,item)}
catch(err){if(err.__name__!=='KeyError'){throw err}}
}
set.isdisjoint=function(self,other){
for(var i=0;i<self.items.length;i++){
if(other.__contains__(self.items[i])){return false}
}
return true 
}
set.pop=function(self){
if(self.__class__===frozenset){throw AttributeError("'frozenset' object has no attribute 'pop'")}
if(self.items.length===0){throw KeyError('pop from an empty set')}
return self.items.pop()
}
set.remove=function(self,item){
if(self.__class__===frozenset){throw AttributeError("'frozenset' object has no attribute 'remove'")}
for(var i=0;i<self.items.length;i++){
if(self.items[i].__eq__(item)){
self.items.splice(i,1)
return None
}
}
throw KeyError(item)
}
set.difference=set.__sub__
set.intersection=set.__and__
set.issubset=set.__le__
set.issuperset=set.__ge__
set.union=set.__or__
set.toString=function(){return "<class 'set'>"}
for(var attr in set){
if(typeof set[attr]==='function'){set[attr].__str__=function(){return "<set method "+attr+">"}}
var func=(function(attr){
return function(){
var args=[this]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return set[attr].apply(this,args)
}
})(attr)
func.__str__=(function(attr){
return function(){return "<method-wrapper '"+attr+"' of set object>"}
})(attr)
$SetClass.prototype[attr]=func
}
$SetClass.prototype.__class__=set
function setattr(obj,attr,value){
if(!isinstance(attr,str)){throw TypeError("setattr(): attribute name must be string")}
obj[attr]=value
}
function $SliceClass(start,stop,step){
this.__class__=slice
this.start=start
this.stop=stop
this.step=step
}
function slice(){
var $ns=$MakeArgs('slice',arguments,[],{},'args',null)
var args=$ns['args']
if(args.length>3){throw TypeError(
"slice expected at most 3 arguments, got "+args.length)
}
var start=0
var stop=0
var step=1
if(args.length==1){stop=args[0]}
else if(args.length>=2){
start=args[0]
stop=args[1]
}
if(args.length>=3){step=args[2]}
if(step==0){throw ValueError("slice step must not be zero")}
return new $SliceClass(start,stop,step)
}
function sorted(iterable, key, reverse){
if(reverse===undefined){reverse=False}
var obj=new $list()
for(var i=0;i<iterable.__len__();i++){
obj.append(iterable.__item__(i))
}
if(key !==undefined){
var d=$DictClass(('key', key),('reverse', reverse))
obj.sort(d)
}else{
var d=$DictClass(('reverse', reverse))
obj.sort(d)
}
return obj
}
function staticmethod(func){
return func
}
function sum(iterable,start){
if(start===undefined){start=0}
var res=0
for(var i=start;i<iterable.__len__();i++){
res=res.__add__(iterable.__item__(i))
}
return res
}
function $tuple(arg){return arg}
function tuple(){
var obj=list.apply(null,arguments)
obj.__class__=tuple
obj.__bool__=function(){return obj.length>0}
obj.__hash__=function(){
var x=0x345678
for(var i=0;i < args.length;i++){
var y=_list[i].__hash__()
x=(1000003 * x)^ y & 0xFFFFFFFF
}
return x
}
return obj
}
tuple.__class__=$type
tuple.__name__='tuple'
tuple.__new__=function(){return tuple()}
tuple.__str__=function(){return "<class 'tuple'>"}
tuple.toString=tuple.__str__
function type(obj){
if(obj.__class__ !==undefined){return obj.__class__}
throw NotImplementedError('type not implemented yet')
}
function zip(){
var $ns=$MakeArgs('zip',arguments,[],{},'args','kw')
var args=$ns['args']
var kw=$ns['kw']
var rank=0,res=[]
while(true){
var line=[],flag=true
for(var i=0;i<args.length;i++){
var x=args[i].__item__(rank)
if(x===undefined){flag=false;break}
line.push(x)
}
if(!flag){return res}
res.push(line)
rank++
}
}
True=true
False=false
Boolean.prototype.__add__=function(other){
if(this.valueOf())return other + 1
return other
}
Boolean.prototype.__class__=bool
Boolean.prototype.__eq__=function(other){
if(this.valueOf()){return !!other}else{return !other}
}
Boolean.prototype.__getattr__=function(attr){
if(this[attr]!==undefined){return this[attr]}
else{throw AttributeError("'bool' object has no attribute '"+attr+"'")}
}
Boolean.prototype.__hash__=function(){
if(this.valueOf())return 1
return 0
}
Boolean.prototype.__mul__=function(other){
if(this.valueOf())return other
return 0
}
Boolean.prototype.__ne__=function(other){return !this.__eq__(other)}
Boolean.prototype.toString=function(){
if(this.valueOf())return "True"
return "False"
}
Boolean.prototype.__repr__=Boolean.prototype.toString
Boolean.prototype.__str__=Boolean.prototype.toString
function $NoneClass(){
this.__class__={'__class__':$type,
'__str__':function(){return "<class 'NoneType'>"},
'__getattr__':function(attr){return this[attr]}
}
this.__bool__=function(){return False}
this.__eq__=function(other){return other===None}
this.__getattr__=function(attr){
if(this[attr]!==undefined){return this[attr]}
else{throw AttributeError("'NoneType' object has no attribute '"+attr+"'")}
}
this.__hash__=function(){return 0}
this.__ne__=function(other){return other!==None}
this.__repr__=function(){return 'None'}
this.__str__=function(){return 'None'}
var comp_ops=['ge','gt','le','lt']
for(var key in $comps){
if(comp_ops.indexOf($comps[key])>-1){
this['__'+$comps[key]+'__']=(function(k){
return function(other){
throw TypeError("unorderable types: NoneType() "+$comps[k]+" "+
other.__class__.__name__)}
})(key)
}
}
for(var func in this){
if(typeof this[func]==='function'){
this[func].__str__=(function(f){
return function(){return "<method-wrapper "+f+" of NoneType object>"}
})(func)
}
}
}
None=new $NoneClass()
Exception=function(msg){
var err=Error()
err.info=''
if(document.$debug && msg.split('\n').length==1){
var module=document.$line_info[1]
var line_num=document.$line_info[0]
var lines=document.$py_src[module].split('\n')
err.info +="\nmodule '"+module+"' line "+line_num
err.info +='\n'+lines[line_num-1]
}
err.message=msg
err.args=tuple(msg.split('\n')[0])
err.__str__=function(){return msg}
err.toString=err.__str__
err.__getattr__=function(attr){return this[attr]}
err.__name__='Exception'
err.__class__=Exception
err.py_error=true
__BRYTHON__.exception_stack.push(err)
return err
}
Exception.__str__=function(){return "<class 'Exception'>"}
Exception.__class__=$type
__BRYTHON__.exception=function(js_exc){
if(js_exc.py_error===true){var exc=js_exc}
else{
var exc=Exception(js_exc.message)
exc.__name__=js_exc.name
}
__BRYTHON__.exception_stack.push(exc)
return exc
}
function $make_exc(name){
var $exc=(Exception+'').replace(/Exception/g,name)
eval(name+'='+$exc)
eval(name+'.__str__ = function(){return "<class '+"'"+name+"'"+'>"}')
eval(name+'.__class__=$type')
}
var $errors=['AssertionError','AttributeError','EOFError','FloatingPointError',
'GeneratorExit','ImportError','IndexError','KeyError','KeyboardInterrupt',
'NameError','NotImplementedError','OSError','OverflowError','ReferenceError',
'RuntimeError','StopIteration','SyntaxError','IndentationError','TabError',
'SystemError','SystemExit','TypeError','UnboundLocalError','ValueError',
'ZeroDivisionError','IOError']
for(var $i=0;$i<$errors.length;$i++){$make_exc($errors[$i])}
var $warnings=['Warning', 'DeprecationWarning', 'PendingDeprecationWarning',
'RuntimeWarning', 'SyntaxWarning', 'UserWarning',
'FutureWarning', 'ImportWarning', 'UnicodeWarning',
'BytesWarning', 'ResourceWarning']
for(var $i=0;$i<$warnings.length;$i++){$make_exc($warnings[$i])}
list=function(){
function $list(){
var args=new Array()
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return new $ListClass(args)
}
function list(){
if(arguments.length===0){return[]}
else if(arguments.length>1){
throw TypeError("list() takes at most 1 argument ("+arguments.length+" given)")
}
var res=[]
list.__init__(res,arguments[0])
res.__brython__=true 
return res
}
list.__add__=function(self,other){
var res=self.valueOf().concat(other.valueOf())
if(isinstance(self,tuple)){res=tuple(res)}
return res
}
list.__class__=$type
list.__contains__=function(self,item){
for(var i=0;i<self.length;i++){
try{if(self[i].__eq__(item)){return true}
}catch(err){void(0)}
}
return false
}
list.__delitem__=function(self,arg){
if(isinstance(arg,int)){
var pos=arg
if(arg<0){pos=self.length+pos}
if(pos>=0 && pos<self.length){
self.splice(pos,1)
return
}
else{throw IndexError('list index out of range')}
}else if(isinstance(arg,slice)){
var start=arg.start || 0
var stop=arg.stop || self.length
var step=arg.step || 1
if(start<0){start=self.length+start}
if(stop<0){stop=self.length+stop}
var res=[],i=null
if(step>0){
if(stop>start){
for(i=start;i<stop;i+=step){
if(self[i]!==undefined){res.push(i)}
}
}
}else{
if(stop<start){
for(i=start;i>stop;i+=step.value){
if(self[i]!==undefined){res.push(i)}
}
res.reverse()
}
}
for(var i=res.length-1;i>=0;i--){
self.splice(res[i],1)
}
return
}else{
throw TypeError('list indices must be integer, not '+str(arg.__class__))
}
}
list.__eq__=function(self,other){
if(other===undefined){
return self===list
}
if(isinstance(other,self.__class__)){
if(other.length==self.length){
for(var i=0;i<self.length;i++){
if(!self[i].__eq__(other[i])){return False}
}
return True
}
}
return False
}
list.__getattr__=function(attr){
switch(attr){
case '__class__':
var res=function(){return list}
res.__str__=list.__str__
return res
case '__name__':
var res=function(){
throw AttributeError(" 'list' object has no attribute '__name__'")
}
res.__str__=function(){return 'list'}
return res
default:
return list[attr]
}
}
list.__getitem__=function(self,arg){
if(isinstance(arg,int)){
var items=self.valueOf()
var pos=arg
if(arg<0){pos=items.length+pos}
if(pos>=0 && pos<items.length){return items[pos]}
else{
throw IndexError('list index out of range')
}
}else if(isinstance(arg,slice)){
var step=arg.step===None ? 1 : arg.step
if(step>0){
var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.__len__(): arg.stop
}else{
var start=arg.start===None ? self.__len__()-1 : arg.start
var stop=arg.stop===None ? 0 : arg.stop
}
if(start<0){start=int(self.length+start)}
if(stop<0){stop=self.length+stop}
var res=[],i=null,items=self.valueOf()
if(step>0){
if(stop<=start){return res}
else{
for(i=start;i<stop;i+=step){
if(items[i]!==undefined){res.push(items[i])}
else{res.push(None)}
}
return res
}
}else{
if(stop>=start){return res}
else{
for(i=start;i>=stop;i+=step){
if(items[i]!==undefined){res.push(items[i])}
else{res.push(None)}
}
return res
}
}
}else if(isinstance(arg,bool)){
return self.__getitem__(int(arg))
}else{
throw TypeError('list indices must be integer, not '+str(arg.__class__))
}
}
list.__hash__=function(self){throw TypeError("unhashable type: 'list'")}
list.__in__=function(self,item){return item.__contains__(self)}
list.__init__=function(self){
while(self.__len__()>0){self.pop()}
if(arguments.length===1){return}
var arg=arguments[1]
for(var i=0;i<arg.__len__();i++){self.push(arg.__item__(i))}
}
list.__item__=function(self,i){return self[i]}
list.__len__=function(self){return self.length}
list.__mul__=function(self,other){
if(isinstance(other,int)){return other.__mul__(self)}
else{throw TypeError("can't multiply sequence by non-int of type '"+other.__name+"'")}
}
list.__name__='list'
list.__ne__=function(self,other){return !self.__eq__(other)}
list.__new__=function(){return[]}
list.__not_in__=function(self,item){return !list.__in__(self,item)}
list.__repr__=function(self){
if(self===undefined){return "<class 'list'>"}
var items=self.valueOf()
var res='['
if(self.__class__===tuple){res='('}
for(var i=0;i<self.length;i++){
var x=self[i]
if(x.__repr__!==undefined){res+=x.__repr__()}
else{res +=x.toString()}
if(i<self.length-1){res +=','}
}
if(self.__class__===tuple){return res+')'}
else{return res+']'}
}
list.__setitem__=function(self,arg,value){
if(isinstance(arg,int)){
var pos=arg
if(arg<0){pos=self.length+pos}
if(pos>=0 && pos<self.length){self[pos]=value}
else{throw IndexError('list index out of range')}
}else if(isinstance(arg,slice)){
var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.__len__(): arg.stop
var step=arg.step===None ? 1 : arg.step
if(start<0){start=self.length+start}
if(stop<0){stop=self.length+stop}
self.splice(start,stop-start)
if(hasattr(value,'__item__')){
var $temp=list(value)
for(var i=$temp.length-1;i>=0;i--){
self.splice(start,0,$temp[i])
}
}else{
throw TypeError("can only assign an iterable")
}
}else{
throw TypeError('list indices must be integer, not '+str(arg.__class__))
}
}
list.__str__=list.__repr__
list.append=function(self,other){self.push(other)}
list.count=function(self,elt){
var res=0
for(var i=0;i<self.length;i++){
if(self[i].__eq__(elt)){res++}
}
return res
}
list.extend=function(self,other){
if(arguments.length!=2){throw TypeError(
"extend() takes exactly one argument ("+arguments.length+" given)")}
try{
for(var i=0;i<other.__len__();i++){self.push(other.__item__(i))}
}catch(err){
throw TypeError("object is not iterable")
}
}
list.index=function(self,elt){
for(var i=0;i<self.length;i++){
if(self[i].__eq__(elt)){return i}
}
throw ValueError(str(elt)+" is not in list")
}
list.insert=function(self,i,item){self.splice(i,0,item)}
list.remove=function(self,elt){
for(var i=0;i<self.length;i++){
if(self[i].__eq__(elt)){
self.splice(i,1)
return
}
}
throw ValueError(str(elt)+" is not in list")
}
list.pop=function(self,pos){
if(pos===undefined){
var res=self[self.length-1]
self.splice(self.length-1,1)
return res
}else if(arguments.length==2){
if(isinstance(pos,int)){
var res=self[pos]
self.splice(pos,1)
return res
}else{
throw TypeError(pos.__class__+" object cannot be interpreted as an integer")
}
}else{
throw TypeError("pop() takes at most 1 argument ("+(arguments.length-1)+' given)')
}
}
list.reverse=function(self){
for(var i=0;i<parseInt(self.length/2);i++){
var buf=self[i]
self[i]=self[self.length-i-1]
self[self.length-i-1]=buf
}
}
function $partition(arg,array,begin,end,pivot)
{
var piv=array[pivot]
array.swap(pivot, end-1)
var store=begin
for(var ix=begin;ix<end-1;++ix){
if(arg(array[ix]).__le__(arg(piv))){
array.swap(store, ix)
++store
}
}
array.swap(end-1, store)
return store
}
Array.prototype.swap=function(a, b)
{
var tmp=this[a]
this[a]=this[b]
this[b]=tmp
}
function $qsort(arg,array, begin, end)
{
if(end-1>begin){
var pivot=begin+Math.floor(Math.random()*(end-begin))
pivot=$partition(arg,array, begin, end, pivot)
$qsort(arg,array, begin, pivot)
$qsort(arg,array, pivot+1, end)
}
}
list.sort=function(self){
var func=function(x){return x}
var reverse=false
for(var i=1;i<arguments.length;i++){
var arg=arguments[i]
if(isinstance(arg,$Kw)){
if(arg.name==='key'){func=arg.value}
else if(arg.name==='reverse'){reverse=arg.value}
}
}
if(self.length==0){return}
$qsort(func,self,0,self.length)
if(reverse){list.reverse(self)}
if(!self.__brython__){return self}
}
list.toString=list.__str__
function $ListClass(items){
var x=null,i=null
this.iter=null
this.__class__=list
this.items=items 
}
for(var attr in list){
if(typeof list[attr]==='function'){list[attr].__str__=function(){return "<list method "+attr+">"}}
var func=(function(attr){
return function(){
var args=[this]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return list[attr].apply(this,args)
}
})(attr)
func.__str__=(function(attr){
return function(){return "<method-wrapper '"+attr+"' of list object>"}
})(attr)
Array.prototype[attr]=func
}
Array.prototype.__class__=list
Array.prototype.__getattr__=function(attr){
if(attr==='__class__'){return this.__class__}
if(list[attr]===undefined){
throw AttributeError("'"+this.__class__.__name__+"' object has no attribute '"+attr+"'")
}
if(this.__class__===tuple && 
['__add__','__delitem__','__setitem__',
'append','extend','insert','remove','pop','reverse','sort'].indexOf(attr)>-1){
throw AttributeError("'"+this.__class__.__name__+"' object has no attribute '"+attr+"'")
}
var obj=this
var res=function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return list[attr].apply(obj,args)
}
res.__str__=function(){return "<built-in method "+attr+" of "+obj.__class__.__name__+" object>"}
return res
}
return list
}()
str=function(){
function str(arg){
if(arg===undefined){return '<undefined>'}
else if(arg.__str__!==undefined){return arg.__str__()}
else if(arg.__getattr__('__str__')!==undefined){
return arg.__getattr__('__str__')()
}else{return arg.toString()}
}
str.__name__='str'
str.__str__=function(){return "<class 'str'>"}
str.toString=str.__str__
str.__add__=function(self,other){
if(!(typeof other==="string")){
try{return other.__radd__(self)}
catch(err){throw TypeError(
"Can't convert "+other.__class__+" to str implicitely")}
}else{
return self+other
}
}
str.__class__=$type
str.__contains__=function(self,item){
if(!(typeof item==="string")){throw TypeError(
"'in <string>' requires string as left operand, not "+item.__class__)}
var nbcar=item.length
for(var i=0;i<self.length;i++){
if(self.substr(i,nbcar)==item){return True}
}
return False
}
str.__eq__=function(self,other){
if(other===undefined){
return self===str
}
return other===self.valueOf()
}
str.__getattr__=function(attr){return this[attr]}
str.__getitem__=function(self,arg){
if(isinstance(arg,int)){
var pos=arg
if(arg<0){pos=self.length+pos}
if(pos>=0 && pos<self.length){return self.charAt(pos)}
else{throw IndexError('string index out of range')}
}else if(isinstance(arg,slice)){
var step=arg.step===None ? 1 : arg.step
if(step>0){
var start=arg.start===None ? 0 : arg.start
var stop=arg.stop===None ? self.__len__(): arg.stop
}else{
var start=arg.start===None ? self.__len__()-1 : arg.start
var stop=arg.stop===None ? 0 : arg.stop
}
if(start<0){start=self.length+start}
if(stop<0){stop=self.length+stop}
var res='',i=null
if(step>0){
if(stop<=start){return ''}
else{
for(i=start;i<stop;i+=step){
res +=self.charAt(i)
}
}
}else{
if(stop>=start){return ''}
else{
for(i=start;i>=stop;i+=step){
res +=self.charAt(i)
}
}
}
return res
}else if(isinstance(arg,bool)){
return self.__getitem__(int(arg))
}
}
str.__hash__=function(self){
var hash=1
for(var i=0;i < self.length;i++){
hash=(101*hash + self.charCodeAt(i))& 0xFFFFFFFF
}
return hash
}
str.__in__=function(self,item){return item.__contains__(self.valueOf())}
str.__item__=function(self,i){return self.charAt(i)}
str.__len__=function(self){return self.length}
str.__mod__=function(self,args){
var flags=$List2Dict('#','0','-',' ','+')
var ph=[]
function format(s){
var conv_flags='([#\\+\\- 0])*'
var conv_types='[diouxXeEfFgGcrsa%]'
var re=new RegExp('\\%(\\(.+\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*('+conv_types+'){1}')
var res=re.exec(s)
this.is_format=true
if(!res){this.is_format=false;return}
this.src=res[0]
if(res[1]){this.mapping_key=str(res[1].substr(1,res[1].length-2))}
else{this.mapping_key=null}
this.flag=res[2]
this.min_width=res[3]
this.precision=res[4]
this.length_modifier=res[5]
this.type=res[6]
this.toString=function(){
var res='type '+this.type+' key '+this.mapping_key+' min width '+this.min_width
res +=' precision '+this.precision
return res
}
this.format=function(src){
if(this.mapping_key!==null){
if(!isinstance(src,dict)){throw TypeError("format requires a mapping")}
src=src.__getitem__(this.mapping_key)
}
if(this.type=="s"){
var res=str(src)
if(this.precision){res=res.substr(0,parseInt(this.precision.substr(1)))}
return res
}else if(this.type=="r"){
var res=repr(src)
if(this.precision){res=res.substr(0,parseInt(this.precision.substr(1)))}
return res
}else if(this.type=="a"){
var res=ascii(src)
if(this.precision){res=res.substr(0,parseInt(this.precision.substr(1)))}
return res
}else if(this.type=="g" || this.type=="G"){
if(!isinstance(src,[int,float])){throw TypeError(
"%"+this.type+" format : a number is required, not "+str(src.__class__))}
var prec=-4
if(this.precision){prec=parseInt(this.precision.substr(1))}
var res=parseFloat(src).toExponential()
var elts=res.split('e')
if((this.precision && eval(elts[1])>prec)||
(!this.precision && eval(elts[1])<-4)){
this.type==='g' ? this.type='e' : this.type='E'
var prec=6
if(this.precision){prec=parseInt(this.precision.substr(1))-1}
var res=parseFloat(src).toExponential(prec)
var elts=res.split('e')
var res=elts[0]+this.type+elts[1].charAt(0)
if(elts[1].length===2){res +='0'}
return res+elts[1].substr(1)
}else{
var prec=6
if(this.precision){prec=parseInt(this.precision.substr(1))-1}
var elts=str(src).split('.')
this.precision='.'+(prec-elts[0].length)
this.type="f"
return this.format(src)
}
}else if(this.type=="e" || this.type=="E"){
if(!isinstance(src,[int,float])){throw TypeError(
"%"+this.type+" format : a number is required, not "+str(src.__class__))}
var prec=6
if(this.precision){prec=parseInt(this.precision.substr(1))}
var res=parseFloat(src).toExponential(prec)
var elts=res.split('e')
var res=elts[0]+this.type+elts[1].charAt(0)
if(elts[1].length===2){res +='0'}
return res+elts[1].substr(1)
}else if(this.type=="x" || this.type=="X"){
if(!isinstance(src,[int,float])){throw TypeError(
"%"+this.type+" format : a number is required, not "+str(src.__class__))}
var num=src
res=src.toString(16)
if(this.flag===' '){res=' '+res}
else if(this.flag==='+' && num>=0){res='+'+res}
else if(this.flag==='#'){
if(this.type==='x'){res='0x'+res}
else{res='0X'+res}
}
if(this.min_width){
var pad=' '
if(this.flag==='0'){pad="0"}
while(res.length<parseInt(this.min_width)){res=pad+res}
}
return res
}else if(this.type=="i" || this.type=="d"){
if(!isinstance(src,[int,float])){throw TypeError(
"%"+this.type+" format : a number is required, not "+str(src.__class__))}
var num=parseInt(src)
if(this.precision){num=num.toFixed(parseInt(this.precision.substr(1)))}
res=num+''
if(this.flag===' '){res=' '+res}
else if(this.flag==='+' && num>=0){res='+'+res}
if(this.min_width){
var pad=' '
if(this.flag==='0'){pad="0"}
while(res.length<parseInt(this.min_width)){res=pad+res}
}
return res
}else if(this.type=="f" || this.type=="F"){
if(!isinstance(src,[int,float])){throw TypeError(
"%"+this.type+" format : a number is required, not "+str(src.__class__))}
var num=parseFloat(src)
if(this.precision){num=num.toFixed(parseInt(this.precision.substr(1)))}
res=num+''
if(this.flag===' '){res=' '+res}
else if(this.flag==='+' && num>=0){res='+'+res}
if(this.min_width){
var pad=' '
if(this.flag==='0'){pad="0"}
while(res.length<parseInt(this.min_width)){res=pad+res}
}
return res
}
}
}
var elts=[]
var pos=0, start=0, nb_repl=0
var val=self.valueOf()
while(pos<val.length){
if(val.charAt(pos)=='%'){
var f=new format(val.substr(pos))
if(f.is_format && f.type!=="%"){
elts.push(val.substring(start,pos))
elts.push(f)
start=pos+f.src.length
pos=start
nb_repl++
}else{pos++}
}else{pos++}
}
elts.push(val.substr(start))
if(!isinstance(args,tuple)){
if(nb_repl>1){throw TypeError('not enough arguments for format string')}
else{elts[1]=elts[1].format(args)}
}else{
if(nb_repl==args.length){
for(var i=0;i<args.length;i++){
var fmt=elts[1+2*i]
elts[1+2*i]=fmt.format(args[i])
}
}else if(nb_repl<args.length){throw TypeError(
"not all arguments converted during string formatting")
}else{throw TypeError('not enough arguments for format string')}
}
var res=''
for(var i=0;i<elts.length;i++){res+=elts[i]}
res=res.replace(/%%/g,'%')
return res
}
str.__mul__=function(self,other){
if(!isinstance(other,int)){throw TypeError(
"Can't multiply sequence by non-int of type '"+str(other.__class__)+"'")}
$res=''
for(var i=0;i<other;i++){$res+=self.valueOf()}
return $res
}
str.__ne__=function(self,other){return other!==self.valueOf()}
str.__new__=function(){return ''}
str.__not_in__=function(self,item){return !str.__in__(self,item)}
str.__repr__=function(self){
if(self===undefined){return "<class 'str'>"}
var qesc=new RegExp("'","g")
return "'"+self.replace(qesc,"\\'")+"'"
}
str.__setattr__=function(self,attr,value){setattr(self,attr,value)}
self.__setitem__=function(self,attr,value){
throw TypeError("'str' object does not support item assignment")
}
str.__str__=function(self){
if(self===undefined){return "<class 'str'>"}
else{return self.toString()}
}
var $comp_func=function(self,other){
if(typeof other !=="string"){throw TypeError(
"unorderable types: 'str' > "+other.__class__+"()")}
return self > other
}
$comp_func +='' 
var $comps={'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
eval("str.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}
var $notimplemented=function(self,other){
throw TypeError(
"unsupported operand types for OPERATOR: '"+str(self.__class__)+"' and '"+str(other.__class__)+"'")
}
$notimplemented +='' 
for($op in $operators){
var $opfunc='__'+$operators[$op]+'__'
if(!($opfunc in str)){
eval('str.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
}
}
str.capitalize=function(self){
if(self.length==0){return ''}
return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()
}
str.casefold=function(self){
throw NotImplementedError("function casefold not implemented yet")
}
str.center=function(self,width,fillchar){
if(fillchar===undefined){fillchar=' '}else{fillchar=fillchar}
if(width<=self.length){return self}
else{
var pad=parseInt((width-self.length)/2)
var res=Array(pad+1).join(fillchar)
res=res + self + res
if(res.length<width){res +=fillchar}
return res
}
}
str.count=function(self,elt){
if(!(typeof elt==="string")){throw TypeError(
"Can't convert '"+str(elt.__class__)+"' object to str implicitly")}
var n=0, pos=0
while(true){
pos=self.indexOf(elt,pos)
if(pos>=0){n++;pos+=elt.length}else break
}
return n
}
str.encode=function(self){
throw NotImplementedError("function encode not implemented yet")
}
str.endswith=function(self){
var args=[]
for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
var $ns=$MakeArgs("str.endswith",args,['suffix'],
{'start':null,'end':null},null,null)
var suffixes=$ns['suffix']
if(!isinstance(suffixes,tuple)){suffixes=[suffixes]}
var start=$ns['start']|| 0
var end=$ns['end']|| self.length-1
var s=self.substr(start,end+1)
for(var i=0;i<suffixes.length;i++){
suffix=suffixes[i]
if(suffix.length<=s.length &&
s.substr(s.length-suffix.length)==suffix){return True}
}
return False
}
str.expandtabs=function(self){
throw NotImplementedError("function expandtabs not implemented yet")
}
str.find=function(self){
var $ns=$MakeArgs("str.find",arguments,['self','sub'],
{'start':0,'end':self.length},null,null)
var sub=$ns['sub'],start=$ns['start'],end=$ns['end']
if(!isinstance(sub,str)){throw TypeError(
"Can't convert '"+str(sub.__class__)+"' object to str implicitly")}
if(!isinstance(start,int)||!isinstance(end,int)){throw TypeError(
"slice indices must be integers or None or have an __index__ method")}
var s=self.substring(start,end)
var escaped=list("[.*+?|()$^")
var esc_sub=''
for(var i=0;i<sub.length;i++){
if(escaped.indexOf(sub.charAt(i))>-1){esc_sub +='\\'}
esc_sub +=sub.charAt(i)
}
var res=s.search(esc_sub)
if(res==-1){return -1}
else{return start+res}
}
str.format=function(self){
throw NotImplementedError("function format not implemented yet")
}
str.format_map=function(self){
throw NotImplementedError("function format_map not implemented yet")
}
str.index=function(self){
var res=str.find.apply(self,arguments)
if(res===-1){throw ValueError("substring not found")}
else{return res}
}
str.isalnum=function(self){
var pat=/^[a-z0-9]+$/i
return pat.test(self)
}
str.isalpha=function(self){
var pat=/^[a-z]+$/i
return pat.test(self)
}
str.isdecimal=function(self){
var pat=/^[0-9]+$/
return pat.test(self)
}
str.isdigit=function(self){
var pat=/^[0-9]+$/
return pat.test(self)
}
str.isidentifier=function(self){
var keywords=['False', 'None', 'True', 'and', 'as', 'assert', 'break',
'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield']
if(keywords.contain(self))return True
var pat=/^[a-z][0-9a-z_]+$/i
return pat.test(self)
}
str.islower=function(self){
var pat=/^[a-z]+$/
return pat.test(self)
}
str.isnumeric=function(self){
var pat=/^[0-9]+$/
return pat.test(self)
}
str.isprintable=function(self){
var re=/[^ -~]/
return !re.test(self)
}
str.isspace=function(self){
var pat=/^\s+$/i
return pat.test(self)
}
str.istitle=function(self){
var pat=/^([A-Z][a-z]+)(\s[A-Z][a-z]+)$/i
return pat.test(self)
}
str.isupper=function(self){
var pat=/^[A-Z]+$/
return pat.test(self)
}
str.join=function(self,iterable){
if(!'__item__' in iterable){throw TypeError(
"'"+str(iterable.__class__)+"' object is not iterable")}
var res='',count=0
for(var i=0;i<iterable.length;i++){
var obj2=iterable.__getitem__(i)
if(!isinstance(obj2,str)){throw TypeError(
"sequence item "+count+": expected str instance, "+obj2.__class__+"found")}
res +=obj2+self
count++
}
if(count==0){return ''}
res=res.substr(0,res.length-self.length)
return res
}
str.ljust=function(self, width, fillchar){
if(width <=self.length)return self
if(fillchar===undefined){fillchar=' '}
return self + Array(width - self.length + 1).join(fillchar)
}
str.lower=function(self){return self.toLowerCase()}
str.lstrip=function(self,x){
var pattern=null
if(x==undefined){pattern="\\s*"}
else{pattern="["+x+"]*"}
var sp=new RegExp("^"+pattern)
return self.replace(sp,"")
}
str.maketrans=function(self){
throw NotImplementedError("function maketrans not implemented yet")
}
str.partition=function(self,sep){
if(sep===undefined){
throw Error("sep argument is required")
return
}
var i=self.indexOf(sep)
if(i==-1){return $tuple([self, '', ''])}
return $tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}
function $re_escape(str)
{
var specials="[.*+?|()$^"
for(var i=0;i<specials.length;i++){
var re=new RegExp('\\'+specials.charAt(i),'g')
str=str.replace(re, "\\"+specials.charAt(i))
}
return str
}
str.replace=function(self,old,_new,count){
if(count!==undefined){
if(!isinstance(count,[int,float])){throw TypeError(
"'"+str(count.__class__)+"' object cannot be interpreted as an integer")}
var re=new RegExp($re_escape(old),'g')
var res=self.valueOf()
while(count>0){
if(self.search(re)==-1){return res}
res=res.replace(re,_new)
count--
}
return res
}else{
var re=new RegExp($re_escape(old),"g")
return self.replace(re,_new)
}
}
str.rfind=function(self){
var $ns=$MakeArgs("str.find",arguments,['self','sub'],
{'start':0,'end':self.length},null,null)
var sub=$ns['sub'],start=$ns['start'],end=$ns['end']
if(!isinstance(sub,str)){throw TypeError(
"Can't convert '"+str(sub.__class__)+"' object to str implicitly")}
if(!isinstance(start,int)||!isinstance(end,int)){throw TypeError(
"slice indices must be integers or None or have an __index__ method")}
var s=self.substring(start,end)
var reversed=''
for(var i=s.length-1;i>=0;i--){reversed +=s.charAt(i)}
var res=reversed.search(sub)
if(res==-1){return -1}
else{return start+s.length-1-res-sub.length+1}
}
str.rindex=function(){
var res=str.rfind.apply(this,arguments)
if(res==-1){throw ValueError("substring not found")}
else{return res}
}
str.rjust=function(self){
var $ns=$MakeArgs("str.rjust",arguments,['self','width'],
{'fillchar':' '},null,null)
var width=$ns['width'],fillchar=$ns['fillchar']
if(width <=self.length)return self
return Array(width - self.length + 1).join(fillchar)+ self
}
str.rpartition=function(self){
if(sep===undefined){
throw Error("sep argument is required")
return
}
var i=self.lastindexOf(sep)
if(i==-1){return $tuple(['', '', self])}
return $tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}
str.rsplit=function(self){
var args=[]
for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
var $ns=$MakeArgs("str.split",args,[],{},'args','kw')
var sep=None,maxsplit=-1
if($ns['args'].length>=1){sep=$ns['args'][0]}
if($ns['args'].length==2){maxsplit=$ns['args'][1]}
maxsplit=$ns['kw'].get('maxsplit',maxsplit)
var array=str.split(self)
if(array.length <=maxsplit){
return array
}
var s=[], j=1
for(var i=0;i < maxsplit - array.length;i++){
if(i < maxsplit - array.length){
if(i > 0){s[0]+=sep}
s[0]+=array[i]
}else{
s[j]=array[i]
j+=1
}
}
return $tuple(s)
}
str.rstrip=function(self,x){
if(x==undefined){pattern="\\s*"}
else{pattern="["+x+"]*"}
sp=new RegExp(pattern+'$')
return str(self.replace(sp,""))
}
str.split=function(self){
var args=[]
for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
var $ns=$MakeArgs("str.split",args,[],{},'args','kw')
var sep=None,maxsplit=-1
if($ns['args'].length>=1){sep=$ns['args'][0]}
if($ns['args'].length==2){maxsplit=$ns['args'][1]}
maxsplit=$ns['kw'].get('maxsplit',maxsplit)
if(sep===None){
var res=[]
var pos=0
while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
if(pos===self.length-1){return[]}
var name=''
while(true){
if(self.charAt(pos).search(/\s/)===-1){
if(name===''){name=self.charAt(pos)}
else{name+=self.charAt(pos)}
}else{
if(name!==''){
res.push(name)
if(maxsplit!==-1&&res.length===maxsplit+1){
res.pop()
res.push(name+self.substr(pos))
return res
}
name=''
}
}
pos++
if(pos>self.length-1){
if(name){res.push(name)}
break
}
}
return res
}else{
var escaped=list('*.[]()|$^')
var esc_sep=''
for(var i=0;i<sep.length;i++){
if(escaped.indexOf(sep.charAt(i))>-1){esc_sep +='\\'}
esc_sep +=sep.charAt(i)
}
var re=new RegExp(esc_sep)
if(maxsplit==-1){
var a=self.split(re,maxsplit)
}else{
var l=self.split(re,-1)
var a=l.splice(0, maxsplit)
var b=l.splice(maxsplit-1, l.length)
a.push(b.join(sep))
}
return a
}
}
str.splitlines=function(self){return str.split(self,'\n')}
str.startswith=function(self){
$ns=$MakeArgs("str.startswith",arguments,['self','prefix'],
{'start':null,'end':null},null,null)
var prefixes=$ns['prefix']
if(!isinstance(prefixes,tuple)){prefixes=[prefixes]}
var start=$ns['start']|| 0
var end=$ns['end']|| self.length-1
var s=self.substr(start,end+1)
for(var i=0;i<prefixes.length;i++){
prefix=prefixes[i]
if(prefix.length<=s.length &&
s.substr(0,prefix.length)==prefix){return True}
}
return False
}
str.strip=function(self,x){
if(x==undefined){x="\\s"}
pattern="["+x+"]"
return str.rstrip(str.lstrip(self,x),x)
}
str.swapcase=function(self){
return self.replace(/([a-z])|([A-Z])/g, function($0,$1,$2)
{return($1)? $0.toUpperCase(): $0.toLowerCase()
})
}
str.title=function(self){
return self.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase()+ txt.substr(1).toLowerCase();})
}
str.translate=function(){
$ns=$MakeArgs("str.translate",arguments,['self','table'],
{'deletechars':null},null,null)
var table=$ns['table']
var self=$ns['self']
var d=$ns['deletechars']
if(isinstance(table, str)&& table.length !==255){
throw Error("table variable must be a string of size 255")
}
if(d !==undefined){
var re=new RegExp(d)
self=self.replace(re, '')
}
if(table !==None){
for(var i=0;i<self.length;i++){
self[i]=table.charCodeAt(self.charCodeAt(i))
}
}
return self
}
str.upper=function(self){return self.toUpperCase()}
str.zfill=function(self, width){
if(width===undefined || width <=self.length){
return self
}
if(!self.isnumeric()){
return self
}
return Array(width - self.length +1).join('0')
}
String.prototype.__class__=str
String.prototype.__getattr__=function(attr){
if(attr==='__class__'){return str}
if(str[attr]===undefined){throw AttributeError("'str' object has no attribute '"+attr+"'")}
var obj=this
var res=function(){
var args=[obj]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return str[attr].apply(obj,args)
}
res.__str__=function(){return "<built-in method "+attr+" of str object>"}
return res
}
for(var attr in str){
if(String.prototype[attr]===undefined){
String.prototype[attr]=(function(attr){
return function(){
var args=[this]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
return str[attr].apply(this,args)
}
})(attr)
}
}
return str
}()

function $importer(){
if(window.XMLHttpRequest){
var $xmlhttp=new XMLHttpRequest()
}else{
var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
}
var fake_qs
if(__BRYTHON__.$options.cache===undefined ||
__BRYTHON__.$options.cache=='none'){
fake_qs="?v="+Math.random().toString(36).substr(2,8)
}else if(__BRYTHON__.$options.cache=='version'){
fake_qs="?v="+__BRYTHON__.version_info[2]
}else if(__BRYTHON__.$options.cache=='browser'){
fake_qs=""
}else{
fake_qs="?v="+Math.random().toString(36).substr(2,8)
}
var timer=setTimeout(function(){
$xmlhttp.abort()
throw ImportError("No module named '"+module+"'")}, 5000)
return[$xmlhttp,fake_qs,timer]
}
function $import_js(module,alias,names){
var filepath=__BRYTHON__.brython_path+'libs/' + module
return $import_js_generic(module,alias,names,filepath)
}
function $import_js_generic(module,alias,names,filepath){
var module_contents=$download_module(module, filepath+'.js')
return $import_js_module(module, alias, names, filepath+'.js', module_contents)
}
function $download_module(module,url){
var imp=$importer()
var $xmlhttp=imp[0],fake_qs=imp[1],timer=imp[2],res=null
$xmlhttp.onreadystatechange=function(){
if($xmlhttp.readyState==4){
window.clearTimeout(timer)
if($xmlhttp.status==200 || $xmlhttp.status==0){res=$xmlhttp.responseText}
else{
res=Error()
res.name='NotFoundError'
res.message="No module named '"+module+"'"
}
}
}
$xmlhttp.open('GET',url+fake_qs,false)
if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
$xmlhttp.send()
if(res.constructor===Error){res.name="NotFoundError";throw res}
return res
}
function $import_js_module(module,alias,names,filepath,module_contents){
eval(module_contents)
if(eval('$module')===undefined){
throw ImportError("name '$module' is not defined in module")
}
$module.__class__=$type
$module.__repr__=function(){return "<module '"+module+"' from "+filepath+" >"}
$module.__str__=function(){return "<module '"+module+"' from "+filepath+" >"}
$module.__file__=filepath
return $module
}
function $import_module_search_path(module,alias,names){
return $import_module_search_path_list(module,alias,names,__BRYTHON__.path)
}
function $import_module_search_path_list(module,alias,names,path_list){
var modnames=[module, module+'/__init__']
var import_mod=[$import_py]
for(var i=0;i<path_list.length;i++){
for(var j=0;j < modnames.length;j++){
var path=path_list[i]+ "/" + modnames[j]
for(var k=0;k < import_mod.length;k++){
try{return import_mod[k](module,alias,names,path)
}catch(err){if(err.name!=="NotFoundError"){throw err}
}
}
}
}
throw ImportError("No module named '"+module+"'")
}
function $import_py(module,alias,names,path){
var module_contents=$download_module(module, path+'.py')
return $import_py_module(module,alias,names,path+'.py',module_contents)
}
function $import_py_module(module,alias,names,path,module_contents){
__BRYTHON__.$py_module_path[module]=path
__BRYTHON__.$py_module_alias[module]=alias
var root=__BRYTHON__.py2js(module_contents,module)
var body=root.children
root.children=[]
var mod_node=new $Node('expression')
if(names!==undefined){alias='$module'}
new $NodeJSCtx(mod_node,'$module=(function()')
root.insert(0,mod_node)
mod_node.children=body
var mod_names=[]
for(var i=0;i<mod_node.children.length;i++){
var node=mod_node.children[i]
var ctx=node.get_ctx().tree[0]
if(ctx.type==='def'||ctx.type==='class'){
if(mod_names.indexOf(ctx.name)===-1){mod_names.push(ctx.name)}
}else if(ctx.type==='from'){
for(var j=0;j< ctx.names.length;j++){
if(mod_names.indexOf(ctx.names[j])===-1){mod_names.push(ctx.names[j])}
}
}else if(ctx.type==='assign'){
var left=ctx.tree[0]
if(left.type==='expr'&&left.tree[0].type==='id'&&left.tree[0].tree.length===0){
var id_name=left.tree[0].value
if(mod_names.indexOf(id_name)===-1){mod_names.push(id_name)}
}
}
}
var ret_code='return {'
for(var i=0;i<mod_names.length;i++){
ret_code +=mod_names[i]+':'+mod_names[i]+','
}
ret_code +='__getattr__:function(attr){if(this[attr]!==undefined){return this[attr]}'
ret_code +='else{throw AttributeError("module '+module+' has no attribute \''+'"+attr+"\'")}},'
ret_code +='__setattr__:function(attr,value){this[attr]=value}'
ret_code +='}'
var ret_node=new $Node('expression')
new $NodeJSCtx(ret_node,ret_code)
mod_node.add(ret_node)
var ex_node=new $Node('expression')
new $NodeJSCtx(ex_node,')()')
root.add(ex_node)
try{
var js=root.to_js()
eval(js)
$module.__class__=$type
$module.__repr__=function(){return "<module '"+module+"' from "+path+" >"}
$module.__str__=function(){return "<module '"+module+"' from "+path+" >"}
$module.__file__=path
return $module
}catch(err){
eval('throw '+err.name+'(err.message)')
}
}
$import_funcs=[$import_js, $import_module_search_path]
function $import_single(name,alias,names){
for(var j=0;j<$import_funcs.length;j++){
try{var mod=$import_funcs[j](name,alias,names)
__BRYTHON__.modules[name]=mod
__BRYTHON__.$py_module_alias[name]=alias
return mod
}catch(err){
if(err.name==="NotFoundError"){
if(j==$import_funcs.length-1){
throw ImportError("no module named '"+name+"'")
}else{
continue
}
}else{throw(err)}
}
}
}
function $import_list(modules){
var res=[]
for(var i=0;i<modules.length;i++){
var module=modules[i][0]
var mod
if(__BRYTHON__.modules[module]===undefined){
__BRYTHON__.modules[module]={}
mod=$import_single(modules[i][0],modules[i][1])
}else{
mod=__BRYTHON__.modules[module]
}
res.push(mod)
__BRYTHON__.$py_module_alias[modules[i][0]]=modules[i][1]
}
return res
}
function $import_from(module,names,parent_module,alias){
if(parent_module !==undefined){
var relpath=__BRYTHON__.$py_module_path[parent_module]
var i=relpath.lastIndexOf('/')
relpath=relpath.substring(0, i)
if(module==='undefined'){
var res=[]
for(var i=0;i < names.length;i++){
console.log(names[i])
res.push($import_module_search_path_list(names[i],alias,names[i],[relpath]))
}
return res
}
alias=__BRYTHON__.$py_module_alias[parent_module]
return $import_module_search_path_list(module,alias,names,[relpath])
}else if(alias !==undefined){
return $import_single(modules,alias,names)
}
return $import_single(modules,names,names)
}
var $operators={
"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
"**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift",
"+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
"%=":"imod","&=":"iand","|=":"ior","^=":"ixor","**=":"ipow",
"+":"add","-":"sub","*":"mul",
"/":"truediv","%":"mod","&":"and","|":"or","~":"invert",
"^":"xor","<":"lt",">":"gt",
"<=":"le",">=":"ge","==":"eq","!=":"ne",
"or":"or","and":"and", "in":"in", 
"is":"is","not_in":"not_in","is_not":"is_not" 
}
var $op_order=[['or'],['and'],
['in','not_in'],
['<','<=','>','>=','!=','==','is'],
['|','^','&'],
['+'],
['-'],
['/','//','%'],
['*'],
['**']
]
var $op_weight={}
var $weight=1
for(var $i=0;$i<$op_order.length;$i++){
for(var $j=0;$j<$op_order[$i].length;$j++){
$op_weight[$op_order[$i][$j]]=$weight
}
$weight++
}
var $augmented_assigns={
"//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
"**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
"%=":"imod","^=":"ipow"
}
function $_SyntaxError(C,msg,indent){
console.log('syntax error '+msg)
var ctx_node=C
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var module=tree_node.module
var line_num=tree_node.line_num
document.$line_info=[line_num,module]
if(indent===undefined){$SyntaxError(module,'invalid syntax',$pos)}
else{throw $IndentationError(module,msg,$pos)}
}
var $first_op_letter={}
for($op in $operators){$first_op_letter[$op.charAt(0)]=0}
function $Node(type){
this.type=type
this.children=[]
this.add=function(child){
this.children.push(child)
child.parent=this
}
this.insert=function(pos,child){
this.children.splice(pos,0,child)
child.parent=this
}
this.toString=function(){return "<object 'Node'>"}
this.show=function(indent){
var res=''
if(this.type==='module'){
for(var i=0;i<this.children.length;i++){
res +=this.children[i].show(indent)
}
}else{
indent=indent || 0
for(var i=0;i<indent;i++){res+=' '}
res +=this.C
if(this.children.length>0){res +='{'}
res +='\n'
for(var i=0;i<this.children.length;i++){
res +='['+i+'] '+this.children[i].show(indent+4)
}
if(this.children.length>0){
for(var i=0;i<indent;i++){res+=' '}
res+='}\n'
}
}
return res
}
this.to_js=function(indent){
var res=''
if(this.type==='module'){
for(var i=0;i<this.children.length;i++){
res +=this.children[i].to_js(indent)
}
}else{
indent=indent || 0
var ctx_js=this.C.to_js(indent)
if(ctx_js){
for(var i=0;i<indent;i++){res+=' '}
res +=ctx_js
if(this.children.length>0){res +='{'}
res +='\n'
for(var i=0;i<this.children.length;i++){
res +=this.children[i].to_js(indent+4)
}
if(this.children.length>0){
for(var i=0;i<indent;i++){res+=' '}
res+='}\n'
}
}
}
return res
}
this.transform=function(rank){
var res=''
if(this.type==='module'){
var i=0
while(i<this.children.length){
var node=this.children[i]
this.children[i].transform(i)
i++
}
}else{
var elt=this.C.tree[0]
if(elt.transform !==undefined){
elt.transform(this,rank)
}
var i=0
while(i<this.children.length){
this.children[i].transform(i)
i++
}
}
}
this.get_ctx=function(){return this.C}
}
var $loop_id=0
function $AbstractExprCtx(C,with_commas){
this.type='abstract_expr'
this.with_commas=with_commas
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(abstract_expr '+with_commas+') '+this.tree}
this.to_js=function(){
if(this.type==='list'){return '['+$to_js(this.tree)+']'}
else{return $to_js(this.tree)}
}
}
function $AssertCtx(C){
this.type='assert'
this.toString=function(){return '(assert) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.transform=function(node,rank){
var new_ctx=new $ConditionCtx(node.C,'if')
var not_ctx=new $NotCtx(new_ctx)
not_ctx.tree=[this.tree[0]]
node.C=new_ctx
var new_node=new $Node('expression')
var js='throw AssertionError("")'
if(this.tree.length==2){
js='throw AssertionError(str('+this.tree[1].to_js()+'))'
}
new $NodeJSCtx(new_node,js)
node.add(new_node)
}
}
function $AssignCtx(C){
this.type='assign'
C.parent.tree.pop()
C.parent.tree.push(this)
this.parent=C.parent
this.tree=[C]
this.toString=function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}
this.transform=function(node,rank){
var left=this.tree[0]
while(left.type==='assign'){
var new_node=new $Node('expression')
var node_ctx=new $NodeCtx(new_node)
node_ctx.tree=[left]
node.parent.insert(rank+1,new_node)
this.tree[0]=left.tree[1]
left=this.tree[0]
}
var left_items=null
if(left.type==='expr' && left.tree.length>1){
var left_items=left.tree
}else if(left.type==='expr' && 
(left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list')){
var left_items=left.tree[0].tree
}else if(left.type==='target_list'){
var left_items=left.tree
}else if(left.type==='list_or_tuple'){
var left_items=left.tree
}
if(left_items===null){return}
var right=this.tree[1]
var right_items=null
if(right.type==='list'||right.type==='tuple'||
(right.type==='expr' && right.tree.length>1)){
var right_items=right.tree
}
if(right_items!==null){
if(right_items.length>left_items.length){
throw Error('ValueError : too many values to unpack (expected '+left_items.length+')')
}else if(right_items.length<left_items.length){
throw Error('ValueError : need more than '+right_items.length+' to unpack')
}
var new_nodes=[]
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,'void(0)')
new_nodes.push(new_node)
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,'var $temp'+$loop_num+'=[]')
new_nodes.push(new_node)
for(var i=0;i<right_items.length;i++){
var js='$temp'+$loop_num+'.push('+right_items[i].to_js()+')'
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
}
for(var i=0;i<left_items.length;i++){
var new_node=new $Node('expression')
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i])
assign.tree[1]=new $JSCode('$temp'+$loop_num+'['+i+']')
new_nodes.push(new_node)
}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){
node.parent.insert(rank,new_nodes[i])
}
$loop_num++
}else{
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,'$right='+right.to_js())
var new_nodes=[new_node]
for(var i=0;i<left_items.length;i++){
var new_node=new $Node('expression')
var C=new $NodeCtx(new_node)
left_items[i].parent=C
var assign=new $AssignCtx(left_items[i])
assign.tree[1]=new $JSCode('$right.__item__('+i+')')
new_nodes.push(new_node)
}
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){
node.parent.insert(rank,new_nodes[i])
}
}
}
this.to_js=function(){
if(this.parent.type==='call'){
return '$Kw('+this.tree[0].to_js()+','+this.tree[1].to_js()+')'
}else{
var left=this.tree[0]
if(left.type==='expr'){
left=left.tree[0]
}
var right=this.tree[1]
if(left.type==='attribute'){
left.func='setattr'
var res=left.to_js()
left.func='getattr'
res=res.substr(0,res.length-1)
res +=','+right.to_js()+')'
return res
}else if(left.type==='sub'){
left.func='setitem' 
var res=left.to_js()
res=res.substr(0,res.length-1)
left.func='getitem' 
res +=','+right.to_js()+')'
return res
}
var scope=$get_scope(this)
if(scope===null){
return left.to_js()+'='+right.to_js()
}else if(scope.ntype==='def'){
if(scope.globals && scope.globals.indexOf(left.value)>-1){
return left.to_js()+'='+right.to_js()
}else{
var scope_id=scope.C.tree[0].id
var locals=__BRYTHON__.scope[scope_id].locals
if(locals.indexOf(left.to_js())===-1){
locals.push(left.to_js())
}
var res='var '+left.to_js()+'='
res +='$locals["'+left.to_js()+'"]='+right.to_js()
return res
}
}else if(scope.ntype==='class'){
var attr=left.to_js()
return 'var '+attr+' = $class.'+attr+'='+right.to_js()
}
}
}
}
function $AttrCtx(C){
this.type='attribute'
this.value=C.tree[0]
this.parent=C
C.tree.pop()
C.tree.push(this)
this.tree=[]
this.func='getattr' 
this.toString=function(){return '(attr) '+this.value+'.'+this.name}
this.to_js=function(){
var name=this.name
if(name.substr(0,2)==='$$'){name=name.substr(2)}
if(name!=='__getattr__'){name='__'+this.func+'__("'+name+'")'}
return this.value.to_js()+'.'+name
}
}
function $BodyCtx(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var body_node=new $Node('expression')
tree_node.insert(0,body_node)
return new $NodeCtx(body_node)
}
function $CallArgCtx(C){
this.type='call_arg'
this.toString=function(){return 'call_arg '+this.tree}
this.parent=C
this.start=$pos
this.tree=[]
C.tree.push(this)
this.expect='id'
this.to_js=function(){return $to_js(this.tree)}
}
function $CallCtx(C){
this.type='call'
this.func=C.tree[0]
if(this.func!==undefined){
this.func.parent=this
}
this.parent=C
C.tree.pop()
C.tree.push(this)
this.tree=[]
this.start=$pos
this.toString=function(){return '(call) '+this.func+'('+this.tree+')'}
this.to_js=function(){
if(this.func!==undefined && 
['eval','exec'].indexOf(this.func.value)>-1){
var ctx_node=this
while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
var module=ctx_node.node.module
arg=this.tree[0].to_js()
return 'eval(__BRYTHON__.py2js('+arg+',"'+module+',exec").to_js())'
}
else if(this.func!==undefined && this.func.value==='locals'){
var scope=$get_scope(this)
if(scope !==null && scope.ntype==='def'){
return 'locals("'+scope.C.tree[0].id+'")'
}
}
if(this.tree.length>0){
return this.func.to_js()+'.__call__('+$to_js(this.tree)+')'
}else{return this.func.to_js()+'.__call__()'}
}
}
function $ClassCtx(C){
this.type='class'
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.toString=function(){return '(class) '+this.name+' '+this.tree}
this.transform=function(node,rank){
var instance_decl=new $Node('expression')
new $NodeJSCtx(instance_decl,'var $class = new Object()')
node.insert(0,instance_decl)
var ret_obj=new $Node('expression')
new $NodeJSCtx(ret_obj,'return $class')
node.insert(node.children.length,ret_obj)
var run_func=new $Node('expression')
new $NodeJSCtx(run_func,')()')
node.parent.insert(rank+1,run_func)
var scope=$get_scope(this)
if(scope===null||scope.ntype!=='class'){
js='var '+this.name
}else{
js='var '+this.name+' = $class.'+this.name
}
js +='=$class_constructor("'+this.name+'",$'+this.name
if(this.tree.length>0 && this.tree[0].tree.length>0){
js +=','+$to_js(this.tree[0].tree)
}
js +=')'
var cl_cons=new $Node('expression')
new $NodeJSCtx(cl_cons,js)
node.parent.insert(rank+2,cl_cons)
if(scope===null && this.parent.node.module==='__main__'){
js='window.'+this.name+'='+this.name
var w_decl=new $Node('expression')
new $NodeJSCtx(w_decl,js)
node.parent.insert(rank+3,w_decl)
}
}
this.to_js=function(){
return 'var $'+this.name+'=(function()'
}
}
function $CompIfCtx(C){
this.type='comp_if'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comp if) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}
}
function $ComprehensionCtx(C){
this.type='comprehension'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comprehension) '+this.tree}
this.to_js=function(){
var intervals=[]
for(var i=0;i<this.tree.length;i++){
intervals.push(this.tree[i].start)
}
return intervals
}
}
function $CompForCtx(C){
this.type='comp_for'
C.parent.intervals.push($pos)
this.parent=C
this.tree=[]
this.expect='in'
C.tree.push(this)
this.toString=function(){return '(comp for) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}
}
function $CompIterableCtx(C){
this.type='comp_iterable'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(comp iter) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}
}
function $ConditionCtx(C,token){
this.type='condition'
this.token=token
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return this.token+' '+this.tree}
this.to_js=function(){
var tok=this.token
if(tok==='elif'){tok='else if'}
if(this.tree.length==1){
var res=tok+'(bool('+$to_js(this.tree)+'))'
}else{
var res=tok+'(bool('+this.tree[0].to_js()+'))'
if(this.tree[1].tree.length>0){
res +='{'+this.tree[1].to_js()+'}'
}
}
return res
}
}
function $DecoratorCtx(C){
this.type='decorator'
this.parent=C
C.tree.push(this)
this.tree=[]
this.toString=function(){return '(decorator) '+this.tree}
this.transform=function(node,rank){
var func_rank=rank+1,children=node.parent.children
var decorators=[this.tree]
while(true){
if(func_rank>=children.length){$_SyntaxError(C)}
else if(children[func_rank].C.tree[0].type==='decorator'){
decorators.push(children[func_rank].C.tree[0].tree)
children.splice(func_rank,1)
}else{break}
}
var obj=children[func_rank].C.tree[0]
var callable=children[func_rank].C
var res=obj.name+'=',tail=''
var scope=$get_scope(this)
if(scope !==null && scope.ntype==='class'){
res +='$class.'+obj.name+'='
}
for(var i=0;i<decorators.length;i++){
res +=$to_js(decorators[i])+'('
tail +=')'
}
res +=obj.name+tail
var decor_node=new $Node('expression')
new $NodeJSCtx(decor_node,res)
node.parent.children.splice(func_rank+1,0,decor_node)
}
this.to_js=function(){return ''}
}
function $DefCtx(C){
this.type='def'
this.name=null
this.parent=C
this.tree=[]
this.id=Math.random().toString(36).substr(2,8)
__BRYTHON__.scope[this.id]=this
this.locals=[]
C.tree.push(this)
this.toString=function(){return 'def '+this.name+'('+this.tree+')'}
this.transform=function(node,rank){
if(this.transformed!==undefined){return}
this.rank=rank 
var scope=$get_scope(this)
var required=''
var defaults=''
var other_args=null
var other_kw=null
var env=[]
for(var i=0;i<this.tree[0].tree.length;i++){
var arg=this.tree[0].tree[i]
if(arg.type==='func_arg_id'){
if(arg.tree.length===0){required+='"'+arg.name+'",'}
else{
defaults+='"'+arg.name+'":'+$to_js(arg.tree)+','
if(arg.tree[0].type==='expr' 
&& arg.tree[0].tree[0].type==='id'){
env.push(arg.tree[0].tree[0].value)
}
}
}else if(arg.type==='func_star_arg'&&arg.op==='*'){other_args='"'+arg.name+'"'}
else if(arg.type==='func_star_arg'&&arg.op==='**'){other_kw='"'+arg.name+'"'}
}
this.env=env
if(required.length>0){required=required.substr(0,required.length-1)}
if(defaults.length>0){defaults=defaults.substr(0,defaults.length-1)}
var js='var $ns=$MakeArgs("'+this.name+'",arguments,['+required+'],'
js +='{'+defaults+'},'+other_args+','+other_kw+')'
var new_node1=new $Node('expression')
new $NodeJSCtx(new_node1,js)
var js='for($var in $ns){eval("var "+$var+"=$ns[$var]")}'
var new_node2=new $Node('expression')
new $NodeJSCtx(new_node2,js)
var js='var $locals = __BRYTHON__.scope["'+this.id+'"].__dict__=$ns'
var new_node3=new $Node('expression')
new $NodeJSCtx(new_node3,js)
node.children.splice(0,0,new_node1,new_node2,new_node3)
var def_func_node=new $Node('expression')
new $NodeJSCtx(def_func_node,'return function()')
var try_node=new $Node('expression')
new $NodeJSCtx(try_node,'try')
for(var i=0;i<node.children.length;i++){
try_node.add(node.children[i])
}
def_func_node.add(try_node)
var ret_node=new $Node('expression')
var catch_node=new $Node('expression')
var js='catch(err'+$loop_num+')'
js +='{if(err'+$loop_num+'.py_error!==undefined){$report(err'+$loop_num+')}'
js +='else{throw RuntimeError(err'+$loop_num+'.message)}}'
new $NodeJSCtx(catch_node,js)
node.children=[]
def_func_node.add(catch_node)
node.add(def_func_node)
var txt=')('
for(var i=0;i<this.env.length;i++){
txt +=this.env[i]
if(i<this.env.length-1){txt +=','}
}
new $NodeJSCtx(ret_node,txt+')')
node.parent.insert(rank+1,ret_node)
var offset=2
js=this.name+'.__name__'
if(scope !==null && scope.ntype==='class'){
js +='=$class.'+this.name+'.__name__'
}
js +='="'+this.name+'"'
if(scope !==null && scope.ntype==='def'){
js +=';$locals["'+this.name+'"]='+this.name
}
var name_decl=new $Node('expression')
new $NodeJSCtx(name_decl,js)
node.parent.children.splice(rank+offset,0,name_decl)
offset++
if(scope===null && node.module==='__main__'){
js='window.'+this.name+'='+this.name
new_node1=new $Node('expression')
new $NodeJSCtx(new_node1,js)
node.parent.children.splice(rank+offset,0,new_node1)
}
this.transformed=true
}
this.add_generator_declaration=function(){
var scope=$get_scope(this)
var node=this.parent.node
if(this.type==='generator'){
var offset=2
if(this.decorators !==undefined){offset++}
js=this.name
js='$generator($'+this.name+')'
var gen_node=new $Node('expression')
var ctx=new $NodeCtx(gen_node)
var expr=new $ExprCtx(ctx,'id',false)
var name_ctx=new $IdCtx(expr,this.name)
var assign=new $AssignCtx(expr)
var expr1=new $ExprCtx(assign,'id',false)
var js_ctx=new $NodeJSCtx(assign,js)
expr1.tree.push(js_ctx)
node.parent.insert(this.rank+offset,gen_node)
if(scope !==null && scope.ntype==='class'){
var cl_node=new $Node('expression')
new $NodeJSCtx(cl_node,"$class."+this.name+'='+this.name)
node.parent.insert(this.rank+offset+1,cl_node)
}
}
}
this.to_js=function(){
var scope=$get_scope(this)
var name=this.name
if(this.type==='generator'){name='$'+name}
if(scope===null || scope.ntype!=='class'){
res=name+'= (function ('
}else{
res='var '+name+' = $class.'+name+'= (function ('
}
for(var i=0;i<this.env.length;i++){
res+=this.env[i]
if(i<this.env.length-1){res+=','}
}
res +=')'
return res
}
}
function $DelCtx(C){
this.type='del'
this.parent=C
C.tree.push(this)
this.tree=[]
this.toString=function(){return 'del '+this.tree}
this.to_js=function(){
res=[]
var tree=this.tree[0].tree
for(var i=0;i<tree.length;i++){
var expr=tree[i]
if(expr.type==='expr'||expr.type==='id'){
res.push('delete '+expr.to_js())
}else if(expr.type==='sub'){
expr.func='delitem'
res.push(expr.to_js())
expr.func='getitem'
}else{
throw SyntaxError("wrong argument for del "+expr.type)
}
}
return res.join(';')
}
}
function $DictCtx(C){
this.type='dict'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
C.name='dict_key'
this.tree=[C]
this.expect=','
this.toString=function(){return 'dict '+this.tree}
}
function $DictOrSetCtx(C){
this.type='dict_or_set'
this.real='dict_or_set'
this.expect='id'
this.closed=false
this.start=$pos
this.toString=function(){
if(this.real==='dict'){return '(dict) {'+this.tree+'}'}
else if(this.real==='set'){return '(set) {'+this.tree+'}'}
else{return '(dict_or_set) {'+this.tree+'}'}
}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){
if(this.real==='dict'){
var res='dict(['
for(var i=0;i<this.items.length;i+=2){
res+='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'
if(i<this.items.length-2){res+=','}
}
return res+'])'+$to_js(this.tree)
}else if(this.real==='set_comp'){return 'set('+$to_js(this.items)+')'+$to_js(this.tree)}
else if(this.real==='dict_comp'){
var key_items=this.items[0].expression[0].to_js()
var value_items=this.items[0].expression[1].to_js()
return 'dict('+$to_js(this.items)+')'+$to_js(this.tree)
}else{return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)}
}
}
function $DoubleStarArgCtx(C){
this.type='double_star_arg'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '**'+this.tree}
this.to_js=function(){return '$pdict('+$to_js(this.tree)+')'}
}
function $ExceptCtx(C){
this.type='except'
this.parent=C
C.tree.push(this)
this.tree=[]
this.expect='id'
this.toString=function(){return '(except) '}
this.to_js=function(){
if(this.tree.length===0){return 'else'}
else if(this.tree.length===1 && this.tree[0].name==='Exception'){
return 'else if(true)'
}else{
var res='else if(['
for(var i=0;i<this.tree.length;i++){
res+='"'+this.tree[i].name+'"'
if(i<this.tree.length-1){res+=','}
}
res +='].indexOf('+this.error_name+'.__name__)>-1)'
return res
}
}
}
function $ExprCtx(C,name,with_commas){
this.type='expr'
this.name=name
this.with_commas=with_commas
this.expect=',' 
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(expr '+with_commas+') '+this.tree}
this.to_js=function(){
if(this.type==='list'){return '['+$to_js(this.tree)+']'}
else if(this.tree.length===1){return this.tree[0].to_js()}
else{return 'tuple('+$to_js(this.tree)+')'}
}
}
function $ExprNot(C){
this.type='expr_not'
this.toString=function(){return '(expr_not)'}
this.parent=C
this.tree=[]
C.tree.push(this)
}
function $FloatCtx(C,value){
this.type='float'
this.value=value
this.toString=function(){return 'float '+this.value}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'float('+this.value+')'}
}
function $ForTarget(C){
this.type='for_target'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return 'for_target'+' '+this.tree}
this.to_js=function(){return $to_js(this.tree)}
}
function $ForExpr(C){
this.type='for'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(for) '+this.tree}
this.transform=function(node,rank){
var new_nodes=[]
var new_node=new $Node('expression')
var target=this.tree[0]
var iterable=this.tree[1]
new $NodeJSCtx(new_node,'var $iter'+$loop_num+'='+iterable.to_js())
new_nodes.push(new_node)
new_node=new $Node('expression')
var js='for(var $i'+$loop_num+'=0;$i'+$loop_num
js +='<$iter'+$loop_num+'.__len__();$i'+$loop_num+'++)'
new $NodeJSCtx(new_node,js)
new_nodes.push(new_node)
var children=node.children
node.parent.children.splice(rank,1)
for(var i=new_nodes.length-1;i>=0;i--){
node.parent.insert(rank,new_nodes[i])
}
var new_node=new $Node('expression')
node.insert(0,new_node)
var C=new $NodeCtx(new_node)
var target_expr=new $ExprCtx(C,'left',true)
target_expr.tree=target.tree
var assign=new $AssignCtx(target_expr)
assign.tree[1]=new $JSCode('$iter'+$loop_num+'.__item__($i'+$loop_num+')')
node.parent.children[rank+1].children=children
$loop_num++
}
this.to_js=function(){
var iterable=this.tree.pop()
return 'for '+$to_js(this.tree)+' in '+iterable.to_js()
}
}
function $FromCtx(C){
this.type='from'
this.parent=C
this.names=[]
this.aliases={}
C.tree.push(this)
this.expect='module'
this.toString=function(){return '(from) '+this.module+' (import) '+this.names + '(parent module)' + this.parent_module + '(as)' + this.aliases}
this.to_js=function(){
var res;
if(this.parent_module!==undefined){
res="$mod=$import_from('" + this.module
res+="', ['" + this.names.join("','")+ "']"
res+=",'" + this.parent_module +"');"
for(var i=0;i<this.names.length;i++){
res +=this.parent_module+'.__setattr__("'+(this.aliases[this.names[i]]||this.names[i])+'",$mod.__getattr__("'+this.names[i]+'"));'
}
}else{
res='$mod=$import_list([["'+this.module+'","'+this.module+'"]])[0];'
if(this.names[0]!=='*'){
for(var i=0;i<this.names.length;i++){
res +=(this.aliases[this.names[i]]||this.names[i])+'=$mod.__getattr__("'+this.names[i]+'");'
}
}else{
res +='for(var $attr in $mod){'
res +="if($attr.substr(0,1)!=='_'){eval('var '+$attr+'=$mod["+'"'+"'+$attr+'"+'"'+"]')}}"
}
}
return res
}
}
function $FuncArgs(C){
this.type='func_args'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return 'func args '+this.tree}
this.expect='id'
this.has_default=false
this.has_star_arg=false
this.has_kw_arg=false
this.to_js=function(){return $to_js(this.tree)}
}
function $FuncArgIdCtx(C,name){
this.type='func_arg_id'
this.name=name
this.parent=C
this.tree=[]
C.tree.push(this)
var ctx=C
while(ctx.parent!==undefined){
if(ctx.type==='def'){
ctx.locals.push(name)
break
}
ctx=ctx.parent
}
this.toString=function(){return 'func arg id '+this.name +'='+this.tree}
this.expect='='
this.to_js=function(){return this.name+$to_js(this.tree)}
}
function $FuncStarArgCtx(C,op){
this.type='func_star_arg'
this.op=op
this.parent=C
C.tree.push(this)
this.toString=function(){return '(func star arg '+this.op+') '+this.name}
}
function $GlobalCtx(C){
this.type='global'
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.toString=function(){return 'global '+this.tree}
this.transform=function(node,rank){
var scope=$get_scope(this)
if(scope.globals===undefined){scope.globals=[]}
for(var i=0;i<this.tree.length;i++){
scope.globals.push(this.tree[i].value)
}
}
this.to_js=function(){return ''}
}
function $IdCtx(C,value,minus){
this.type='id'
this.toString=function(){return '(id) '+this.value+':'+(this.tree||'')}
this.value=value
this.minus=minus
this.parent=C
this.tree=[]
C.tree.push(this)
if(C.parent.type==='call_arg'){
this.call_arg=true
}
var ctx=C
while(ctx.parent!==undefined){
if(['list_or_tuple','dict_or_set','call_arg','def','lambda'].indexOf(ctx.type)>-1){
if(ctx.vars===undefined){ctx.vars=[value]}
else if(ctx.vars.indexOf(value)===-1){ctx.vars.push(value)}
if(this.call_arg&&ctx.type==='lambda'){
if(ctx.locals===undefined){ctx.locals=[value]}
else{ctx.locals.push(value)}
}
}
ctx=ctx.parent
}
this.to_js=function(){
var val=this.value
if(['print','alert','eval','open'].indexOf(this.value)>-1){val='$'+val}
if(['locals','globals'].indexOf(this.value)>-1){
if(this.parent.type==='call'){
var scope=$get_scope(this)
if(scope===null){new $StringCtx(this.parent,'"__main__"')}
else{
var locals=scope.C.tree[0].locals
var res='{'
for(var i=0;i<locals.length;i++){
res+="'"+locals[i]+"':"+locals[i]
if(i<locals.length-1){res+=','}
}
new $StringCtx(this.parent,res+'}')
}
}
}
return val+$to_js(this.tree,'')
}
}
function $ImportCtx(C){
this.type='import'
this.toString=function(){return 'import '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.expect='id'
this.to_js=function(){
var scope=$get_scope(this)
var res='$mods=$import_list(['+$to_js(this.tree)+']);'
for(var i=0;i<this.tree.length;i++){
if(scope!==null &&['def','class'].indexOf(scope.ntype)>-1){
res +='var '
}
res +=this.tree[i].alias
if(scope!==null && scope.ntype=='def'){
res +='=$locals["'+this.tree[i].alias+'"]'
}
res +='=$mods['+i+'];'
}
return res 
}
}
function $ImportedModuleCtx(C,name){
this.toString=function(){return ' (imported module) '+this.name}
this.parent=C
this.name=name
this.alias=name
C.tree.push(this)
this.to_js=function(){
return '["'+this.name+'","'+this.alias+'"]'
}
}
function $IntCtx(C,value){
this.type='int'
this.value=value
this.toString=function(){return 'int '+this.value}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'Number('+this.value+')'}
}
function $JSCode(js){
this.js=js
this.toString=function(){return this.js}
this.to_js=function(){return this.js}
}
function $KwArgCtx(C){
this.type='kwarg'
this.toString=function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}
this.parent=C.parent
this.tree=[C.tree[0]]
C.parent.tree.pop()
C.parent.tree.push(this)
this.to_js=function(){
var key=this.tree[0].to_js()
if(key.substr(0,2)=='$$'){key=key.substr(2)}
var res='$Kw("'+key+'",'
res +=$to_js(this.tree.slice(1,this.tree.length))+')'
return res
}
}
function $LambdaCtx(C){
this.type='lambda'
this.toString=function(){return '(lambda) '+this.args_start+' '+this.body_start}
this.parent=C
C.tree.push(this)
this.tree=[]
this.args_start=$pos+6
this.vars=[]
this.locals=[]
this.to_js=function(){
var env=[]
for(var i=0;i<this.vars.length;i++){
if(this.locals.indexOf(this.vars[i])===-1){
env.push(this.vars[i])
}
}
env_str='{'
for(var i=0;i<env.length;i++){
env_str+="'"+env[i]+"':"+env[i]
if(i<env.length-1){env_str+=','}
}
env_str +='}'
var ctx_node=this
while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
var module=ctx_node.node.module
var src=document.$py_src[module]
var qesc=new RegExp('"',"g")
var args=src.substring(this.args_start,this.body_start).replace(qesc,'\\"')
var body=src.substring(this.body_start+1,this.body_end).replace(qesc,'\\"')
return '$lambda('+env_str+',"'+args+'","'+body+'")'
}
}
function $ListOrTupleCtx(C,real){
this.type='list_or_tuple'
this.start=$pos
this.real=real
this.expect='id'
this.closed=false
this.toString=function(){
if(this.real==='list'){return '(list) ['+this.tree+']'}
else if(this.real==='list_comp'||this.real==='gen_expr'){
return '('+this.real+') ['+this.intervals+'-'+this.tree+']'
}else{return '(tuple) ('+this.tree+')'}
}
this.parent=C
this.tree=[]
C.tree.push(this)
this.is_comp=function(){
return['list_comp','gen_expr','dict_or_set_comp'].indexOf(this.real)>-1
}
this.get_src=function(){
var ctx_node=this
while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
var module=ctx_node.node.module
return document.$py_src[module]
}
this.to_js=function(){
if(this.real==='list'){return 'list(['+$to_js(this.tree)+'])'}
else if(['list_comp','gen_expr','dict_or_set_comp'].indexOf(this.real)>-1){
var src=this.get_src()
var res='{'
for(var i=0;i<this.vars.length;i++){
if(this.locals.indexOf(this.vars[i])===-1){
res +="'"+this.vars[i]+"':"+this.vars[i]
if(i<this.vars.length-1){res+=','}
}
}
res +='},'
var qesc=new RegExp('"',"g")
for(var i=1;i<this.intervals.length;i++){
var txt=src.substring(this.intervals[i-1],this.intervals[i])
txt=txt.replace(/\n/g,' ')
txt=txt.replace(/\\/g,'\\\\')
txt=txt.replace(qesc,'\\"')
res +='"'+txt+'"'
if(i<this.intervals.length-1){res+=','}
}
if(this.real==='list_comp'){return '$list_comp('+res+')'}
else if(this.real==='dict_or_set_comp'){
if(this.expression.length===1){return '$gen_expr('+res+')'}
else{return '$dict_comp('+res+')'}
}else{return '$gen_expr('+res+')'}
}else if(this.real==='tuple'){
if(this.tree.length===1 && this.has_comma===undefined){return this.tree[0].to_js()}
else{return 'tuple(['+$to_js(this.tree)+'])'}
}
}
}
function $NodeCtx(node){
this.node=node
node.C=this
this.tree=[]
this.type='node'
this.toString=function(){return 'node '+this.tree}
this.to_js=function(){
if(this.tree.length>1){
var new_node=new $Node('expression')
var ctx=new $NodeCtx(new_node)
ctx.tree=[this.tree[1]]
new_node.indent=node.indent+4
this.tree.pop()
node.add(new_node)
}
return $to_js(this.tree)
}
}
function $NodeJSCtx(node,js){
this.node=node
node.C=this
this.type='node_js'
this.tree=[js]
this.toString=function(){return 'js '+js}
this.to_js=function(){return js}
}
function $NotCtx(C){
this.type='not'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return 'not ('+this.tree+')'}
this.to_js=function(){return '!bool('+$to_js(this.tree)+')'}
}
function $OpCtx(C,op){
this.type='op'
this.op=op
this.toString=function(){return '(op '+this.op+')'+this.tree}
this.parent=C.parent
this.tree=[C]
C.parent.tree.pop()
C.parent.tree.push(this)
this.to_js=function(){
if(this.op==='and'){
var res='$test_expr($test_item('+this.tree[0].to_js()+')&&'
res +='$test_item('+this.tree[1].to_js()+'))'
return res
}else if(this.op==='or'){
var res='$test_expr($test_item('+this.tree[0].to_js()+')||'
res +='$test_item('+this.tree[1].to_js()+'))'
return res
}else{
var res=this.tree[0].to_js()
if(this.op==="is"){
res +='==='+this.tree[1].to_js()
}else if(this.op==="is_not"){
res +='!=='+this.tree[1].to_js()
}else{
res +='.__'+$operators[this.op]+'__('+this.tree[1].to_js()+')'
}
return res
}
}
}
function $PassCtx(C){
this.type='pass'
this.toString=function(){return '(pass)'}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'void(0)'}
}
function $RaiseCtx(C){
this.type='raise'
this.toString=function(){return ' (raise) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){
if(this.tree.length===0){return '$raise()'}
var exc=this.tree[0]
if(exc.type==='id'){return 'throw '+exc.value+'("")'}
else{return 'throw '+$to_js(this.tree)}
}
}
function $ReturnCtx(C){
this.type='return'
this.toString=function(){return 'return '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return 'return '+$to_js(this.tree)}
}
function $SingleKwCtx(C,token){
this.type='single_kw'
this.token=token
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return this.token}
this.to_js=function(){return this.token}
}
function $StarArgCtx(C){
this.type='star_arg'
this.parent=C
this.tree=[]
C.tree.push(this)
this.toString=function(){return '(star arg) '+this.tree}
this.to_js=function(){
return '$ptuple('+$to_js(this.tree)+')'
}
}
function $StringCtx(C,value){
this.type='str'
this.value=value
this.toString=function(){return 'string '+this.value+' '+(this.tree||'')}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){
return this.value.replace(/\n/g,' \\\n')+$to_js(this.tree,'')
}
}
function $SubCtx(C){
this.type='sub'
this.func='getitem' 
this.toString=function(){return '(sub) '+this.tree}
this.value=C.tree[0]
C.tree.pop()
C.tree.push(this)
this.parent=C
this.tree=[]
this.to_js=function(){
var res=this.value.to_js()+'.__getattr__("__'+this.func+'__")('
if(this.tree.length===1){
return res+this.tree[0].to_js()+')'
}else{
res +='slice('
for(var i=0;i<this.tree.length;i++){
if(this.tree[i].type==='abstract_expr'){res+='null'}
else{res+=this.tree[i].to_js()}
if(i<this.tree.length-1){res+=','}
}
return res+'))'
}
}
}
function $TargetCtx(C,name){
this.toString=function(){return ' (target) '+this.name}
this.parent=C
this.name=name
this.alias=null
C.tree.push(this)
this.to_js=function(){
return '["'+this.name+'","'+this.alias+'"]'
}
}
function $TargetListCtx(C){
this.type='target_list'
this.parent=C
this.tree=[]
this.expect='id'
C.tree.push(this)
this.toString=function(){return '(target list) '+this.tree}
this.to_js=function(){return $to_js(this.tree)}
}
function $TernaryCtx(C){
this.type='ternary'
this.parent=C.parent
C.parent.tree.pop()
C.parent.tree.push(this)
C.parent=this
this.tree=[C]
this.toString=function(){return '(ternary) '+this.tree}
this.to_js=function(){
var env='{'
var ids=$get_ids(this)
for(var i=0;i<ids.length;i++){
env +='"'+ids[i]+'":'+ids[i]
if(i<ids.length-1){env+=','}
}
env+='}'
var qesc=new RegExp('"',"g")
var args='"'+this.tree[1].to_js().replace(qesc,'\\"')+'","' 
args +=this.tree[0].to_js().replace(qesc,'\\"')+'","' 
args +=this.tree[2].to_js().replace(qesc,'\\"')
return '$ternary('+env+','+args+'")'
}
}
function $TryCtx(C){
this.type='try'
this.parent=C
C.tree.push(this)
this.toString=function(){return '(try) '}
this.transform=function(node,rank){
if(node.parent.children.length===rank+1){
$_SyntaxError(C,"missing clause after 'try' 1")
}else{
var next_ctx=node.parent.children[rank+1].C.tree[0]
if(['except','finally','single_kw'].indexOf(next_ctx.type)===-1){
$_SyntaxError(C,"missing clause after 'try' 2")
}
}
new $NodeJSCtx(node,'try')
var catch_node=new $Node('expression')
new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
node.parent.insert(rank+1,catch_node)
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,'if(false){void(0)}')
catch_node.insert(0,new_node)
var pos=rank+2
var has_default=false 
var has_else=false 
while(true){
if(pos===node.parent.children.length){break}
var ctx=node.parent.children[pos].C.tree[0]
if(ctx.type==='except'){
if(has_else){$_SyntaxError(C,"'except' or 'finally' after 'else'")}
ctx.error_name='$err'+$loop_num
if(ctx.tree.length>0 && ctx.tree[0].alias!==null){
var new_node=new $Node('expression')
var js='var '+ctx.tree[0].alias+'=__BRYTHON__.exception($err'+$loop_num+')'
new $NodeJSCtx(new_node,js)
node.parent.children[pos].insert(0,new_node)
}
catch_node.insert(catch_node.children.length,
node.parent.children[pos])
if(ctx.tree.length===0){
if(has_default){$_SyntaxError(C,'more than one except: line')}
has_default=true
}
node.parent.children.splice(pos,1)
}else if(ctx.type==='single_kw' && ctx.token==='finally'){
if(has_else){$_SyntaxError(C,"'finally' after 'else'")}
pos++
}else if(ctx.type==='single_kw' && ctx.token==='else'){
if(has_else){$_SyntaxError(C,"more than one 'else'")}
has_else=true
var else_children=node.parent.children[pos].children
for(var i=0;i<else_children.length;i++){
node.add(else_children[i])
}
node.parent.children.splice(pos,1)
}else{break}
}
if(!has_default){
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,'else{throw $err'+$loop_num+'}')
catch_node.insert(catch_node.children.length,new_node)
}
$loop_num++
}
this.to_js=function(){return 'try'}
}
function $UnaryCtx(C,op){
this.type='unary'
this.op=op
this.toString=function(){return '(unary) '+this.op+' ['+this.tree+']'}
this.parent=C
this.tree=[]
C.tree.push(this)
this.to_js=function(){return this.op+$to_js(this.tree)}
}
function $YieldCtx(C){
this.type='yield'
this.toString=function(){return '(yield) '+this.tree}
this.parent=C
this.tree=[]
C.tree.push(this)
this.transform=function(node,rank){
if(this.transformed!==undefined){return}
var scope=$get_scope(node.C.tree[0])
scope.C.tree[0].type='generator'
this.transformed=true
this.func_name=scope.C.tree[0].name
scope.C.tree[0].add_generator_declaration()
}
this.to_js=function(){
return '$'+this.func_name+'.$iter.push('+$to_js(this.tree)+')'
}
}
var $loop_num=0
var $iter_num=0 
function $add_line_num(node,rank){
if(node.type==='module'){
var i=0
while(i<node.children.length){
i +=$add_line_num(node.children[i],i)
}
}else{
var elt=node.C.tree[0],offset=1
var flag=true
if(node.line_num===undefined){flag=false}
if(elt.type==='condition' && elt.token==='elif'){flag=false}
else if(elt.type==='except'){flag=false}
else if(elt.type==='single_kw'){flag=false}
if(flag){
js='document.$line_info=['+node.line_num+',"'+node.module+'"]'
var new_node=new $Node('expression')
new $NodeJSCtx(new_node,js)
node.parent.insert(rank,new_node)
offset=2
}
var i=0
while(i<node.children.length){
i +=$add_line_num(node.children[i],i)
}
return offset
}
}
function $augmented_assign(C,op){
var assign=new $AssignCtx(C)
var new_op=new $OpCtx(C,op.substr(0,op.length-1))
assign.tree.push(new_op)
C.parent.tree.pop()
C.parent.tree.push(assign)
return new $AbstractExprCtx(new_op,false)
}
function $comp_env(C,attr,src){
var ids=$get_ids(src)
var ctx=C
while(ctx.parent!==undefined){
if(['list_or_tuple','call_arg','def'].indexOf(ctx.type)>-1){
if(ctx[attr]===undefined){ctx[attr]=ids}
else{
for(var i=0;i<ids.length;i++){
if(ctx[attr].indexOf(ids[i])===-1){
ctx[attr].push(ids[i])
}
}
}
}
ctx=ctx.parent
}
}
function $get_scope(C){
var ctx_node=C.parent
while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
var tree_node=ctx_node.node
var scope=null
while(tree_node.parent.type!=='module'){
var ntype=tree_node.parent.C.tree[0].type
if(['def','class'].indexOf(ntype)>-1){
scope=tree_node.parent
scope.ntype=ntype
break
}
tree_node=tree_node.parent
}
return scope
}
function $get_ids(ctx){
var res=[]
if(ctx.type==='expr' &&
ctx.tree[0].type==='list_or_tuple' &&
ctx.tree[0].real==='list_comp'){return[]}
if(ctx.type==='id'){res.push(ctx.value)}
else if(ctx.type==='attribute'||ctx.type==='sub'){
var res1=$get_ids(ctx.value)
for(var i=0;i<res1.length;i++){
if(res.indexOf(res1[i])===-1){res.push(res1[i])}
}
}else if(ctx.type==='call'){
var res1=$get_ids(ctx.func)
for(var i=0;i<res1.length;i++){
if(res.indexOf(res1[i])===-1){res.push(res1[i])}
}
}
if(ctx.tree!==undefined){
for(var i=0;i<ctx.tree.length;i++){
var res1=$get_ids(ctx.tree[i])
for(var j=0;j<res1.length;j++){
if(res.indexOf(res1[j])===-1){
res.push(res1[j])
}
}
}
}
return res
}
function $to_js(tree,sep){
if(sep===undefined){sep=','}
var res=''
for(var i=0;i<tree.length;i++){
if(tree[i].to_js!==undefined){
res +=tree[i].to_js()
}else{
throw Error('no to_js() for '+tree[i])
}
if(i<tree.length-1){res+=sep}
}
return res
}
var $expr_starters=['id','int','float','str','[','(','{','not','lambda']
function $arbo(ctx){
while(ctx.parent!=undefined){ctx=ctx.parent}
return ctx
}
function $transition(C,token){
if(C.type==='abstract_expr'){
if($expr_starters.indexOf(token)>-1){
C.parent.tree.pop()
var commas=C.with_commas
C=C.parent
}
if(token==='id'){return new $IdCtx(new $ExprCtx(C,'id',commas),arguments[2])}
else if(token==='str'){return new $StringCtx(new $ExprCtx(C,'str',commas),arguments[2])}
else if(token==='int'){return new $IntCtx(new $ExprCtx(C,'int',commas),arguments[2])}
else if(token==='float'){return new $FloatCtx(new $ExprCtx(C,'float',commas),arguments[2])}
else if(token==='('){return new $ListOrTupleCtx(new $ExprCtx(C,'tuple',commas),'tuple')}
else if(token==='['){return new $ListOrTupleCtx(new $ExprCtx(C,'list',commas),'list')}
else if(token==='{'){return new $DictOrSetCtx(new $ExprCtx(C,'dict_or_set',commas))}
else if(token==='not'){
if(C.type==='op'&&C.op==='is'){
C.op='is_not'
return C
}else{
return new $NotCtx(new $ExprCtx(C,'not',commas))
}
}else if(token==='lambda'){return new $LambdaCtx(new $ExprCtx(C,'lambda',commas))}
else if(token==='op'){
if('+-~'.search(arguments[2])>-1){
return new $UnaryCtx(new $ExprCtx(C,'unary',false),arguments[2])
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token==='='){$_SyntaxError(C,token)}
else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='assert'){
if(token==='eol'){
return $transition(C.parent,token)
}else{$_SyntaxError(C,token)}
}else if(C.type==='assign'){
if(token==='eol'){return $transition(C.parent,'eol')}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='attribute'){
if(token==='id'){
var name=arguments[2]
if(name.substr(0,2)=='$$'){name=name.substr(2)}
C.name=name
return C.parent
}else{$_SyntaxError(C,token)}
}else if(C.type==='call'){
if(token===','){return C}
else if($expr_starters.indexOf(token)>-1){
var expr=new $CallArgCtx(C)
return $transition(expr,token,arguments[2])
}else if(token===')'){C.end=$pos;return C.parent}
else if(token==='op'){
var op=arguments[2]
if(op==='-'||op==='~'){return new $UnaryCtx(new $ExprCtx(C,'unary',false),op)}
else if(op==='+'){return C}
else if(op==='*'){return new $StarArgCtx(C)}
else if(op==='**'){return new $DoubleStarArgCtx(C)}
else{throw Error('SyntaxError')}
}else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='call_arg'){
if($expr_starters.indexOf(token)>-1 && C.expect==='id'){
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}else if(token==='=' && C.expect===','){
return new $ExprCtx(new $KwArgCtx(C),'kw_value',false)
}else if(token==='for'){
var lst=new $ListOrTupleCtx(C,'gen_expr')
lst.vars=C.vars 
lst.locals=C.locals
lst.intervals=[C.start]
C.tree.pop()
lst.expression=C.tree
C.tree=[lst]
lst.tree=[]
var comp=new $ComprehensionCtx(lst)
return new $TargetListCtx(new $CompForCtx(comp))
}else if(token==='op' && C.expect==='id'){
var op=arguments[2]
C.expect=','
if(op==='+'||op==='-'){
return $transition(new $AbstractExprCtx(C,false),token,op)
}else if(op==='*'){C.expect=',';return new $StarArgCtx(C)}
else if(op==='**'){C.expect=',';return new $DoubleStarArgCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token===')' && C.expect===','){
if(C.tree.length>0){
var son=C.tree[C.tree.length-1]
if(son.type==='list_or_tuple'&&son.real==='gen_expr'){
son.intervals.push($pos)
}
}
return $transition(C.parent,token)
}else if(token===':' && C.expect===',' && C.parent.parent.type==='lambda'){
return $transition(C.parent.parent,token)
}else if(token===','&& C.expect===','){
return new $CallArgCtx(C.parent)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='class'){
if(token==='id' && C.expect==='id'){
C.name=arguments[2]
C.expect='(:'
return C
}
else if(token==='(' && C.expect==='(:'){
return $transition(new $AbstractExprCtx(C,true),'(')
}else if(token===':' && C.expect==='(:'){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='comp_if'){
return $transition(C.parent,token,arguments[2])
}else if(C.type==='comp_for'){
if(token==='in' && C.expect==='in'){
C.expect=null
return new $AbstractExprCtx(new $CompIterableCtx(C),true)
}else if(C.expect===null){
$comp_env(C,'locals',C.tree[0])
return $transition(C.parent,token,arguments[2])
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='comp_iterable'){
return $transition(C.parent,token,arguments[2])
}else if(C.type==='comprehension'){
if(token==='if'){return new $AbstractExprCtx(new $CompIfCtx(C),false)}
else if(token==='for'){return new $TargetListCtx(new $CompForCtx(C))}
else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='condition'){
if(token===':'){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='decorator'){
if(token==='id' && C.tree.length===0){
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}else if(token==='eol'){return $transition(C.parent,token)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='def'){
if(token==='id'){
if(C.name){
$_SyntaxError(C,'token '+token+' after '+C)
}else{
C.name=arguments[2]
return C
}
}else if(token==='('){C.has_args=true;return new $FuncArgs(C)}
else if(token===':' && C.has_args){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='del'){
if(token==='eol'){return $transition(C.parent,token)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='dict_or_set'){
if(C.closed){
if(token==='['){return new $SubCtx(C)}
else if(token==='('){return new $CallArgCtx(new $CallCtx(C))}
else if(token==='op'){
return new $AbstractExprCtx(new $OpCtx(C,arguments[2]),false)
}else{return $transition(C.parent,token,arguments[2])}
}else{
if(C.expect===','){
if(token==='}'){
if(C.real==='dict_or_set'&&C.tree.length===1){
C.real='set'
}
if(['set','set_comp','dict_comp'].indexOf(C.real)>-1||
(C.real==='dict'&&C.tree.length%2===0)){
C.items=C.tree
C.tree=[]
C.closed=true
return C
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token===','){
if(C.real==='dict_or_set'){C.real='set'}
if(C.real==='dict' && C.tree.length%2){
$_SyntaxError(C,'token '+token+' after '+C)
}
C.expect='id'
return C
}else if(token===':'){
if(C.real==='dict_or_set'){C.real='dict'}
if(C.real==='dict'){
C.expect='id'
return C
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token==='for'){
if(C.real==='dict_or_set'){C.real='set_comp'}
else{C.real='dict_comp'}
var lst=new $ListOrTupleCtx(C,'dict_or_set_comp')
lst.intervals=[C.start+1]
lst.vars=C.vars
C.tree.pop()
lst.expression=C.tree
C.tree=[lst]
lst.tree=[]
var comp=new $ComprehensionCtx(lst)
return new $TargetListCtx(new $CompForCtx(comp))
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.expect==='id'){
if(token==='}'&&C.tree.length===0){
C.items=[]
C.tree=[]
C.closed=true
C.real='dict'
return C
}else if($expr_starters.indexOf(token)>-1){
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else{return $transition(C.parent,token,arguments[2])}
}
}else if(C.type==='double_star_arg'){
if($expr_starters.indexOf(token)>-1){
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}else if(token===','){return C.parent}
else if(token===')'){return $transition(C.parent,token)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='except'){
if(token==='id' && C.expect==='id'){
new $TargetCtx(C,arguments[2])
C.expect='as'
return C
}else if(token==='as' && C.expect==='as'
&& C.has_alias===undefined 
&& C.tree.length===1){
C.expect='alias'
C.has_alias=true
return C
}else if(token==='id' && C.expect==='alias'){
if(C.parenth!==undefined){C.expect=','}
else{C.expect=':'}
C.tree[C.tree.length-1].alias=arguments[2]
return C
}else if(token===':' &&['id','as',':'].indexOf(C.expect)>-1){
return $BodyCtx(C)
}else if(token==='(' && C.expect==='id' && C.tree.length===0){
C.parenth=true
return C
}else if(token===')' &&[',','as'].indexOf(C.expect)>-1){
C.expect=':'
return C
}else if(token===',' && C.parenth!==undefined &&
C.has_alias===undefined &&
['as',','].indexOf(C.expect)>-1){
C.expect='id'
return C
}else{$_SyntaxError(C,'token '+token+' after '+C.expect)}
}else if(C.type==='expr'){
if($expr_starters.indexOf(token)>-1 && C.expect==='expr'){
C.expect=','
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}else if(token==='not'&&C.expect===','){
return new $ExprNot(C)
}else if(token==='in'&&C.expect===','){
return $transition(C,'op','in')
}else if(token===',' && C.expect===','){
if(C.with_commas){
C.parent.tree.pop()
var tuple=new $ListOrTupleCtx(C.parent,'tuple')
tuple.tree=[C]
return tuple
}else{return $transition(C.parent,token)}
}else if(token==='.'){return new $AttrCtx(C)}
else if(token==='['){return new $AbstractExprCtx(new $SubCtx(C),false)}
else if(token==='('){return new $CallCtx(C)}
else if(token==='op'){
var op_parent=C.parent,op=arguments[2]
var op1=C.parent,repl=null
while(true){
if(op1.type==='expr'){op1=op1.parent}
else if(op1.type==='op'&&$op_weight[op1.op]>$op_weight[op]){repl=op1;op1=op1.parent}
else{break}
}
if(repl===null){
if(op1.type==='op' 
&&['<','<=','==','!=','is','>=','>'].indexOf(op1.op)>-1
&&['<','<=','==','!=','is','>=','>'].indexOf(op)>-1){
op1.parent.tree.pop()
var and_expr=new $OpCtx(op1,'and')
var c2=op1.tree[1]
var c2_clone=new Object()
for(var attr in c2){c2_clone[attr]=c2[attr]}
c2_clone.parent=and_expr
and_expr.tree.push('xxx')
var new_op=new $OpCtx(c2_clone,op)
return new $AbstractExprCtx(new_op,false)
}
if(['and','or'].indexOf(op)>-1){
while(C.parent.type==='not'||
(C.parent.type==='expr'&&C.parent.parent.type==='not')){
C=C.parent
op_parent=C.parent
}
}
C.parent.tree.pop()
var expr=new $ExprCtx(op_parent,'operand',C.with_commas)
expr.expect=','
C.parent=expr
var new_op=new $OpCtx(C,op)
return new $AbstractExprCtx(new_op,false)
}
repl.parent.tree.pop()
var expr=new $ExprCtx(repl.parent,'operand',false)
expr.tree=[op1]
repl.parent=expr
var new_op=new $OpCtx(repl,op)
return new $AbstractExprCtx(new_op,false)
}else if(token==='augm_assign' && C.expect===','){
return $augmented_assign(C,arguments[2])
}else if(token==='=' && C.expect===','){
if(C.parent.type==="call_arg"){
return new $AbstractExprCtx(new $KwArgCtx(C),true)
}else{
while(C.parent!==undefined){C=C.parent}
C=C.tree[0]
return new $AbstractExprCtx(new $AssignCtx(C),true)
}
}else if(token==='if' && C.parent.type!=='comp_iterable'){
return new $AbstractExprCtx(new $TernaryCtx(C),false)
}else{return $transition(C.parent,token)}
}else if(C.type==='expr_not'){
if(token==='in'){
C.parent.tree.pop()
return new $AbstractExprCtx(new $OpCtx(C.parent,'not_in'),false)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='for'){
if(token==='in'){return new $AbstractExprCtx(C,true)}
else if(token===':'){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='from'){
if(token==='id' && C.expect==='module'){
C.module=arguments[2]
C.expect='import'
return C
}else if(token==='import' && C.expect==='import'){
C.expect='id'
return C
}else if(token==='import' && C.expect==='module' 
&& C.parent_module !==undefined){
C.expect='id'
return C
}else if(token==='id' && C.expect==='id'){
C.names.push(arguments[2])
C.expect=','
return C
}else if(token==='op' && arguments[2]==='*' 
&& C.expect==='id'
&& C.names.length===0){
C.names.push('*')
C.expect='eol'
return C
}else if(token===',' && C.expect===','){
C.expect='id'
return C
}else if(token==='eol' && 
(C.expect===',' || C.expect==='eol')){
return $transition(C.parent,token)
}else if(token==='.' && C.expect==='module'){
C.expect='module'
C.parent_module=C.parent.node.module
return C
}else if(token==='as' &&
(C.expect===',' || C.expect==='eol')){
C.expect='alias'
return C
}else if(token==='id' && C.expect==='alias'){
C.aliases[C.names[C.names.length-1]]=arguments[2]
C.expect=','
return C
}else if(token==='(' && C.expect==='id'){
C.expect='id'
return C
}else if(token===')' && C.expect===','){
C.expect='eol'
return C
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='func_arg_id'){
if(token==='=' && C.expect==='='){
C.parent.has_default=true
return new $AbstractExprCtx(C,false)
}else if(token===',' || token===')'){
if(C.parent.has_default && C.tree.length==0){
throw Error('SyntaxError: non-default argument follows default argument')
}else{
return $transition(C.parent,token)
}
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='func_args'){
if(token==='id' && C.expect==='id'){
C.expect=','
return new $FuncArgIdCtx(C,arguments[2])
}else if(token===','){
if(C.has_kw_arg){throw Error('SyntaxError')}
else if(C.expect===','){
C.expect='id'
return C
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token===')'){
if(C.expect===','){return C.parent}
else if(C.tree.length==0){return C.parent}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(token==='op'){
var op=arguments[2]
C.expect=','
if(op=='*'){return new $FuncStarArgCtx(C,'*')}
else if(op=='**'){return new $FuncStarArgCtx(C,'**')}
else{$_SyntaxError(C,'token '+op+' after '+C)}
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='func_star_arg'){
if(token==='id' && C.name===undefined){
C.name=arguments[2]
return C.parent
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='global'){
if(token==='id' && C.expect==='id'){
new $IdCtx(C,arguments[2])
C.expect=','
return C
}else if(token===',' && C.expect===','){
C.expect='id'
return C
}else if(token==='eol' && C.expect===','){
return $transition(C.parent,token)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='id'){
if(token==='='){
if(C.parent.type==='expr' &&
C.parent.parent !==undefined &&
C.parent.parent.type==='call_arg'){
return new $AbstractExprCtx(new $KwArgCtx(C.parent),false)
}else{return $transition(C.parent,token,arguments[2])}
}else if(token==='op'){return $transition(C.parent,token,arguments[2])}
else if(['id','str','int','float'].indexOf(token)>-1){
$_SyntaxError(C,'token '+token+' after '+C)
}else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='import'){
if(token==='id' && C.expect==='id'){
new $ImportedModuleCtx(C,arguments[2])
C.expect=','
return C
}else if(token===',' && C.expect===','){
C.expect='id'
return C
}else if(token==='as' && C.expect===','){
C.expect='alias'
return C
}else if(token==='id' && C.expect==='alias'){
C.expect=','
C.tree[C.tree.length-1].alias=arguments[2]
var mod_name=C.tree[C.tree.length-1].name
__BRYTHON__.$py_module_alias[mod_name]=arguments[2]
return C
}else if(token==='eol' && C.expect===','){
return $transition(C.parent,token)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='int'||C.type==='float'){
if($expr_starters.indexOf(token)>-1){
$_SyntaxError(C,'token '+token+' after '+C)
}else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='kwarg'){
if(token===','){return new $CallArgCtx(C.parent)}
else{return $transition(C.parent,token)}
}else if(C.type==="lambda"){
if(token===':' && C.args===undefined){
C.args=C.tree
C.tree=[]
C.body_start=$pos
return new $AbstractExprCtx(C,false)
}else if(C.args!==undefined){
C.body_end=$pos
return $transition(C.parent,token)
}else if(C.args===undefined){
return $transition(new $CallCtx(C),token,arguments[2])
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='list_or_tuple'){
if(C.closed){
if(token==='['){return new $SubCtx(C.parent)}
else if(token==='('){return new $CallCtx(C)}
else if(token==='op'){
return new $AbstractExprCtx(new $OpCtx(C,arguments[2]),false)
}
else{return $transition(C.parent,token,arguments[2])}
}else{
if(C.expect===','){
if((C.real==='tuple'||C.real==='gen_expr')
&& token===')'){
C.closed=true
if(C.real==='gen_expr'){C.intervals.push($pos)}
return C.parent
}else if((C.real==='list'||C.real==='list_comp')
&& token===']'){
C.closed=true
if(C.real==='list_comp'){C.intervals.push($pos)}
return C
}else if(C.real==='dict_or_set_comp' && token==='}'){
C.intervals.push($pos)
return $transition(C.parent,token)
}else if(token===','){
if(C.real==='tuple'){C.has_comma=true}
C.expect='id'
return C
}else if(token==='for'){
if(C.real==='list'){C.real='list_comp'}
else{C.real='gen_expr'}
C.intervals=[C.start+1]
C.expression=C.tree
C.tree=[]
var comp=new $ComprehensionCtx(C)
return new $TargetListCtx(new $CompForCtx(comp))
}else{return $transition(C.parent,token,arguments[2])}
}else if(C.expect==='id'){
if(C.real==='tuple' && token===')'){
C.closed=true
return C
}else if(C.real==='gen_expr' && token===')'){
C.closed=true
return $transition(C.parent,token)
}else if(C.real==='list'&& token===']'){
C.closed=true
return C
}else if(token !==')'&&token!==']'&&token!==','){
C.expect=','
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}
}else{return $transition(C.parent,token,arguments[2])}
}
}else if(C.type==='list_comp'){
if(token===']'){return C.parent}
else if(token==='in'){return new $ExprCtx(C,'iterable',true)}
else if(token==='if'){return new $ExprCtx(C,'condition',true)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='node'){
if($expr_starters.indexOf(token)>-1){
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])
}else if(token==="op" && '+-~'.search(arguments[2])>-1){
var expr=new $AbstractExprCtx(C,true)
return $transition(expr,token,arguments[2])
}else if(token==='class'){return new $ClassCtx(C)}
else if(token==='def'){return new $DefCtx(C)}
else if(token==='for'){return new $TargetListCtx(new $ForExpr(C))}
else if(['if','elif','while'].indexOf(token)>-1){
return new $AbstractExprCtx(new $ConditionCtx(C,token),false)
}else if(['else','finally'].indexOf(token)>-1){
return new $SingleKwCtx(C,token)
}else if(token==='try'){return new $TryCtx(C)}
else if(token==='except'){return new $ExceptCtx(C)}
else if(token==='assert'){return new $AbstractExprCtx(new $AssertCtx(C),'assert',true)}
else if(token==='from'){return new $FromCtx(C)}
else if(token==='import'){return new $ImportCtx(C)}
else if(token==='global'){return new $GlobalCtx(C)}
else if(token==='lambda'){return new $LambdaCtx(C)}
else if(token==='pass'){return new $PassCtx(C)}
else if(token==='raise'){return new $RaiseCtx(C)}
else if(token==='return'){
var ret=new $ReturnCtx(C)
return new $AbstractExprCtx(ret,true)
}else if(token==='yield'){
var yield=new $YieldCtx(C)
return new $AbstractExprCtx(yield,true)
}else if(token==='del'){return new $AbstractExprCtx(new $DelCtx(C),true)}
else if(token==='@'){return new $DecoratorCtx(C)}
else if(token==='eol'){
if(C.tree.length===0){
C.node.parent.children.pop()
return C.node.parent.C
}
return C
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='not'){
if(token==='in'){
C.parent.parent.tree.pop()
return new $ExprCtx(new $OpCtx(C.parent,'not_in'),'op',false)
}else if($expr_starters.indexOf(token)>-1){
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}else{return $transition(C.parent,token)}
}else if(C.type==='op'){
if($expr_starters.indexOf(token)>-1){
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}else if(token==='op' && '+-~'.search(arguments[2])>-1){
return new $UnaryCtx(C,arguments[2])
}else{return $transition(C.parent,token)}
}else if(C.type==='pass'){
if(token==='eol'){return C.parent}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='raise'){
if(token==='id' && C.tree.length===0){
return new $IdCtx(new $ExprCtx(C,'exc',false),arguments[2])
}else if(token==='eol'){
return $transition(C.parent,token)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='return'){
return $transition(C.parent,token)
}else if(C.type==='single_kw'){
if(token===':'){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='star_arg'){
if($expr_starters.indexOf(token)>-1){
return $transition(new $AbstractExprCtx(C,false),token,arguments[2])
}else if(token===','){return $transition(C.parent,token)}
else if(token===')'){return $transition(C.parent,token)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='str'){
if(token==='['){return new $AbstractExprCtx(new $SubCtx(C.parent),false)}
else if(token==='('){return new $CallCtx(C)}
else if(token=='str'){C.value +='+'+arguments[2];return C}
else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='sub'){
if($expr_starters.indexOf(token)>-1){
var expr=new $AbstractExprCtx(C,false)
return $transition(expr,token,arguments[2])
}else if(token===']'){return C.parent}
else if(token===':'){
return new $AbstractExprCtx(C,false)
}else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='target_list'){
if(token==='id' && C.expect==='id'){
C.expect=','
new $IdCtx(C,arguments[2])
return C
}else if((token==='('||token==='[')&&C.expect==='id'){
C.expect=','
return new $TargetListCtx(C)
}else if((token===')'||token===']')&&C.expect===','){
return C.parent
}else if(token===',' && C.expect==','){
C.expect='id'
return C
}else if(C.expect===','){return $transition(C.parent,token,arguments[2])}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='ternary'){
if(token==='else'){return new $AbstractExprCtx(C,false)}
else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='try'){
if(token===':'){return $BodyCtx(C)}
else{$_SyntaxError(C,'token '+token+' after '+C)}
}else if(C.type==='unary'){
if(['int','float'].indexOf(token)>-1){
C.parent.parent.tree.pop()
var value=arguments[2]
if(C.op==='-'){value=-value}
if(C.op==='~'){value=~value}
return $transition(C.parent.parent,token,value)
}else if(token==='id'){
C.parent.tree.pop()
var expr=new $ExprCtx(C.parent,'id',false)
new $IdCtx(expr,arguments[2])
if(C.op !=='+'){
var repl=new $AttrCtx(expr)
if(C.op==='-'){repl.name='__neg__'}
else{repl.name='__invert__'}
var call=new $CallCtx(expr)
}
return C.parent
}else if(token==="op" && '+-'.search(arguments[2])>-1){
var op=arguments[2]
if(C.op===op){C.op='+'}else{C.op='-'}
return C
}else{return $transition(C.parent,token,arguments[2])}
}else if(C.type==='yield'){
return $transition(C.parent,token)
}
}
__BRYTHON__.py2js=function(src,module){
src=src.replace(/\r\n/gm,'\n')
while(src.length>0 &&(src.charAt(0)=="\n" || src.charAt(0)=="\r")){
src=src.substr(1)
}
if(src.charAt(src.length-1)!="\n"){src+='\n'}
if(module===undefined){module='__main__'}
__BRYTHON__.scope[module]={}
document.$py_src[module]=src
var root=$tokenize(src,module)
root.transform()
if(document.$debug>0){$add_line_num(root,null,module)}
return root
}
__BRYTHON__.forbidden=['catch','Date','delete','default','document',
'function','location','Math','new','RegExp','this','throw','var','super','window']
function $tokenize(src,module){
var delimiters=[["#","\n","comment"],['"""','"""',"triple_string"],
["'","'","string"],['"','"',"string"],
["r'","'","raw_string"],['r"','"',"raw_string"]]
var br_open={"(":0,"[":0,"{":0}
var br_close={")":"(","]":"[","}":"{"}
var br_stack=""
var br_pos=new Array()
var kwdict=["class","return",
"for","lambda","try","finally","raise","def","from",
"nonlocal","while","del","global","with",
"as","elif","else","if","yield","assert","import",
"except","raise","in","not","pass",
]
var unsupported=["nonlocal","with"]
var $indented=['class','def','for','condition','single_kw','try','except']
var punctuation={',':0,':':0}
var int_pattern=new RegExp("^\\d+")
var float_pattern1=new RegExp("^\\d+\\.\\d*(e-?\\d+)?")
var float_pattern2=new RegExp("^\\d+(e-?\\d+)")
var hex_pattern=new RegExp("^0[xX]([0-9a-fA-F]+)")
var octal_pattern=new RegExp("^0[oO]([0-7]+)")
var binary_pattern=new RegExp("^0[bB]([01]+)")
var id_pattern=new RegExp("[\\$_a-zA-Z]\\w*")
var qesc=new RegExp('"',"g")
var C=null
var root=new $Node('module')
root.indent=-1
var new_node=new $Node('expression')
current=root
var name=""
var _type=null
var pos=0
indent=null
var lnum=1
while(pos<src.length){
var flag=false
var car=src.charAt(pos)
if(indent===null){
var indent=0
while(pos<src.length){
if(src.charAt(pos)==" "){indent++;pos++}
else if(src.charAt(pos)=="\t"){
indent++;pos++
while(indent%8>0){indent++}
}else{break}
}
if(src.charAt(pos)=='\n'){pos++;lnum++;indent=null;continue}
else if(src.charAt(pos)==='#'){
var offset=src.substr(pos).search(/\n/)
if(offset===-1){break}
pos+=offset+1;lnum++;indent=null;continue
}
new_node.indent=indent
new_node.line_num=lnum
new_node.module=module
if(indent>current.indent){
if(C!==null){
if($indented.indexOf(C.tree[0].type)==-1){
$pos=pos
$_SyntaxError(C,'unexpected indent',pos)
}
}
current.add(new_node)
}else if(indent<=current.indent &&
$indented.indexOf(C.tree[0].type)>-1 &&
C.tree.length<2){
$pos=pos
$_SyntaxError(C,'expected an indented block',pos)
}else{
while(indent!==current.indent){
current=current.parent
if(current===undefined || indent>current.indent){
$pos=pos
$_SyntaxError(C,'unexpected indent',pos)
}
}
current.parent.add(new_node)
}
current=new_node
C=new $NodeCtx(new_node)
continue
}
if(car=="#"){
var end=src.substr(pos+1).search('\n')
if(end==-1){end=src.length-1}
pos +=end+1;continue
}
if(car=='"' || car=="'"){
var raw=false
var end=null
if(name.length>0 && name.toLowerCase()=="r"){
raw=true;name=""
}
if(src.substr(pos,3)==car+car+car){_type="triple_string";end=pos+3}
else{_type="string";end=pos+1}
var escaped=false
var zone=car
var found=false
while(end<src.length){
if(escaped){zone+=src.charAt(end);escaped=false;end+=1}
else if(src.charAt(end)=="\\"){
if(raw){
zone +='\\\\'
end++
}else{
if(src.charAt(end+1)=='\n'){
end +=2
lnum++
}else{
zone+=src.charAt(end);escaped=true;end+=1
}
}
}else if(src.charAt(end)==car){
if(_type=="triple_string" && src.substr(end,3)!=car+car+car){
end++
}else{
found=true
$pos=pos
var string=zone.substr(1).replace(qesc,'\\"')
C=$transition(C,'str',zone+car)
pos=end+1
if(_type=="triple_string"){pos=end+3}
break
}
}else{
zone +=src.charAt(end)
if(src.charAt(end)=='\n'){lnum++}
end++
}
}
if(!found){$_SyntaxError(C,"String end not found")}
continue
}
if(name==""){
if(car.search(/[a-zA-Z_]/)!=-1){
name=car 
pos++;continue
}
}else{
if(car.search(/\w/)!=-1){
name+=car
pos++;continue
}else{
if(kwdict.indexOf(name)>-1){
if(unsupported.indexOf(name)>-1){
$_SyntaxError(C,"Unsupported Python keyword '"+name+"'")
}
$pos=pos-name.length
C=$transition(C,name)
}else if(name in $operators){
$pos=pos-name.length
C=$transition(C,'op',name)
}else{
if(__BRYTHON__.forbidden.indexOf(name)>-1){name='$$'+name}
$pos=pos-name.length
C=$transition(C,'id',name)
}
name=""
continue
}
}
if(car=="."){
$pos=pos
C=$transition(C,'.')
pos++;continue
}
if(car==="0"){
var res=hex_pattern.exec(src.substr(pos))
if(res){
C=$transition(C,'int',parseInt(res[1],16))
pos +=res[0].length
continue
}
var res=octal_pattern.exec(src.substr(pos))
if(res){
C=$transition(C,'int',parseInt(res[1],8))
pos +=res[0].length
continue
}
var res=binary_pattern.exec(src.substr(pos))
if(res){
C=$transition(C,'int',parseInt(res[1],2))
pos +=res[0].length
continue
}
}
if(car.search(/\d/)>-1){
var res=float_pattern1.exec(src.substr(pos))
if(res){
if(res[0].search('e')>-1){
$pos=pos
C=$transition(C,'float',res[0])
}else{
$pos=pos
C=$transition(C,'float',eval(res[0]))
}
}else{
res=float_pattern2.exec(src.substr(pos))
if(res){
$pos=pos
C=$transition(C,'float',res[0])
}else{
res=int_pattern.exec(src.substr(pos))
$pos=pos
C=$transition(C,'int',eval(res[0]))
}
}
pos +=res[0].length
continue
}
if(car=="\n"){
lnum++
if(br_stack.length>0){
pos++;continue
}else{
if(current.C.tree.length>0){
$pos=pos
C=$transition(C,'eol')
indent=null
new_node=new $Node()
}else{
new_node.line_num=lnum
}
pos++;continue
}
}
if(car in br_open){
br_stack +=car
br_pos[br_stack.length-1]=[C,pos]
$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car in br_close){
if(br_stack==""){
$_SyntaxError(C,"Unexpected closing bracket")
}else if(br_close[car]!=$last(br_stack)){
$_SyntaxError(C,"Unbalanced bracket")
}else{
br_stack=br_stack.substr(0,br_stack.length-1)
$pos=pos
C=$transition(C,car)
pos++;continue
}
}
if(car=="="){
if(src.charAt(pos+1)!="="){
$pos=pos
C=$transition(C,'=')
pos++;continue
}else{
$pos=pos
C=$transition(C,'op','==')
pos+=2;continue
}
}
if(car in punctuation){
$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car===";"){
$transition(C,'eol')
if(current.C.tree.length===0){
$pos=pos
$_SyntaxError(C,'invalid syntax')
}
new_node=new $Node()
new_node.indent=current.indent
new_node.line_num=lnum
new_node.module=module
current.parent.add(new_node)
current=new_node
C=new $NodeCtx(new_node)
pos++;continue
}
if(car in $first_op_letter){
var op_match=""
for(op_sign in $operators){
if(op_sign==src.substr(pos,op_sign.length)
&& op_sign.length>op_match.length){
op_match=op_sign
}
}
$pos=pos
if(op_match.length>0){
if(op_match in $augmented_assigns){
C=$transition(C,'augm_assign',op_match)
}else{
C=$transition(C,'op',op_match)
}
pos +=op_match.length
continue
}
}
if(car=='\\' && src.charAt(pos+1)=='\n'){
lnum++;pos+=2;continue
}
if(car=='@'){
$pos=pos
C=$transition(C,car)
pos++;continue
}
if(car!=' '&&car!=='\t'){$pos=pos;$_SyntaxError(C,'unknown token ['+car+']')}
pos +=1
}
if(br_stack.length!=0){
var br_err=br_pos[0]
$pos=br_err[1]
$_SyntaxError(br_err[0],"Unbalanced bracket "+br_stack.charAt(br_stack.length-1))
}
if($indented.indexOf(C.tree[0].type)>-1){
$pos=pos-1
$_SyntaxError(C,'expected an indented block',pos)
}
return root
}
function brython(options){
document.$py_src={}
__BRYTHON__.$py_module_path={}
__BRYTHON__.$py_module_alias={}
__BRYTHON__.modules={}
__BRYTHON__.$py_next_hash=-Math.pow(2,53)
document.$debug=0
if(options===undefined){options={'debug':0}}
if(typeof options==='number'){options={'debug':options}}
if(options.debug==1 || options.debug==2){
document.$debug=options.debug
}
__BRYTHON__.$options=options
__BRYTHON__.exception_stack=[]
__BRYTHON__.scope={}
var $elts=document.getElementsByTagName("script")
var $href=window.location.href
var $href_elts=$href.split('/')
$href_elts.pop()
var $script_path=$href_elts.join('/')
__BRYTHON__.path=[]
if(isinstance(options.pythonpath, list)){
__BRYTHON__.path=options.pythonpath
}
if(!(__BRYTHON__.path.indexOf($script_path)> -1)){
__BRYTHON__.path.push($script_path)
}
for(var $i=0;$i<$elts.length;$i++){
var $elt=$elts[$i]
var $br_scripts=['brython.js','py2js.js','py_loader.js']
for(var j=0;j<$br_scripts.length;j++){
var $bs=$br_scripts[j]
if($elt.src.substr($elt.src.length-$bs.length)==$bs){
if($elt.src.length===$bs.length ||
$elt.src.charAt($elt.src.length-$bs.length-1)=='/'){
var $path=$elt.src.substr(0,$elt.src.length-$bs.length)
__BRYTHON__.brython_path=$path
if(!(__BRYTHON__.path.indexOf($path+'Lib')> -1)){
__BRYTHON__.path.push($path+'Lib')
}
break
}
}
}
}
for(var $i=0;$i<$elts.length;$i++){
var $elt=$elts[$i]
if($elt.type=="text/python"||$elt.type==="text/python3"){
var $src=null
if($elt.src!==''){
if(window.XMLHttpRequest){
var $xmlhttp=new XMLHttpRequest()
}else{
var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
}
$xmlhttp.onreadystatechange=function(){
var state=this.readyState
if(state===4){
$src=$xmlhttp.responseText
}
}
$xmlhttp.open('GET',$elt.src,false)
$xmlhttp.send()
__BRYTHON__.$py_module_path['__main__']=$elt.src 
var $src_elts=$elt.src.split('/')
$src_elts.pop()
var $src_path=$src_elts.join('/')
if(__BRYTHON__.path.indexOf($src_path)==-1){
__BRYTHON__.path.splice(0,0,$src_path)
}
}else{
var $src=($elt.innerHTML || $elt.textContent)
__BRYTHON__.$py_module_path['__main__']='.' 
}
try{
var $root=__BRYTHON__.py2js($src,'__main__')
var $js=$root.to_js()
if(document.$debug===2){console.log($js)}
eval($js)
}catch($err){
if($err.py_error===undefined){$err=RuntimeError($err+'')}
var $trace=$err.__name__+': '+$err.message
if($err.__name__=='SyntaxError'||$err.__name__==='IndentationError'){
$trace +=$err.info
}
document.$stderr.__getattr__('write')($trace)
$err.message +=$err.info
throw $err
}
}
}
}

function $XmlHttpClass(obj){
this.__class__='XMLHttpRequest'
this.__getattr__=function(attr){
if('get_'+attr in this){return this['get_'+attr]()}
else{return obj[attr]}
}
this.get_text=function(){return obj.responseText}
this.get_xml=function(){return $DomObject(obj.responseXML)}
this.get_headers=function(){return list(obj.getAllResponseHeaders().split('\n'))}
this.get_get_header=function(){
var reqobj=obj
return function(header){return reqobj.getResponseHeader(header)}
}
}
function Ajax(){}
Ajax.__class__=$type
Ajax.__str__=function(){return "<class 'Ajax'>"}
function $AjaxClass(){
if(window.XMLHttpRequest){
var $xmlhttp=new XMLHttpRequest()
}else{
var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")
}
$xmlhttp.$ajax=this
$xmlhttp.$requestTimer=null
$xmlhttp.onreadystatechange=function(){
var state=this.readyState
var req=this.$ajax
var timer=this.$requestTimer
var obj=new $XmlHttpClass($xmlhttp)
if(state===0 && 'on_uninitialized' in req){req.on_uninitialized(obj)}
else if(state===1 && 'on_loading' in req){req.on_loading(obj)}
else if(state===2 && 'on_loaded' in req){req.on_loaded(obj)}
else if(state===3 && 'on_interactive' in req){req.on_interactive(obj)}
else if(state===4 && 'on_complete' in req){
if(timer !==null){window.clearTimeout(timer)}
req.on_complete(obj)
}
}
this.__class__=Ajax
this.__getattr__=function(attr){return $getattr(this,attr)}
this.__setattr__=function(attr,value){setattr(this,attr,value)}
this.__str__=function(){return "<object 'Ajax'>"}
this.open=function(method,url,async){
$xmlhttp.open(method,url,async)
}
this.set_header=function(key,value){
$xmlhttp.setRequestHeader(key,value)
}
this.send=function(params){
if(!params || params.$keys.length==0){$xmlhttp.send();return}
if(!isinstance(params,dict)){$raise('TypeError',
"send() argument must be dictonary, not '"+str(params.__class__)+"'")}
var res=''
for(i=0;i<params.$keys.length;i++){
res +=encodeURIComponent(str(params.$keys[i]))+'='+encodeURIComponent(str(params.$values[i]))+'&'
}
res=res.substr(0,res.length-1)
$xmlhttp.send(res)
}
this.set_timeout=function(seconds,func){
$xmlhttp.$requestTimer=setTimeout(
function(){$xmlhttp.abort();func()}, 
seconds*1000);
}
}
function ajax(){
return new $AjaxClass()
}

function $getMouseOffset(target, ev){
ev=ev || window.event
var docPos=$getPosition(target)
var mousePos=$mouseCoords(ev)
return{x:mousePos.x - docPos.x, y:mousePos.y - docPos.y}
}
function $getPosition(e){
var left=0
var top=0
var width=e.offsetWidth
var height=e.offsetHeight
while(e.offsetParent){
left +=e.offsetLeft
top +=e.offsetTop
e=e.offsetParent
}
left +=e.offsetLeft
top +=e.offsetTop
return{left:left, top:top, width:width, height:height}
}
function $mouseCoords(ev){
var posx=0
var posy=0
if(!ev)var ev=window.event
if(ev.pageX || ev.pageY){
posx=ev.pageX
posy=ev.pageY
}else if(ev.clientX || ev.clientY){
posx=ev.clientX + document.body.scrollLeft
+ document.documentElement.scrollLeft
posy=ev.clientY + document.body.scrollTop
+ document.documentElement.scrollTop
}
var res=object()
res.x=int(posx)
res.y=int(posy)
res.__getattr__=function(attr){return this[attr]}
res.__class__="MouseCoords"
return res
}
var $DOMNodeAttrs=['nodeName','nodeValue','nodeType','parentNode',
'childNodes','firstChild','lastChild','previousSibling','nextSibling',
'attributes','ownerDocument']
function $isNode(obj){
for(var i=0;i<$DOMNodeAttrs.length;i++){
if(obj[$DOMNodeAttrs[i]]===undefined){return false}
}
return true
}
var $DOMEventAttrs_W3C=['NONE','CAPTURING_PHASE','AT_TARGET','BUBBLING_PHASE',
'type','target','currentTarget','eventPhase','bubbles','cancelable','timeStamp',
'stopPropagation','preventDefault','initEvent']
var $DOMEventAttrs_IE=['altKey','altLeft','button','cancelBubble',
'clientX','clientY','contentOverflow','ctrlKey','ctrlLeft','data',
'dataFld','dataTransfer','fromElement','keyCode','nextPage',
'offsetX','offsetY','origin','propertyName','reason','recordset',
'repeat','screenX','screenY','shiftKey','shiftLeft',
'source','srcElement','srcFilter','srcUrn','toElement','type',
'url','wheelDelta','x','y']
function $isEvent(obj){
flag=true
for(var i=0;i<$DOMEventAttrs_W3C.length;i++){
if(obj[$DOMEventAttrs_W3C[i]]===undefined){flag=false;break}
}
if(flag){return true}
for(var i=0;i<$DOMEventAttrs_IE.length;i++){
if(obj[$DOMEventAttrs_IE[i]]===undefined){return false}
}
return true
}
function DOMObject(){}
DOMObject.__class__=$type
DOMObject.__str__=function(){return "<class 'DOMObject'>"}
DOMObject.toString=function(){return "<class 'DOMObject'>"}
$DOMtoString=function(){
var res="<DOMObject object type '" 
return res+$NodeTypes[this.nodeType]+"' name '"+this.nodeName+"'>"
}
$NodeTypes={1:"ELEMENT",
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
DOMEvent.__class__=$type
DOMEvent.toString=function(){return "<class 'DOMEvent'>"}
function $DOMEvent(ev){
ev.__class__=DOMEvent
ev.__getattr__=function(attr){
if(attr=="x"){return $mouseCoords(ev).x}
if(attr=="y"){return $mouseCoords(ev).y}
if(attr=="data"){return new $Clipboard(ev.dataTransfer)}
if(attr=="target"){
if(ev.target===undefined){return $DOMNode(ev.srcElement)}
else{return $DOMNode(ev.target)}
}
return $getattr(ev,attr)
}
if(ev.preventDefault===undefined){ev.preventDefault=function(){ev.returnValue=false}}
if(ev.stopPropagation===undefined){ev.stopPropagation=function(){ev.cancelBubble=true}}
ev.__str__=function(){return '<DOMEvent object>'}
ev.toString=ev.__str__
return ev
}
function $Clipboard(data){
return{
data : data,
__class__ : "Clipboard",
__getattr__ : function(attr){return this[attr]},
__getitem__ : function(name){return data.getData(name)},
__setitem__ : function(name,value){data.setData(name,value)},
__setattr__ : function(attr,value){data[attr]=value}
}
}
function $OpenFile(file,mode,encoding){
this.reader=new FileReader()
if(mode==='r'){this.reader.readAsText(file,encoding)}
else if(mode==='rb'){this.reader.readAsBinaryString(file)}
this.file=file
this.__class__=dom.FileReader
this.__getattr__=function(attr){
if(this['get_'+attr]!==undefined){return this['get_'+attr]}
return this.reader[attr]
}
this.__setattr__=(function(obj){
return function(attr,value){
if(attr.substr(0,2)=='on'){
if(window.addEventListener){
var callback=function(ev){return value($DOMEvent(ev))}
obj.addEventListener(attr.substr(2),callback)
}else if(window.attachEvent){
var callback=function(ev){return value($DOMEvent(window.event))}
obj.attachEvent(attr,callback)
}
}else if('set_'+attr in obj){return obj['set_'+attr](value)}
else if(attr in obj){obj[attr]=value}
else{setattr(obj,attr,value)}
}
})(this.reader)
}
dom={File : function(){},
FileReader : function(){}
}
dom.File.__class__=$type
dom.File.__str__=function(){return "<class 'File'>"}
dom.FileReader.__class__=$type
dom.FileReader.__str__=function(){return "<class 'FileReader'>"}
function $OptionsClass(parent){
this.parent=parent
this.__class__='options'
this.__delitem__=function(arg){parent.options.remove(arg)}
this.__getattr__=function(attr){
if(this['get_'+attr]!==undefined){return this['get_'+attr]}
else if(this[attr]!==undefined){
var res=$JS2Py(this[attr])
return res
}
else{throw AttributeError("'DOM.Options' object has no attribute '"+attr+"'")}
}
this.__getitem__=function(key){
return $DOMNode(parent.options[key])
}
this.__len__=function(){return parent.options.length}
this.__setattr__=function(attr,value){
parent.options[attr]=value
}
this.__setitem__=function(attr,value){
parent.options[attr]=$JS2Py(value)
}
this.__str__=function(){return "<object Options wraps "+parent.options+">"}
this.get_append=function(element){
parent.options.add(element)
}
this.get_insert=function(index,element){
if(index===undefined){parent.options.add(element)}
else{parent.options.add(element,index)}
}
this.get_item=function(index){
return parent.options.item(index)
}
this.get_namedItem=function(name){
return parent.options.namedItem(name)
}
this.get_remove=function(arg){parent.options.remove(arg)}
this.toString=this.__str__
}
function JSObject(obj){
if(obj===null){return new $JSObject(obj)}
if(obj.__class__!==undefined){return obj}
return new $JSObject(obj)
}
JSObject.__class__=$type
JSObject.__str__=function(){return "<class 'JSObject'>"}
JSObject.toString=JSObject.__str__
function $JSObject(js){
this.js=js
this.__class__=JSObject
this.__str__=function(){return "<object 'JSObject' wraps "+this.js+">"}
this.toString=this.__str__
}
$JSObject.prototype.__bool__=function(){return(new Boolean(this.js)).valueOf()}
$JSObject.prototype.__getitem__=function(rank){
if(this.js.item!==undefined){return this.js.item(rank)}
else{throw AttributeError,this+' has no attribute __getitem__'}
}
$JSObject.prototype.__item__=function(rank){
if(this.js.item!==undefined){return this.js.item(rank)}
else{throw AttributeError,this+' has no attribute __item__'}
}
$JSObject.prototype.__len__=function(){
if(this.js.length!==undefined){return this.js.length}
else{throw AttributeError,this+' has no attribute __len__'}
}
$JSObject.prototype.__getattr__=function(attr){
if(this['get_'+attr]!==undefined){
return this['get_'+attr]
}else if(this.js[attr]!==undefined){
var obj=this.js,obj_attr=this.js[attr]
if(typeof this.js[attr]=='function'){
return function(){
var args=[]
for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
var res=obj_attr.apply(obj,args)
if(typeof res=='object'){return JSObject(res)}
else if(res===undefined){return None}
else{return $JS2Py(res)}
}
}else if(obj===window && attr==='location'){
return $Location()
}else{
return $JS2Py(this.js[attr])
}
}else{
throw AttributeError("no attribute "+attr)
}
}
$JSObject.prototype.__setattr__=function(attr,value){
if(isinstance(value,JSObject)){
this.js[attr]=value.js
}else{
this.js[attr]=value
}
}
function $Location(){
var obj=new object()
for(var x in window.location){obj[x]=window.location[x]}
obj.__class__=new $class(this,'Location')
obj.toString=function(){return window.location.toString()}
return obj
}
win=new $JSObject(window)
function DOMNode(){}
function $DOMNode(elt){
if(elt['$brython_id']===undefined||elt.nodeType===9){
elt.$brython_id=Math.random().toString(36).substr(2, 8)
for(var attr in DOMNode.prototype){elt[attr]=DOMNode.prototype[attr]}
elt.__str__=$DOMtoString
}
return elt
}
DOMNode.prototype.__add__=function(other){
var res=$TagSum()
res.children=[this]
if(isinstance(other,$TagSum)){
for(var $i=0;$i<other.children.length;$i++){res.children.push(other.children[$i])}
}else if(isinstance(other,[str,int,float,list,dict,set,tuple])){
res.children.push(document.createTextNode(str(other)))
}else{res.children.push(other)}
return res
}
DOMNode.prototype.__class__=DOMObject
DOMNode.prototype.__contains__=function(key){
try{this.__getitem__(key);return True}
catch(err){return False}
}
DOMNode.prototype.__delitem__=function(key){
if(this.nodeType===9){
var res=document.getElementById(key)
if(res){res.parentNode.removeChild(res)}
else{throw KeyError(key)}
}else{
this.removeChild(this.childNodes[key])
}
}
DOMNode.prototype.__eq__=function(other){
if(this.isEqualNode!==undefined){return this.isEqualNode(other)}
else if(this.$brython_id!==undefined){return this.$brython_id===other.$brython_id}
else{throw NotImplementedError('__eq__ is not implemented')}
}
DOMNode.prototype.__getattr__=function(attr){
if(attr==='__class__'){return DOMObject}
if(this['get_'+attr]!==undefined){return this['get_'+attr]()}
if(this.getAttribute!==undefined){
var res=this.getAttribute(attr)
if(res!==undefined&&res!==null){return res}
}
if(this[attr]!==undefined){
var res=this[attr]
if(typeof res==="function"){
var func=(function(obj){
return function(){
var args=[]
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
func.__name__=attr
return func
}else{
return $JS2Py(this[attr])
}
}
return $getattr(this,attr)
}
DOMNode.prototype.__getitem__=function(key){
if(this.nodeType===9){
if(typeof key==="string"){
var res=document.getElementById(key)
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
DOMNode.prototype.__in__=function(other){return other.__contains__(this)}
DOMNode.prototype.__item__=function(key){
return $DOMNode(this.childNodes[key])
}
DOMNode.prototype.__le__=function(other){
var obj=this
if(this.nodeType===9){obj=this.body}
if(isinstance(other,$TagSum)){
var $i=0
for($i=0;$i<other.children.length;$i++){
obj.appendChild(other.children[$i])
}
}else if(typeof other==="string" || typeof other==="number"){
var $txt=document.createTextNode(other.toString())
obj.appendChild($txt)
}else{
obj.appendChild(other)
}
}
DOMNode.prototype.__len__=function(){return this.childNodes.length}
DOMNode.prototype.__mul__=function(other){
if(isinstance(other,int)&& other.valueOf()>0){
var res=$TagSum()
for(var i=0;i<other.valueOf();i++){
var clone=this.get_clone()()
res.children.push(clone)
}
return res
}else{
throw ValueError("can't multiply "+this.__class__+"by "+other)
}
}
DOMNode.prototype.__ne__=function(other){return !this.__eq__(other)}
DOMNode.prototype.__radd__=function(other){
var res=$TagSum()
var txt=document.createTextNode(other)
res.children=[txt,this]
return res 
}
DOMNode.prototype.__setattr__=function(attr,value){
if(attr.substr(0,2)=='on'){
if(window.addEventListener){
var callback=function(ev){return value($DOMEvent(ev))}
this.addEventListener(attr.substr(2),callback)
}else if(window.attachEvent){
var callback=function(ev){return value($DOMEvent(window.event))}
this.attachEvent(attr,callback)
}
}else{
attr=attr.replace('_','-')
if(this['set_'+attr]!==undefined){return this['set_'+attr](value)}
if(this[attr]!==undefined){this[attr]=value}
var res=this.getAttribute(attr)
if(res!==undefined&&res!==null){this.setAttribute(attr,value)}
else{this[attr]=value}
}
}
DOMNode.prototype.__setitem__=function(key,value){
this.childNodes[key]=value
}
DOMNode.prototype.get_get=function(){
var obj=this
return function(){
var $ns=$MakeArgs('get',arguments,[],{},null,'kw')
if('name'.__in__($ns['kw'])){
if(obj.getElementsByName===undefined){
throw TypeError("DOMNode object doesn't support selection by name")
}
var res=[]
var node_list=document.getElementsByName($ns['kw'].__getitem__('name'))
if(node_list.length===0){return[]}
for(var i=0;i<node_list.length;i++){
res.push($DOMNode(node_list[i]))
}
}
if('tag'.__in__($ns['kw'])){
if(obj.getElementsByTagName===undefined){
throw TypeError("DOMNode object doesn't support selection by tag name")
}
var res=[]
var node_list=document.getElementsByTagName($ns['kw'].__getitem__('tag'))
if(node_list.length===0){return[]}
for(var i=0;i<node_list.length;i++){
res.push($DOMNode(node_list[i]))
}
}
if('classname'.__in__($ns['kw'])){
if(obj.getElementsByClassName===undefined){
throw TypeError("DOMNode object doesn't support selection by class name")
}
var res=[]
var node_list=document.getElementsByClassName($ns['kw'].__getitem__('classname'))
if(node_list.length===0){return[]}
for(var i=0;i<node_list.length;i++){
res.push($DOMNode(node_list[i]))
}
}
if('id'.__in__($ns['kw'])){
if(obj.getElementById===undefined){
throw TypeError("DOMNode object doesn't support selection by id")
}
var id_res=obj.getElementById($ns['kw'].__getitem__('id'))
if(!id_res){return[]}
else{return[$DOMNode(id_res)]}
}
if('selector'.__in__($ns['kw'])){
if(obj.querySelectorAll===undefined){
throw TypeError("DOMNode object doesn't support selection by selector")
}
var node_list=obj.querySelectorAll($ns['kw'].__getitem__('selector'))
var sel_res=[]
if(node_list.length===0){return[]}
for(var i=0;i<node_list.length;i++){
sel_res.push($DOMNode(node_list[i]))
}
if(res===undefined){return sel_res}
var to_delete=[]
for(var i=0;i<res.length;i++){
var elt=res[i]
flag=false
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
DOMNode.prototype.get_clone=function(){
res=$DOMNode(this.cloneNode(true))
for(var attr in this){
if(attr.substr(0,2)=='on' && this[attr]!==undefined){
res[attr]=this[attr]
}
}
var func=function(){return res}
return func
}
DOMNode.prototype.get_remove=function(){
var obj=this
return function(child){obj.removeChild(child)}
}
DOMNode.prototype.get_getContext=function(){
if(!('getContext' in this)){throw AttributeError(
"object has no attribute 'getContext'")}
var obj=this
return function(ctx){return new $JSObject(obj.getContext(ctx))}
}
DOMNode.prototype.get_parent=function(){
if(this.parentElement){return $DOMNode(this.parentElement)}
else{return None}
}
DOMNode.prototype.get_id=function(){
if(this.id !==undefined){return this.id}
else{return None}
}
DOMNode.prototype.get_class=function(){
if(this.className !==undefined){return this.className}
else{return None}
}
DOMNode.prototype.get_tagName=function(){
if(this.tagName !==undefined){return this.tagName}
else{return None}
}
DOMNode.prototype.get_options=function(){
return new $OptionsClass(this)
}
DOMNode.prototype.get_left=function(){
return int($getPosition(this)["left"])
}
DOMNode.prototype.get_top=function(){
return int($getPosition(this)["top"])
}
DOMNode.prototype.get_children=function(){
var res=[]
for(var i=0;i<this.childNodes.length;i++){
res.push($DOMNode(this.childNodes[i]))
}
return res
}
DOMNode.prototype.get_reset=function(){
var $obj=this
return function(){$obj.reset()}
}
DOMNode.prototype.get_style=function(){
return new $JSObject(this.style)
}
DOMNode.prototype.set_style=function(style){
for(var i=0;i<style.$keys.length;i++){
this.style[style.$keys[i]]=style.$values[i]
}
}
DOMNode.prototype.get_submit=function(){
var $obj=this
return function(){$obj.submit()}
}
DOMNode.prototype.get_text=function(){
return this.innerText || this.textContent
}
DOMNode.prototype.get_html=function(){return this.innerHTML}
DOMNode.prototype.get_value=function(value){return this.value}
DOMNode.prototype.set_html=function(value){this.innerHTML=str(value)}
DOMNode.prototype.set_text=function(value){
this.innerText=str(value)
this.textContent=str(value)
}
DOMNode.prototype.set_value=function(value){this.value=value.toString()}
doc=$DOMNode(document)
doc.headers=function(){
var req=new XMLHttpRequest()
req.open('GET', document.location, false)
req.send(null)
var headers=req.getAllResponseHeaders()
headers=headers.split('\r\n')
var res=dict()
for(var i=0;i<headers.length;i++){
var header=headers[i]
if(header.strip().length==0){continue}
var pos=header.search(':')
res.__setitem__(header.substr(0,pos),header.substr(pos+1).lstrip())
}
return res
}
doc.query=function(){
var res=new Object()
res._keys=[]
res._values=new Object()
var qs=location.search.substr(1).split('&')
for(var i=0;i<qs.length;i++){
var pos=qs[i].search('=')
var elts=[qs[i].substr(0,pos),qs[i].substr(pos+1)]
var key=decodeURIComponent(elts[0])
var value=decodeURIComponent(elts[1])
if(res._keys.indexOf(key)>-1){res._values[key].push(value)}
else{res._values[key]=[value]}
}
res.__contains__=function(key){
return res._keys.indexOf(key)>-1
}
res.__getitem__=function(key){
var result=res._values[key]
if(result===undefined){throw KeyError(key)}
else if(result.length==1){return result[0]}
return result
}
res.getfirst=function(key,_default){
var result=res._values[key]
if(result===undefined){
if(_default===undefined){return None}
return _default
}
return result[0]
}
res.getlist=function(key){
var result=res._values[key]
if(result===undefined){return[]}
return result
}
res.getvalue=function(key,_default){
try{return res.__getitem__(key)}
catch(err){
$pop_exc()
if(_default===undefined){return None}
else{return _default}
}
}
res.keys=function(){return res._keys}
return res
}
function $TagSumClass(){
this.__class__=$TagSum
this.children=[]
}
$TagSumClass.prototype.appendChild=function(child){
this.children.push(child)
}
$TagSumClass.prototype.__add__=function(other){
if(isinstance(other,$TagSum)){
this.children=this.children.concat(other.children)
}else if(isinstance(other,str)){
this.children=this.children.concat(document.createTextNode(other))
}else{this.children.push(other)}
return this
}
$TagSumClass.prototype.__radd__=function(other){
var res=$TagSum()
res.children=this.children.concat(document.createTextNode(other))
return res
}
$TagSumClass.prototype.clone=function(){
var res=$TagSum(), $i=0
for($i=0;$i<this.children.length;$i++){
res.children.push(this.children[$i].cloneNode(true))
}
return res
}
function $TagSum(){
return new $TagSumClass()
}
var $toDOM=function(content){
if(isinstance(content,DOMNode)){return content}
if(isinstance(content,str)){
var _dom=document.createElement('html')
_dom.innerHTML=content
return _dom
}
$raise('Error', 'Invalid argument' + content)
}
DOMNode.prototype.addClass=function(classname){
var _c=this.__getattr__('class')
if(_c===undefined){
this.__setattr__('class', classname)
}else{
this.__setattr__('class', _c + " " + classname)
}
return this
}
DOMNode.prototype.after=function(content){
var _content=$toDOM(content)
if(this.nextSibling !==null){
this.parentElement.insertBefore(_content, this.nextSibling)
}else{
this.parentElement.appendChild(_content)
}
return this
}
DOMNode.prototype.append=function(content){
var _content=$toDOM(content)
this.appendChild(_content)
return this
}
DOMNode.prototype.before=function(content){
var _content=$toDOM(content)
this.parentElement.insertBefore(_content, this)
return this
}
DOMNode.prototype.closest=function(selector){
var traverse=function(node, ancestors){
if(node===doc)return None
for(var i=0;i<ancestors.length;i++){
if(node===ancestors[i]){
return ancestors[i]
}
}
return traverse(this.parentElement, ancestors)
}
if(isinstance(selector, str)){
var _elements=doc.get(selector=selector)
return traverse(this, _elements);
}
return traverse(this, selector)
}
DOMNode.prototype.css=function(property,value){
if(value !==undefined){
this.set_style({property:value})
return this 
}
if(isinstance(property, dict)){
this.set_style(property)
return this
}
if(this.style[property]===undefined){return None}
return this.style[property]
}
DOMNode.prototype.empty=function(){
for(var i=0;i <=this.childNodes.length;i++){
this.removeChild(this.childNodes[i])
}
}
DOMNode.prototype.hasClass=function(name){
var _c=this.__getattr__('class')
if(_c===undefined)return False
if(_c.indexOf(name)> -1)return True
return False
}
DOMNode.prototype.prepend=function(content){
var _content=$toDOM(content)
this.insertBefore(_content, this.firstChild)
}
DOMNode.prototype.removeAttr=function(name){
this.__setattr__(name, undefined)
}
DOMNode.prototype.removeClass=function(name){
var _c=this.__getattr__('class')
if(_c===undefined)return
if(_c===name){
this.__setattr__('class', undefined)
return
}
_index=_c.indexOf(name)
if(_index==-1)return
var _class_string=_c
if(_index==0){
_class_string=_c.substring(name.length)
}else if(_index==_c.length - name.length){
_class_string=_c.substring(0, _index)
}else{
_class_string=_c.replace(' '+name+' ', '')
}
this.__setattr('class', _class_string)
}
win.get_postMessage=function(msg,targetOrigin){
if(isinstance(msg,dict)){
var temp=new Object()
temp.__class__='dict'
for(var i=0;i<msg.__len__();i++){temp[msg.$keys[i]]=msg.$values[i]}
msg=temp
}
return window.postMessage(msg,targetOrigin)
}
