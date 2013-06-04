// import modules

function $importer(){
    // returns the XMLHTTP object to handle imports
    if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
        var $xmlhttp=new XMLHttpRequest();
    }else{// code for IE6, IE5
        var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }

    var fake_qs;
    // lets use $options to figure out how to make requests
    if (__BRYTHON__.$options.cache === undefined ||
        __BRYTHON__.$options.cache == 'none') {
      //generate random number to pass in request to "bust" browser caching
      fake_qs="?v="+Math.random().toString(36).substr(2,8)
    } else if (__BRYTHON__.$options.cache == 'version') {
      fake_qs="?v="+__BRYTHON__.version_info[2]
    } else if (__BRYTHON__.$options.cache == 'browser') {
      fake_qs=""
    } else {  // default is to send random string to bust cache
      fake_qs="?v="+Math.random().toString(36).substr(2,8)
    }

    var timer = setTimeout( function() {
        $xmlhttp.abort()
        throw ImportError("No module named '"+module+"'")}, 5000)
    return [$xmlhttp,fake_qs,timer]
}

function $import_js(module,alias,names){
   var filepath=__BRYTHON__.brython_path+'libs/' + module
   return $import_js_generic(module,alias,names,filepath)
}

function $import_js_generic(module,alias,names,filepath) {
   var module_contents=$download_module(module, filepath+'.js')
   return $import_js_module(module, alias, names, filepath+'.js', module_contents)
}

function $download_module(module,url){
    var imp = $importer()
    var $xmlhttp = imp[0],fake_qs=imp[1],timer=imp[2],res=null
    $xmlhttp.onreadystatechange = function(){
        if($xmlhttp.readyState==4){
            window.clearTimeout(timer)
            if($xmlhttp.status==200 || $xmlhttp.status==0){res=$xmlhttp.responseText}
            else{
                // don't throw an exception here, it will not be caught (issue #30)
                res = Error()
                res.name = 'NotFoundError'
                res.message = "No module named '"+module+"'"
            }
        }
    }

    $xmlhttp.open('GET',url+fake_qs,false)
    if('overrideMimeType' in $xmlhttp){$xmlhttp.overrideMimeType("text/plain")}
    $xmlhttp.send()
    if(res.constructor===Error){res.name="NotFoundError"; throw res} // module not found
    return res
}

function $import_js_module(module,alias,names,filepath,module_contents){
    eval(module_contents)
    // check that module name is in namespace
    if(eval('$module')===undefined){
        throw ImportError("name '$module' is not defined in module")
    }
    // add class and __str__
    $module.__class__ = $type
    $module.__repr__ = function(){return "<module '"+module+"' from "+filepath+" >"}
    $module.__str__ = function(){return "<module '"+module+"' from "+filepath+" >"}
    $module.__file__ = filepath
   
    return $module
}

function $import_module_search_path(module,alias,names){
  // this module is needed by $import_from, so don't remove
  return $import_module_search_path_list(module,alias,names,__BRYTHON__.path);
}

function $import_module_search_path_list(module,alias,names,path_list){
    var modnames = [module, module+'/__init__']
    var import_mod = [$import_py]
    for(var i=0;i<path_list.length;i++){
       for(var j=0; j < modnames.length; j++) {
           var path = path_list[i] + "/" + modnames[j];
           for (var k=0; k < import_mod.length; k++) {
               try {return import_mod[k](module,alias,names,path)
               }catch(err){if(err.name!=="NotFoundError"){throw err}
               }
           }
       }
    }
    // if we get here, we couldn't import the module
    throw ImportError("No module named '"+module+"'")
}

function $import_py(module,alias,names,path){
    // import Python modules, in the same folder as the HTML page with
    // the Brython script
    var module_contents=$download_module(module, path+'.py')
    return $import_py_module(module,alias,names,path+'.py',module_contents)
}

function $import_py_module(module,alias,names,path,module_contents) {
    __BRYTHON__.$py_module_path[module]=path
    __BRYTHON__.$py_module_alias[module]=alias

    var root = __BRYTHON__.py2js(module_contents,module)
    var body = root.children
    root.children = []
    // use the module pattern : module name returns the results of an anonymous function
    var mod_node = new $Node('expression')
    if(names!==undefined){alias='$module'}
    new $NodeJSCtx(mod_node,'$module=(function()')
    root.insert(0,mod_node)
    mod_node.children = body
    // search for module-level names : functions, classes and variables
    var mod_names = []
    for(var i=0;i<mod_node.children.length;i++){
        var node = mod_node.children[i]
        // use function get_ctx() 
        // because attribute 'context' is renamed by make_dist...
        var ctx = node.get_ctx().tree[0]
        if(ctx.type==='def'||ctx.type==='class'){
            if(mod_names.indexOf(ctx.name)===-1){mod_names.push(ctx.name)}
        }else if(ctx.type==='from') {
            for (var j=0; j< ctx.names.length; j++) {
              if(mod_names.indexOf(ctx.names[j])===-1){mod_names.push(ctx.names[j])}
            }
        }else if(ctx.type==='assign'){
            var left = ctx.tree[0]
            if(left.type==='expr'&&left.tree[0].type==='id'&&left.tree[0].tree.length===0){
                var id_name = left.tree[0].value
                if(mod_names.indexOf(id_name)===-1){mod_names.push(id_name)}
            }
        }
    }
    // create the object that will be returned when the anonymous function is run
    var ret_code = 'return {'
    for(var i=0;i<mod_names.length;i++){
        ret_code += mod_names[i]+':'+mod_names[i]+','
    }
    ret_code += '__getattr__:function(attr){if(this[attr]!==undefined){return this[attr]}'
    ret_code += 'else{throw AttributeError("module '+module+' has no attribute \''+'"+attr+"\'")}},'
    ret_code += '__setattr__:function(attr,value){this[attr]=value}'
    ret_code += '}'
    var ret_node = new $Node('expression')
    new $NodeJSCtx(ret_node,ret_code)
    mod_node.add(ret_node)
    // add parenthesis for anonymous function execution
    
    var ex_node = new $Node('expression')
    new $NodeJSCtx(ex_node,')()')
    root.add(ex_node)
    
    try{
        var js = root.to_js()
        eval(js)
        // add class and __str__
        $module.__class__ = $type
        $module.__repr__ = function(){return "<module '"+module+"' from "+path+" >"}
        $module.__str__ = function(){return "<module '"+module+"' from "+path+" >"}
        $module.__file__ = path
        return $module
    }catch(err){
        eval('throw '+err.name+'(err.message)')
    }
}

$import_funcs = [$import_js, $import_module_search_path]

function $import_single(name,alias,names){
    for(var j=0;j<$import_funcs.length;j++){
        try{var mod=$import_funcs[j](name,alias,names)
            __BRYTHON__.modules[name]=mod
            __BRYTHON__.$py_module_alias[name]=alias
            return mod
        } catch(err){
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

function $import_list(modules){ // list of objects with attributes name and alias
    var res = []
    for(var i=0;i<modules.length;i++){
        var module = modules[i][0]
        var mod;
        if(__BRYTHON__.modules[module]===undefined){
           __BRYTHON__.modules[module]={}  // this could be a recursive import, so lets set modules={}
           mod = $import_single(modules[i][0],modules[i][1])
          // __BRYTHON__.modules[module]=mod  // not needed, done in import_single
        } else{
           mod=__BRYTHON__.modules[module]
        }
        res.push(mod)
        __BRYTHON__.$py_module_alias[modules[i][0]]=modules[i][1]
    }
    return res
}

function $import_from(module,names,parent_module,alias){
    //console.log(module +","+names+","+parent_module+','+alias);
    if (parent_module !== undefined) {
       //this is a relative path import
       // ie,  from .mymodule import a,b,c
       //get parent module

       var relpath=__BRYTHON__.$py_module_path[parent_module]
       var i=relpath.lastIndexOf('/')
       relpath=relpath.substring(0, i)
    
       if (module === 'undefined') {
          // from . import mymodule
          var res=[]
          for (var i=0; i < names.length; i++) {
              console.log(names[i])
              res.push($import_module_search_path_list(names[i],alias,names[i],[relpath]))
          }
          return res
       }

       // todo: does the next statement make sense? 
       alias=__BRYTHON__.$py_module_alias[parent_module]
      // console.log(parent_module+','+alias+','+relpath)
       return $import_module_search_path_list(module,alias,names,[relpath])
    } else if (alias !== undefined) {
       return $import_single(modules,alias,names)
    } 

    return $import_single(modules,names,names)
}
