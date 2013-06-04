// global object with brython built-ins
__BRYTHON__ = new Object()
__BRYTHON__.__getattr__ = function(attr){return this[attr]}

// system language ( _not_ the one set in browser settings)
// cf http://stackoverflow.com/questions/1043339/javascript-for-detecting-browser-language-preference
__BRYTHON__.language = window.navigator.userLanguage || window.navigator.language

__BRYTHON__.date = function(){
    if(arguments.length===0){return JSObject(new Date())}
    else if(arguments.length===1){return JSObject(new Date(arguments[0]))}
    else if(arguments.length===7){return JSObject(new Date(arguments[0],
        arguments[1]-1,arguments[2],arguments[3],
        arguments[4],arguments[5],arguments[6]))}
}
__BRYTHON__.has_local_storage = typeof(Storage)!=="undefined"
if(__BRYTHON__.has_local_storage){
    __BRYTHON__.local_storage = function(){return JSObject(localStorage)}
}

window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange

__BRYTHON__.has_indexedDB = typeof(window.indexedDB) !== "undefined"
if (__BRYTHON__.has_indexedDB) {
   __BRYTHON__.indexedDB = function() {return JSObject(window.indexedDB)}
}

__BRYTHON__.re = function(pattern,flags){return JSObject(new RegExp(pattern,flags))}
__BRYTHON__.has_json = typeof(JSON)!=="undefined"
__BRYTHON__.version_info = [1,1,"20130604-085135"]
__BRYTHON__.path = [] // path for .py modules
