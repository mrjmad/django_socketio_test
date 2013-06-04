var $operators = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","**":"pow","//":"floordiv","<<":"lshift",">>":"rshift",
    "+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod","&=":"iand","|=":"ior","^=":"ixor","**=":"ipow",
    "+":"add","-":"sub","*":"mul",
    "/":"truediv","%":"mod","&":"and","|":"or","~":"invert",
    "^":"xor","<":"lt",">":"gt",
    "<=":"le",">=":"ge","==":"eq","!=":"ne",
    "or":"or","and":"and", "in":"in", //"not":"not",
    "is":"is","not_in":"not_in","is_not":"is_not" // fake
    }
// operators weight for precedence
var $op_order = [['or'],['and'],
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
for (var $i=0;$i<$op_order.length;$i++){
    for(var $j=0;$j<$op_order[$i].length;$j++){
        $op_weight[$op_order[$i][$j]]=$weight
    }
    $weight++
}

var $augmented_assigns = {
    "//=":"ifloordiv",">>=":"irshift","<<=":"ilshift",
    "**=":"ipow","+=":"iadd","-=":"isub","*=":"imul","/=":"itruediv",
    "%=":"imod","^=":"ipow"
}

function $_SyntaxError(context,msg,indent){
    console.log('syntax error '+msg)
    var ctx_node = context
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var module = tree_node.module
    var line_num = tree_node.line_num
    document.$line_info = [line_num,module]
    if(indent===undefined){$SyntaxError(module,'invalid syntax',$pos)}
    else{throw $IndentationError(module,msg,$pos)}
}

var $first_op_letter = {}
for($op in $operators){$first_op_letter[$op.charAt(0)]=0}

function $Node(type){
    this.type = type
    this.children=[]
    this.add = function(child){
        this.children.push(child)
        child.parent = this
    }
    this.insert = function(pos,child){
        this.children.splice(pos,0,child)
        child.parent = this
    }
    this.toString = function(){return "<object 'Node'>"} 
    this.show = function(indent){
        var res = ''
        if(this.type==='module'){
            for(var i=0;i<this.children.length;i++){
                res += this.children[i].show(indent)
            }
        }else{
            indent = indent || 0
            for(var i=0;i<indent;i++){res+=' '}
            res += this.context
            if(this.children.length>0){res += '{'}
            res +='\n'
            for(var i=0;i<this.children.length;i++){
                res += '['+i+'] '+this.children[i].show(indent+4)
            }
            if(this.children.length>0){
                for(var i=0;i<indent;i++){res+=' '}
                res+='}\n'
            }
        }
        return res
   }
    this.to_js = function(indent){
        var res = ''
        if(this.type==='module'){
            for(var i=0;i<this.children.length;i++){
                res += this.children[i].to_js(indent)
            }
        }else{
            indent = indent || 0
            var ctx_js = this.context.to_js(indent)
            if(ctx_js){ // empty for "global x"
                for(var i=0;i<indent;i++){res+=' '}
                res += ctx_js
                if(this.children.length>0){res += '{'}
                res +='\n'
                for(var i=0;i<this.children.length;i++){
                    res += this.children[i].to_js(indent+4)
                }
                if(this.children.length>0){
                    for(var i=0;i<indent;i++){res+=' '}
                    res+='}\n'
                }
            }
        }
        return res
    }
    this.transform = function(rank){
        var res = ''
        if(this.type==='module'){
            var i=0
            while(i<this.children.length){
                var node = this.children[i]
                this.children[i].transform(i)
                i++
            }
        }else{
            var elt=this.context.tree[0]
            if(elt.transform !== undefined){
                elt.transform(this,rank)
            }
            var i=0
            while(i<this.children.length){
                this.children[i].transform(i)
                i++
            }
        }
    }
    this.get_ctx = function(){return this.context}
}

var $loop_id=0

function $AbstractExprCtx(context,with_commas){
    this.type = 'abstract_expr'
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(abstract_expr '+with_commas+') '+this.tree}
    this.to_js = function(){
        if(this.type==='list'){return '['+$to_js(this.tree)+']'}
        else{return $to_js(this.tree)}
    }
}

function $AssertCtx(context){
    this.type = 'assert'
    this.toString = function(){return '(assert) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.transform = function(node,rank){
        // transform "assert cond" into "if not cond: throw AssertionError"
        var new_ctx = new $ConditionCtx(node.context,'if')
        var not_ctx = new $NotCtx(new_ctx)
        not_ctx.tree = [this.tree[0]]
        node.context = new_ctx
        var new_node = new $Node('expression')
        var js = 'throw AssertionError("")'
        if(this.tree.length==2){
            js = 'throw AssertionError(str('+this.tree[1].to_js()+'))'
        }
        new $NodeJSCtx(new_node,js)
        node.add(new_node)
    }
}

function $AssignCtx(context){
    // context is the left operand of assignment
    this.type = 'assign'
    // replace parent by this in parent tree
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.parent = context.parent
    this.tree = [context]
    this.toString = function(){return '(assign) '+this.tree[0]+'='+this.tree[1]}
    this.transform = function(node,rank){
        // rank is the rank of this line in node
        var left = this.tree[0]
        while(left.type==='assign'){ // chained assignment : x=y=z
            var new_node = new $Node('expression')
            var node_ctx = new $NodeCtx(new_node)
            node_ctx.tree = [left]
            node.parent.insert(rank+1,new_node)
            this.tree[0] = left.tree[1]
            left = this.tree[0]
        }
        var left_items = null
        if(left.type==='expr' && left.tree.length>1){
            var left_items = left.tree
        }else if(left.type==='expr' && 
            (left.tree[0].type==='list_or_tuple'||left.tree[0].type==='target_list')){
            var left_items = left.tree[0].tree
        }else if(left.type==='target_list'){
            var left_items = left.tree
        }else if(left.type==='list_or_tuple'){
            var left_items = left.tree
        }
        if(left_items===null){return} // no transformation
        var right = this.tree[1]
        var right_items = null
        if(right.type==='list'||right.type==='tuple'||
            (right.type==='expr' && right.tree.length>1)){
                var right_items = right.tree
        }
        if(right_items!==null){ // form x,y=a,b
            if(right_items.length>left_items.length){
                throw Error('ValueError : too many values to unpack (expected '+left_items.length+')')
            }else if(right_items.length<left_items.length){
                throw Error('ValueError : need more than '+right_items.length+' to unpack')
            }
            var new_nodes = []
            // replace original line by dummy line : the next one might also
            // be a multiple assignment
            var new_node = new $Node('expression')
            new $NodeJSCtx(new_node,'void(0)')
            new_nodes.push(new_node)
            
            var new_node = new $Node('expression')
            new $NodeJSCtx(new_node,'var $temp'+$loop_num+'=[]')
            new_nodes.push(new_node)

            for(var i=0;i<right_items.length;i++){
                var js = '$temp'+$loop_num+'.push('+right_items[i].to_js()+')'
                var new_node = new $Node('expression')
                new $NodeJSCtx(new_node,js)
                new_nodes.push(new_node)
            }
            for(var i=0;i<left_items.length;i++){
                var new_node = new $Node('expression')
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                var assign = new $AssignCtx(left_items[i]) // assignment to left operand
                assign.tree[1] = new $JSCode('$temp'+$loop_num+'['+i+']')
                new_nodes.push(new_node)
            }
            node.parent.children.splice(rank,1) // remove original line
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
            }
            $loop_num++
        }else{ // form x,y=a
            // evaluate right argument (it might be a function call)
            var new_node = new $Node('expression')
            new $NodeJSCtx(new_node,'$right='+right.to_js())
            var new_nodes = [new_node]
            for(var i=0;i<left_items.length;i++){
                var new_node = new $Node('expression')
                var context = new $NodeCtx(new_node) // create ordinary node
                left_items[i].parent = context
                var assign = new $AssignCtx(left_items[i]) // assignment to left operand
                assign.tree[1] = new $JSCode('$right.__item__('+i+')')
                new_nodes.push(new_node)
            }
            node.parent.children.splice(rank,1) // remove original line
            for(var i=new_nodes.length-1;i>=0;i--){
                node.parent.insert(rank,new_nodes[i])
            }
        }
    }
    this.to_js = function(){
        if(this.parent.type==='call'){ // like in foo(x=0)
            return '$Kw('+this.tree[0].to_js()+','+this.tree[1].to_js()+')'
        }else{ // assignment
            var left = this.tree[0]
            if(left.type==='expr'){
                left=left.tree[0]
            }
            var right = this.tree[1]
            if(left.type==='attribute'){ // assign to attribute or item ?
                left.func = 'setattr'
                var res = left.to_js()
                left.func = 'getattr'
                res = res.substr(0,res.length-1) // remove trailing )
                res += ','+right.to_js()+')'
                return res
            }else if(left.type==='sub'){
                left.func = 'setitem' // just for to_js()
                var res = left.to_js()
                res = res.substr(0,res.length-1) // remove trailing )
                left.func = 'getitem' // restore default function
                res += ','+right.to_js()+')'
                //last_str = last_str.substr(0,last_str.length-1) // remove trailing )
                //res += last_str+','+right.to_js()+')'
                return res
            }
            var scope = $get_scope(this)
            if(scope===null){
                return left.to_js()+'='+right.to_js()
            }else if(scope.ntype==='def'){
                // assignment in a function : depends if variable is local
                // or global
                if(scope.globals && scope.globals.indexOf(left.value)>-1){
                    return left.to_js()+'='+right.to_js()
                }else{ // local to scope : prepend 'var'
                    var scope_id = scope.context.tree[0].id
                    var locals = __BRYTHON__.scope[scope_id].locals
                    if(locals.indexOf(left.to_js())===-1){
                        locals.push(left.to_js())
                    }
                    var res = 'var '+left.to_js()+'='
                    res += '$locals["'+left.to_js()+'"]='+right.to_js()
                    return res
                }
            }else if(scope.ntype==='class'){
                // assignment in a class : creates a class attribute
                var attr = left.to_js()
                return 'var '+attr+' = $class.'+attr+'='+right.to_js()
            }
        }
    }
}

function $AttrCtx(context){
    this.type = 'attribute'
    this.value = context.tree[0]
    this.parent = context
    context.tree.pop()
    context.tree.push(this)
    this.tree = []
    this.func = 'getattr' // becomes setattr for an assignment 
    this.toString = function(){return '(attr) '+this.value+'.'+this.name}
    this.to_js = function(){
        var name = this.name
        if(name.substr(0,2)==='$$'){name=name.substr(2)}
        if(name!=='__getattr__'){name='__'+this.func+'__("'+name+'")'}
        return this.value.to_js()+'.'+name
    }
}

function $BodyCtx(context){
    // inline body for def, class, if, elif, else, try...
    // creates a new node, child of context node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var body_node = new $Node('expression')
    tree_node.insert(0,body_node)
    return new $NodeCtx(body_node)
}

function $CallArgCtx(context){
    this.type = 'call_arg'
    this.toString = function(){return 'call_arg '+this.tree}
    this.parent = context
    this.start = $pos
    this.tree = []
    context.tree.push(this)
    this.expect='id'
    this.to_js = function(){return $to_js(this.tree)}
}

function $CallCtx(context){
    this.type = 'call'

    this.func = context.tree[0]
    if(this.func!==undefined){ // undefined for lambda
        this.func.parent = this
    }
    this.parent = context
    context.tree.pop()
    context.tree.push(this)
    this.tree = []
    this.start = $pos

    this.toString = function(){return '(call) '+this.func+'('+this.tree+')'}

    this.to_js = function(){
        if(this.func!==undefined && 
            ['eval','exec'].indexOf(this.func.value)>-1){
            // get module
            var ctx_node = this
            while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
            var module = ctx_node.node.module
            arg = this.tree[0].to_js()
            return 'eval(__BRYTHON__.py2js('+arg+',"'+module+',exec").to_js())'
        }
        else if(this.func!==undefined && this.func.value ==='locals'){
            var scope = $get_scope(this)
            if(scope !== null && scope.ntype==='def'){
                return 'locals("'+scope.context.tree[0].id+'")'
            }
        }
        if(this.tree.length>0){
            return this.func.to_js()+'.__call__('+$to_js(this.tree)+')'
        }else{return this.func.to_js()+'.__call__()'}
    }
}

function $ClassCtx(context){
    this.type = 'class'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.toString = function(){return '(class) '+this.name+' '+this.tree}
    this.transform = function(node,rank){
        // insert "$class = new Object"
        var instance_decl = new $Node('expression')
        new $NodeJSCtx(instance_decl,'var $class = new Object()')
        node.insert(0,instance_decl)

        // return $class at the end of class definition
        var ret_obj = new $Node('expression')
        new $NodeJSCtx(ret_obj,'return $class')
        node.insert(node.children.length,ret_obj) 
       
        // close function and run it
        var run_func = new $Node('expression')
        new $NodeJSCtx(run_func,')()')
        node.parent.insert(rank+1,run_func)

        // class constructor
        var scope = $get_scope(this)
        if(scope===null||scope.ntype!=='class'){
            js = 'var '+this.name
        }else{
            js = 'var '+this.name+' = $class.'+this.name
        }
        js += '=$class_constructor("'+this.name+'",$'+this.name
        if(this.tree.length>0 && this.tree[0].tree.length>0){
            js += ','+$to_js(this.tree[0].tree)
        }
        js += ')'
        var cl_cons = new $Node('expression')
        new $NodeJSCtx(cl_cons,js)
        node.parent.insert(rank+2,cl_cons)
        // add declaration of class at window level
        if(scope===null && this.parent.node.module==='__main__'){
            js = 'window.'+this.name+'='+this.name
            var w_decl = new $Node('expression')
            new $NodeJSCtx(w_decl,js)
            node.parent.insert(rank+3,w_decl)
        }
    }
    this.to_js = function(){
        return 'var $'+this.name+'=(function()'
    }
}

function $CompIfCtx(context){
    this.type = 'comp_if'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comp if) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ComprehensionCtx(context){
    this.type = 'comprehension'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comprehension) '+this.tree}
    this.to_js = function(){
        var intervals = []
        for(var i=0;i<this.tree.length;i++){
            intervals.push(this.tree[i].start)
        }
        return intervals
    }
}

function $CompForCtx(context){
    this.type = 'comp_for'
    context.parent.intervals.push($pos)
    this.parent = context
    this.tree = []
    this.expect = 'in'
    context.tree.push(this)
    this.toString = function(){return '(comp for) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $CompIterableCtx(context){
    this.type = 'comp_iterable'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(comp iter) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ConditionCtx(context,token){
    this.type = 'condition'
    this.token = token
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return this.token+' '+this.tree}
    this.to_js = function(){
        var tok = this.token
        if(tok==='elif'){tok='else if'}
        if(this.tree.length==1){
            var res = tok+'(bool('+$to_js(this.tree)+'))'
        }else{ // syntax "if cond : do_something" in the same line
            var res = tok+'(bool('+this.tree[0].to_js()+'))'
            if(this.tree[1].tree.length>0){
                res += '{'+this.tree[1].to_js()+'}'
            }
        }
        return res
    }
}

function $DecoratorCtx(context){
    this.type = 'decorator'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.toString = function(){return '(decorator) '+this.tree}
    this.transform = function(node,rank){
        var func_rank=rank+1,children=node.parent.children
        var decorators = [this.tree]
        while(true){
            if(func_rank>=children.length){$_SyntaxError(context)}
            else if(children[func_rank].context.tree[0].type==='decorator'){
                decorators.push(children[func_rank].context.tree[0].tree)
                children.splice(func_rank,1)
            }else{break}
        }
        var obj = children[func_rank].context.tree[0]
        // add a line after decorated element
        var callable = children[func_rank].context
        var res = obj.name+'=',tail=''
        var scope = $get_scope(this)
        if(scope !==null && scope.ntype==='class'){
            res += '$class.'+obj.name+'='
        }
        for(var i=0;i<decorators.length;i++){
            res += $to_js(decorators[i])+'('
            tail +=')'
        }
        res += obj.name+tail
        var decor_node = new $Node('expression')
        new $NodeJSCtx(decor_node,res)
        node.parent.children.splice(func_rank+1,0,decor_node)
    }
    this.to_js = function(){return ''}
}
function $DefCtx(context){
    this.type = 'def'
    this.name = null
    this.parent = context
    this.tree = []
    this.id = Math.random().toString(36).substr(2,8)
    __BRYTHON__.scope[this.id] = this
    this.locals = []
    context.tree.push(this)
    this.toString = function(){return 'def '+this.name+'('+this.tree+')'}
    this.transform = function(node,rank){
        // already transformed ?
        if(this.transformed!==undefined){return}
        this.rank = rank // save rank if we must add generator declaration
        // if function inside a class, the first argument represents
        // the instance
        var scope = $get_scope(this)
        var required = ''
        var defaults = ''
        var other_args = null
        var other_kw = null
        var env = []
        for(var i=0;i<this.tree[0].tree.length;i++){
            var arg = this.tree[0].tree[i]
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
        this.env = env
        if(required.length>0){required=required.substr(0,required.length-1)}
        if(defaults.length>0){defaults=defaults.substr(0,defaults.length-1)}
        // add 2 lines of code to node children
        var js = 'var $ns=$MakeArgs("'+this.name+'",arguments,['+required+'],'
        js += '{'+defaults+'},'+other_args+','+other_kw+')'
        var new_node1 = new $Node('expression')
        new $NodeJSCtx(new_node1,js)
        var js = 'for($var in $ns){eval("var "+$var+"=$ns[$var]")}'
        var new_node2 = new $Node('expression')
        new $NodeJSCtx(new_node2,js)
        var js = 'var $locals = __BRYTHON__.scope["'+this.id+'"].__dict__=$ns'
        var new_node3 = new $Node('expression')
        new $NodeJSCtx(new_node3,js)
        node.children.splice(0,0,new_node1,new_node2,new_node3)

        // wrap function body in a try/catch
        var def_func_node = new $Node('expression')
        new $NodeJSCtx(def_func_node,'return function()')

        var try_node = new $Node('expression')
        new $NodeJSCtx(try_node,'try')

        for(var i=0;i<node.children.length;i++){
            try_node.add(node.children[i])
        }

        def_func_node.add(try_node)
        var ret_node = new $Node('expression')
        var catch_node = new $Node('expression')
        var js = 'catch(err'+$loop_num+')'
        js += '{if(err'+$loop_num+'.py_error!==undefined){$report(err'+$loop_num+')}'
        js += 'else{throw RuntimeError(err'+$loop_num+'.message)}}'
        new $NodeJSCtx(catch_node,js)
        node.children = []
        def_func_node.add(catch_node)
        node.add(def_func_node)

        var txt = ')('
        for(var i=0;i<this.env.length;i++){
            txt += this.env[i]
            if(i<this.env.length-1){txt += ','}
        }
        new $NodeJSCtx(ret_node,txt+')')
        node.parent.insert(rank+1,ret_node)
        
        var offset = 2

        
        // add function name
        js = this.name+'.__name__'
        if(scope !==null && scope.ntype==='class'){
            js += '=$class.'+this.name+'.__name__'
        }
        js += '="'+this.name+'"'
        if(scope !==null && scope.ntype==='def'){
            // add to $locals
            js += ';$locals["'+this.name+'"]='+this.name
        }
        var name_decl = new $Node('expression')
        new $NodeJSCtx(name_decl,js)
        node.parent.children.splice(rank+offset,0,name_decl)
        offset++

        // add declaration of function at window level
        if(scope===null && node.module==='__main__'){
            js = 'window.'+this.name+'='+this.name
            new_node1 = new $Node('expression')
            new $NodeJSCtx(new_node1,js)
            node.parent.children.splice(rank+offset,0,new_node1)
        }
        this.transformed = true
    }
    this.add_generator_declaration = function(){
        // if generator, add line 'foo = $generator($foo)'
        var scope = $get_scope(this)
        var node = this.parent.node
        if(this.type==='generator'){
            var offset = 2
            if(this.decorators !== undefined){offset++}
            js = this.name
            js = '$generator($'+this.name+')'
            var gen_node = new $Node('expression')
            var ctx = new $NodeCtx(gen_node)
            var expr = new $ExprCtx(ctx,'id',false)
            var name_ctx = new $IdCtx(expr,this.name)
            var assign = new $AssignCtx(expr)
            var expr1 = new $ExprCtx(assign,'id',false)
            var js_ctx = new $NodeJSCtx(assign,js)
            expr1.tree.push(js_ctx)
            node.parent.insert(this.rank+offset,gen_node)        
            if(scope !== null && scope.ntype==='class'){
                var cl_node = new $Node('expression')
                new $NodeJSCtx(cl_node,"$class."+this.name+'='+this.name)
                node.parent.insert(this.rank+offset+1,cl_node)
            }
        }
    }

    this.to_js = function(){
        var scope = $get_scope(this)
        var name = this.name
        if(this.type==='generator'){name='$'+name}
        if(scope===null || scope.ntype!=='class'){
            res = name+'= (function ('
        }else{
            res = 'var '+name+' = $class.'+name+'= (function ('
        }
        for(var i=0;i<this.env.length;i++){
            res+=this.env[i]
            if(i<this.env.length-1){res+=','}
        }
        res += ')'
        return res
    }
}

function $DelCtx(context){
    this.type = 'del'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.toString = function(){return 'del '+this.tree}
    this.to_js = function(){
        res = []
        var tree = this.tree[0].tree
        for(var i=0;i<tree.length;i++){
            var expr = tree[i]
            if(expr.type==='expr'||expr.type==='id'){
                res.push('delete '+expr.to_js())
            }else if(expr.type==='sub'){
                expr.func = 'delitem'
                res.push(expr.to_js())
                expr.func = 'getitem'
            }else{
                throw SyntaxError("wrong argument for del "+expr.type)
            }
        }
        return res.join(';')
    }
}

function $DictCtx(context){
    // context is the first key
    this.type = 'dict'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    context.name = 'dict_key'
    this.tree = [context]
    this.expect = ','
    this.toString = function(){return 'dict '+this.tree}
}

function $DictOrSetCtx(context){
    // the real type (dist or set) is set inside $transition
    // as attribute 'real'
    this.type = 'dict_or_set'
    this.real = 'dict_or_set'
    this.expect = 'id'
    this.closed = false
    this.start = $pos
    this.toString = function(){
        if(this.real==='dict'){return '(dict) {'+this.tree+'}'}
        else if(this.real==='set'){return '(set) {'+this.tree+'}'}
        else{return '(dict_or_set) {'+this.tree+'}'}
    }
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){
        if(this.real==='dict'){
            var res = 'dict(['
            for(var i=0;i<this.items.length;i+=2){
                res+='['+this.items[i].to_js()+','+this.items[i+1].to_js()+']'
                if(i<this.items.length-2){res+=','}
            }
            return res+'])'+$to_js(this.tree)
        }else if(this.real==='set_comp'){return 'set('+$to_js(this.items)+')'+$to_js(this.tree)}
        else if(this.real==='dict_comp'){
            var key_items = this.items[0].expression[0].to_js()
            var value_items = this.items[0].expression[1].to_js()
            return 'dict('+$to_js(this.items)+')'+$to_js(this.tree)
        }else{return 'set(['+$to_js(this.items)+'])'+$to_js(this.tree)}
    }
}

function $DoubleStarArgCtx(context){
    this.type = 'double_star_arg'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '**'+this.tree}
    this.to_js = function(){return '$pdict('+$to_js(this.tree)+')'}
}

function $ExceptCtx(context){
    this.type = 'except'
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.expect = 'id'
    this.toString = function(){return '(except) '}
    this.to_js = function(){
        // in method "transform" of $TryCtx instances, related
        // $ExceptCtx instances receive an attribute __name__
        if(this.tree.length===0){return 'else'}
        else if(this.tree.length===1 && this.tree[0].name==='Exception'){
            return 'else if(true)'
        }else{
            var res ='else if(['
            for(var i=0;i<this.tree.length;i++){
                res+='"'+this.tree[i].name+'"'
                if(i<this.tree.length-1){res+=','}
            }
            res +='].indexOf('+this.error_name+'.__name__)>-1)'
            return res
        }
    }
}

function $ExprCtx(context,name,with_commas){
    this.type = 'expr'
    this.name = name
    // allow expression with comma-separted values, or a single value ?
    this.with_commas = with_commas
    this.expect = ',' // can be 'expr' or ','
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(expr '+with_commas+') '+this.tree}
    this.to_js = function(){
        if(this.type==='list'){return '['+$to_js(this.tree)+']'}
        else if(this.tree.length===1){return this.tree[0].to_js()}
        else{return 'tuple('+$to_js(this.tree)+')'}
    }
}

function $ExprNot(context){ // used for 'x not', only accepts 'in' as next token
    this.type = 'expr_not'
    this.toString = function(){return '(expr_not)'}
    this.parent = context
    this.tree = []
    context.tree.push(this)
}

function $FloatCtx(context,value){
    this.type = 'float'
    this.value = value
    this.toString = function(){return 'float '+this.value}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'float('+this.value+')'}
}

function $ForTarget(context){
    this.type = 'for_target'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return 'for_target'+' '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $ForExpr(context){
    this.type = 'for'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(for) '+this.tree}
    this.transform = function(node,rank){
        var new_nodes = []
        var new_node = new $Node('expression')
        var target = this.tree[0]
        var iterable = this.tree[1]
        new $NodeJSCtx(new_node,'var $iter'+$loop_num+'='+iterable.to_js())
        new_nodes.push(new_node)

        new_node = new $Node('expression')
        var js = 'for(var $i'+$loop_num+'=0;$i'+$loop_num
        js += '<$iter'+$loop_num+'.__len__();$i'+$loop_num+'++)'
        new $NodeJSCtx(new_node,js)
        new_nodes.push(new_node)

        // save original node children
        var children = node.children
        // replace original line by these 2 lines
        node.parent.children.splice(rank,1)
        for(var i=new_nodes.length-1;i>=0;i--){
            node.parent.insert(rank,new_nodes[i])
        }

        var new_node = new $Node('expression')
        node.insert(0,new_node)
        var context = new $NodeCtx(new_node) // create ordinary node
        var target_expr = new $ExprCtx(context,'left',true)
        target_expr.tree = target.tree
        var assign = new $AssignCtx(target_expr) // assignment to left operand
        assign.tree[1] = new $JSCode('$iter'+$loop_num+'.__item__($i'+$loop_num+')')
        // set new loop children
        node.parent.children[rank+1].children = children
        $loop_num++
    }
    this.to_js = function(){
        var iterable = this.tree.pop()
        return 'for '+$to_js(this.tree)+' in '+iterable.to_js()
    }
}

function $FromCtx(context){
    this.type = 'from'
    this.parent = context
    this.names = []
    this.aliases = {}
    context.tree.push(this)
    this.expect = 'module'
    this.toString = function(){return '(from) '+this.module+' (import) '+this.names + '(parent module)' + this.parent_module + '(as)' + this.aliases}
    this.to_js = function(){
        var res; 
        if (this.parent_module!==undefined){
           res="$mod=$import_from('" + this.module
           res+= "', ['" + this.names.join("','") + "']"
           res+=",'" + this.parent_module +"');"
           for(var i=0;i<this.names.length;i++){
             res += this.parent_module+'.__setattr__("'+(this.aliases[this.names[i]]||this.names[i])+'",$mod.__getattr__("'+this.names[i]+'"));'
           }

           //console.log(res)
        } else {
           res = '$mod=$import_list([["'+this.module+'","'+this.module+'"]])[0];'
        
           if(this.names[0]!=='*'){
             for(var i=0;i<this.names.length;i++){
              res += (this.aliases[this.names[i]]||this.names[i])+'=$mod.__getattr__("'+this.names[i]+'");'
             }
           }else{
             res +='for(var $attr in $mod){'
             res +="if($attr.substr(0,1)!=='_'){eval('var '+$attr+'=$mod["+'"'+"'+$attr+'"+'"'+"]')}}"
           }
        }
        return res
    }
}

function $FuncArgs(context){
    this.type = 'func_args'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return 'func args '+this.tree}
    this.expect = 'id'
    this.has_default = false
    this.has_star_arg = false
    this.has_kw_arg = false
    this.to_js = function(){return $to_js(this.tree)}
}

function $FuncArgIdCtx(context,name){
    // id in function arguments
    // may be followed by = for default value
    this.type = 'func_arg_id'
    this.name = name
    this.parent = context
    this.tree = []
    context.tree.push(this)
    // add to locals of function
    var ctx = context
    while(ctx.parent!==undefined){
        if(ctx.type==='def'){
            ctx.locals.push(name)
            break
        }
        ctx = ctx.parent
    }    
    this.toString = function(){return 'func arg id '+this.name +'='+this.tree}
    this.expect = '='
    this.to_js = function(){return this.name+$to_js(this.tree)}
}

function $FuncStarArgCtx(context,op){
    this.type = 'func_star_arg'
    this.op = op
    this.parent = context
    context.tree.push(this)
    this.toString = function(){return '(func star arg '+this.op+') '+this.name}
}

function $GlobalCtx(context){
    this.type = 'global'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.toString = function(){return 'global '+this.tree}
    this.transform = function(node,rank){
        var scope = $get_scope(this)
        if(scope.globals===undefined){scope.globals=[]}
        for(var i=0;i<this.tree.length;i++){
            scope.globals.push(this.tree[i].value)
        }
    }
    this.to_js = function(){return ''}
}

function $IdCtx(context,value,minus){
    // minus is set if there is a unary minus before the id
    this.type = 'id'
    this.toString = function(){return '(id) '+this.value+':'+(this.tree||'')}
    this.value = value
    this.minus = minus
    this.parent = context
    this.tree = []
    context.tree.push(this)
    if(context.parent.type==='call_arg'){
        this.call_arg=true
    }
    var ctx = context
    while(ctx.parent!==undefined){
        if(['list_or_tuple','dict_or_set','call_arg','def','lambda'].indexOf(ctx.type)>-1){
            if(ctx.vars===undefined){ctx.vars=[value]}
            else if(ctx.vars.indexOf(value)===-1){ctx.vars.push(value)}
            if(this.call_arg&&ctx.type==='lambda'){
                if(ctx.locals===undefined){ctx.locals=[value]}
                else{ctx.locals.push(value)}
            }
        }
        ctx = ctx.parent
    }
    this.to_js = function(){
        var val = this.value
        if(['print','alert','eval','open'].indexOf(this.value)>-1){val = '$'+val}
        if(['locals','globals'].indexOf(this.value)>-1){
            if(this.parent.type==='call'){
                var scope = $get_scope(this)
                if(scope===null){new $StringCtx(this.parent,'"__main__"')}
                else{
                    var locals = scope.context.tree[0].locals
                    var res = '{'
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

function $ImportCtx(context){
    this.type = 'import'
    this.toString = function(){return 'import '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.expect = 'id'
    this.to_js = function(){
        var scope = $get_scope(this)
        var res = '$mods=$import_list(['+$to_js(this.tree)+']);'
        for(var i=0;i<this.tree.length;i++){
            if(scope!==null && ['def','class'].indexOf(scope.ntype)>-1){
                res += 'var '
            }
            res += this.tree[i].alias
            if(scope!==null && scope.ntype == 'def'){
                res += '=$locals["'+this.tree[i].alias+'"]'
            }            
            res += '=$mods['+i+'];'
        }
        return res 
    }
}

function $ImportedModuleCtx(context,name){
    this.toString = function(){return ' (imported module) '+this.name}
    this.parent = context
    this.name = name
    this.alias = name
    context.tree.push(this)
    this.to_js = function(){
        return '["'+this.name+'","'+this.alias+'"]'
    }
}

function $IntCtx(context,value){
    this.type = 'int'
    this.value = value
    this.toString = function(){return 'int '+this.value}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'Number('+this.value+')'}
}

function $JSCode(js){
    this.js = js
    this.toString = function(){return this.js}
    this.to_js = function(){return this.js}
}

function $KwArgCtx(context){
    this.type = 'kwarg'
    this.toString = function(){return 'kwarg '+this.tree[0]+'='+this.tree[1]}
    this.parent = context.parent
    this.tree = [context.tree[0]]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.to_js = function(){
        var key = this.tree[0].to_js()
        if(key.substr(0,2)=='$$'){key=key.substr(2)}
        var res = '$Kw("'+key+'",'
        res += $to_js(this.tree.slice(1,this.tree.length))+')'
        return res
    }
}

function $LambdaCtx(context){
    this.type = 'lambda'
    this.toString = function(){return '(lambda) '+this.args_start+' '+this.body_start}
    this.parent = context
    context.tree.push(this)
    this.tree = []
    this.args_start = $pos+6
    this.vars = []
    this.locals = []
    this.to_js = function(){
        var env = []
        for(var i=0;i<this.vars.length;i++){
            if(this.locals.indexOf(this.vars[i])===-1){
                env.push(this.vars[i])
            }
        }
        env_str = '{'
        for(var i=0;i<env.length;i++){
            env_str+="'"+env[i]+"':"+env[i]
            if(i<env.length-1){env_str+=','}
        }
        env_str += '}'
        var ctx_node = this
        while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
        var module = ctx_node.node.module
        var src = document.$py_src[module]
        var qesc = new RegExp('"',"g") // to escape double quotes in arguments

        var args = src.substring(this.args_start,this.body_start).replace(qesc,'\\"')
        var body = src.substring(this.body_start+1,this.body_end).replace(qesc,'\\"')
        return '$lambda('+env_str+',"'+args+'","'+body+'")'
    }
}

function $ListOrTupleCtx(context,real){
    // the real type (list or tuple) is set inside $transition
    // as attribute 'real'
    this.type = 'list_or_tuple'
    this.start = $pos
    this.real = real
    this.expect = 'id'
    this.closed = false
    this.toString = function(){
        if(this.real==='list'){return '(list) ['+this.tree+']'}
        else if(this.real==='list_comp'||this.real==='gen_expr'){
            return '('+this.real+') ['+this.intervals+'-'+this.tree+']'
        }else{return '(tuple) ('+this.tree+')'}
    }
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.is_comp = function(){
        return ['list_comp','gen_expr','dict_or_set_comp'].indexOf(this.real)>-1
    }
    this.get_src = function(){
        var ctx_node = this
        while(ctx_node.parent!==undefined){ctx_node=ctx_node.parent}
        var module = ctx_node.node.module
        return document.$py_src[module]
    }
    this.to_js = function(){
        if(this.real==='list'){return 'list(['+$to_js(this.tree)+'])'}
        else if(['list_comp','gen_expr','dict_or_set_comp'].indexOf(this.real)>-1){
            var src = this.get_src()
            var res = '{'
            for(var i=0;i<this.vars.length;i++){
                if(this.locals.indexOf(this.vars[i])===-1){
                    res += "'"+this.vars[i]+"':"+this.vars[i]
                    if(i<this.vars.length-1){res+=','}
                }
            }
            res += '},'
            var qesc = new RegExp('"',"g") // to escape double quotes in arguments
            for(var i=1;i<this.intervals.length;i++){
                var txt = src.substring(this.intervals[i-1],this.intervals[i])
                txt = txt.replace(/\n/g,' ')
                txt = txt.replace(/\\/g,'\\\\')
                txt = txt.replace(qesc,'\\"')
                res += '"'+txt+'"'
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
    this.node = node
    node.context = this
    this.tree = []
    this.type = 'node'
    this.toString = function(){return 'node '+this.tree}
    this.to_js = function(){
        if(this.tree.length>1){
            var new_node = new $Node('expression')
            var ctx = new $NodeCtx(new_node)
            ctx.tree = [this.tree[1]]
            new_node.indent = node.indent+4
            this.tree.pop()
            node.add(new_node)
        }
        return $to_js(this.tree)
    }
}

function $NodeJSCtx(node,js){ // used for raw JS code
    this.node = node
    node.context = this
    this.type = 'node_js'
    this.tree = [js]
    this.toString = function(){return 'js '+js}
    this.to_js = function(){return js}
}

function $NotCtx(context){
    this.type = 'not'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return 'not ('+this.tree+')'}
    this.to_js = function(){return '!bool('+$to_js(this.tree)+')'}
}

function $OpCtx(context,op){ // context is the left operand
    this.type = 'op'
    this.op = op
    this.toString = function(){return '(op '+this.op+')'+this.tree}
    this.parent = context.parent
    this.tree = [context]
    // operation replaces left operand
    context.parent.tree.pop()
    context.parent.tree.push(this)
    this.to_js = function(){
        if(this.op==='and'){
            var res ='$test_expr($test_item('+this.tree[0].to_js()+')&&'
            res += '$test_item('+this.tree[1].to_js()+'))'
            return res
        }else if(this.op==='or'){
            var res ='$test_expr($test_item('+this.tree[0].to_js()+')||'
            res += '$test_item('+this.tree[1].to_js()+'))'
            return res
        }else{
            var res = this.tree[0].to_js()
            if(this.op==="is"){
                res += '==='+this.tree[1].to_js()
            }else if(this.op==="is_not"){
                res += '!=='+this.tree[1].to_js()
            }else{
                res += '.__'+$operators[this.op]+'__('+this.tree[1].to_js()+')'
            }
            return res
        }
    }
}

function $PassCtx(context){
    this.type = 'pass'
    this.toString = function(){return '(pass)'}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'void(0)'}
}

function $RaiseCtx(context){
    this.type = 'raise'
    this.toString = function(){return ' (raise) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){
        if(this.tree.length===0){return '$raise()'}
        var exc = this.tree[0]
        if(exc.type==='id'){return 'throw '+exc.value+'("")'}
        else{return 'throw '+$to_js(this.tree)}
    }
}

function $ReturnCtx(context){ // subscription or slicing
    this.type = 'return'
    this.toString = function(){return 'return '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return 'return '+$to_js(this.tree)}
}

function $SingleKwCtx(context,token){ // used for finally,else
    this.type = 'single_kw'
    this.token = token
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return this.token}
    this.to_js = function(){return this.token}
}

function $StarArgCtx(context){
    this.type = 'star_arg'
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.toString = function(){return '(star arg) '+this.tree}
    this.to_js = function(){
        return '$ptuple('+$to_js(this.tree)+')'
    }
}

function $StringCtx(context,value){
    this.type = 'str'
    this.value = value
    this.toString = function(){return 'string '+this.value+' '+(this.tree||'')}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){
        return this.value.replace(/\n/g,' \\\n')+$to_js(this.tree,'')
    }

}

function $SubCtx(context){ // subscription or slicing
    this.type = 'sub'
    this.func = 'getitem' // set to 'setitem' if assignment
    this.toString = function(){return '(sub) '+this.tree}
    this.value = context.tree[0]
    context.tree.pop()
    context.tree.push(this)
    this.parent = context
    this.tree = []
    this.to_js = function(){
        var res = this.value.to_js()+'.__getattr__("__'+this.func+'__")('
        if(this.tree.length===1){
            return res+this.tree[0].to_js()+')'
        }else{
            res += 'slice('
            for(var i=0;i<this.tree.length;i++){
                if(this.tree[i].type==='abstract_expr'){res+='null'}
                else{res+=this.tree[i].to_js()}
                if(i<this.tree.length-1){res+=','}
            }
            return res+'))'
        }
    }
}

function $TargetCtx(context,name){ // exception
    this.toString = function(){return ' (target) '+this.name}
    this.parent = context
    this.name = name
    this.alias = null
    context.tree.push(this)
    this.to_js = function(){
        return '["'+this.name+'","'+this.alias+'"]'
    }
}

function $TargetListCtx(context){
    this.type = 'target_list'
    this.parent = context
    this.tree = []
    this.expect = 'id'
    context.tree.push(this)
    this.toString = function(){return '(target list) '+this.tree}
    this.to_js = function(){return $to_js(this.tree)}
}

function $TernaryCtx(context){
    this.type = 'ternary'
    this.parent = context.parent
    context.parent.tree.pop()
    context.parent.tree.push(this)
    context.parent = this
    this.tree = [context]
    this.toString = function(){return '(ternary) '+this.tree}
    this.to_js = function(){
        // build namespace
        var env = '{'
        var ids = $get_ids(this)
        for(var i=0;i<ids.length;i++){
            env += '"'+ids[i]+'":'+ids[i]
            if(i<ids.length-1){env+=','}
        }
        env+='}'
        var qesc = new RegExp('"',"g") // to escape double quotes in arguments
        var args = '"'+this.tree[1].to_js().replace(qesc,'\\"')+'","' // condition
        args += this.tree[0].to_js().replace(qesc,'\\"')+'","' // result if true
        args += this.tree[2].to_js().replace(qesc,'\\"') // result if false
        return '$ternary('+env+','+args+'")'
    }
}

function $TryCtx(context){
    this.type = 'try'
    this.parent = context
    context.tree.push(this)
    this.toString = function(){return '(try) '}
    this.transform = function(node,rank){
        if(node.parent.children.length===rank+1){
            $_SyntaxError(context,"missing clause after 'try' 1")
        }else{
            var next_ctx = node.parent.children[rank+1].context.tree[0]
            if(['except','finally','single_kw'].indexOf(next_ctx.type)===-1){
                $_SyntaxError(context,"missing clause after 'try' 2")
            }
        }
        // transform node into Javascript 'try' (necessary if
        // "try" inside a "for" loop
        new $NodeJSCtx(node,'try')
        // insert new 'catch' clause
        var catch_node = new $Node('expression')
        new $NodeJSCtx(catch_node,'catch($err'+$loop_num+')')
        node.parent.insert(rank+1,catch_node)
        
        // fake line to start the 'else if' clauses
        var new_node = new $Node('expression')
        new $NodeJSCtx(new_node,'if(false){void(0)}')
        catch_node.insert(0,new_node)
        
        var pos = rank+2
        var has_default = false // is there an "except:" ?
        var has_else = false // is there an "else" clause ?
        while(true){
            if(pos===node.parent.children.length){break}
            var ctx = node.parent.children[pos].context.tree[0]
            if(ctx.type==='except'){
                // move the except clauses below catch_node
                if(has_else){$_SyntaxError(context,"'except' or 'finally' after 'else'")}
                ctx.error_name = '$err'+$loop_num
                if(ctx.tree.length>0 && ctx.tree[0].alias!==null){
                    // syntax "except ErrorName as Alias"
                    var new_node = new $Node('expression')
                    var js = 'var '+ctx.tree[0].alias+'=__BRYTHON__.exception($err'+$loop_num+')'
                    new $NodeJSCtx(new_node,js)
                    node.parent.children[pos].insert(0,new_node)
                }
                catch_node.insert(catch_node.children.length,
                    node.parent.children[pos])
                if(ctx.tree.length===0){
                    if(has_default){$_SyntaxError(context,'more than one except: line')}
                    has_default=true
                }
                node.parent.children.splice(pos,1)
            }else if(ctx.type==='single_kw' && ctx.token==='finally'){
                if(has_else){$_SyntaxError(context,"'finally' after 'else'")}
                pos++
            }else if(ctx.type==='single_kw' && ctx.token==='else'){
                if(has_else){$_SyntaxError(context,"more than one 'else'")}
                has_else = true
                var else_children = node.parent.children[pos].children
                for(var i=0;i<else_children.length;i++){
                    node.add(else_children[i])
                }
                node.parent.children.splice(pos,1)
            }else{break}
        }
        if(!has_default){ 
            // if no default except: clause, add a line to throw the
            // exception if it was not caught
            var new_node = new $Node('expression')
            new $NodeJSCtx(new_node,'else{throw $err'+$loop_num+'}')
            catch_node.insert(catch_node.children.length,new_node)
        }
        $loop_num++
    }
    this.to_js = function(){return 'try'}
}

function $UnaryCtx(context,op){
    this.type = 'unary'
    this.op = op
    this.toString = function(){return '(unary) '+this.op+' ['+this.tree+']'}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.to_js = function(){return this.op+$to_js(this.tree)}
}

function $YieldCtx(context){ // subscription or slicing
    this.type = 'yield'
    this.toString = function(){return '(yield) '+this.tree}
    this.parent = context
    this.tree = []
    context.tree.push(this)
    this.transform = function(node,rank){
        if(this.transformed!==undefined){return}
        var scope = $get_scope(node.context.tree[0])
        // change type of function to generator
        scope.context.tree[0].type = 'generator'
        this.transformed = true
        this.func_name = scope.context.tree[0].name
        scope.context.tree[0].add_generator_declaration()
    }
    this.to_js = function(){
        return '$'+this.func_name+'.$iter.push('+$to_js(this.tree)+')'
    }
}


// used in loops
var $loop_num = 0
var $iter_num = 0 

function $add_line_num(node,rank){
    if(node.type==='module'){
        var i=0
        while(i<node.children.length){
            i += $add_line_num(node.children[i],i)
        }
    }else{
        var elt=node.context.tree[0],offset=1
        var flag = true
        // ignore lines added in transform()
        if(node.line_num===undefined){flag=false}
        // don't add line num before try,finally,else,elif
        if(elt.type==='condition' && elt.token==='elif'){flag=false}
        else if(elt.type==='except'){flag=false}
        else if(elt.type==='single_kw'){flag=false}
        if(flag){
            js = 'document.$line_info=['+node.line_num+',"'+node.module+'"]'
            var new_node = new $Node('expression')
            new $NodeJSCtx(new_node,js)
            node.parent.insert(rank,new_node)
            offset = 2
        }
        var i=0
        while(i<node.children.length){
            i += $add_line_num(node.children[i],i)
        }
        return offset
    }
}

function $augmented_assign(context,op){
    // in "foo += bar" context = foo, op = +
    var assign = new $AssignCtx(context)
    var new_op = new $OpCtx(context,op.substr(0,op.length-1))
    assign.tree.push(new_op)
    context.parent.tree.pop()
    context.parent.tree.push(assign)
    return new $AbstractExprCtx(new_op,false)
}

function $comp_env(context,attr,src){
    // update the attribute "attr" of all comprehensions above "context"
    // with the ids in "src"
    var ids = $get_ids(src)
    var ctx = context
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
        ctx = ctx.parent
    }
}

function $get_scope(context){
    // return the $Node indicating the scope of context
    // null for the script or a def $Node
    var ctx_node = context.parent
    while(ctx_node.type!=='node'){ctx_node=ctx_node.parent}
    var tree_node = ctx_node.node
    var scope = null
    while(tree_node.parent.type!=='module'){
        var ntype = tree_node.parent.context.tree[0].type
        if(['def','class'].indexOf(ntype)>-1){
            scope = tree_node.parent
            scope.ntype = ntype
            break
        }
        tree_node = tree_node.parent
    }
    return scope
}

function $get_ids(ctx){
    var res = []
    if(ctx.type==='expr' &&
        ctx.tree[0].type==='list_or_tuple' &&
        ctx.tree[0].real==='list_comp'){return []}
    if(ctx.type==='id'){res.push(ctx.value)}
    else if(ctx.type==='attribute'||ctx.type==='sub'){
        var res1 = $get_ids(ctx.value)
        for(var i=0;i<res1.length;i++){
            if(res.indexOf(res1[i])===-1){res.push(res1[i])}
        }
    }else if(ctx.type==='call'){
        var res1 = $get_ids(ctx.func)
        for(var i=0;i<res1.length;i++){
            if(res.indexOf(res1[i])===-1){res.push(res1[i])}
        }
    }
    if(ctx.tree!==undefined){
        for(var i=0;i<ctx.tree.length;i++){
            var res1 = $get_ids(ctx.tree[i])
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
    var res = ''
    for(var i=0;i<tree.length;i++){
        if(tree[i].to_js!==undefined){
            res += tree[i].to_js()
        }else{
            throw Error('no to_js() for '+tree[i])
        }
        if(i<tree.length-1){res+=sep}
    }
    return res
}

// expression starters
var $expr_starters = ['id','int','float','str','[','(','{','not','lambda']

function $arbo(ctx){
    while(ctx.parent!=undefined){ctx=ctx.parent}
    return ctx
}
function $transition(context,token){
    //console.log('arbo '+$arbo(context))
    //console.log('context '+context+' token '+token+' '+arguments[2])

    if(context.type==='abstract_expr'){
    
        if($expr_starters.indexOf(token)>-1){
            context.parent.tree.pop() // remove abstract expression
            var commas = context.with_commas
            context = context.parent
        }
        if(token==='id'){return new $IdCtx(new $ExprCtx(context,'id',commas),arguments[2])}
        else if(token==='str'){return new $StringCtx(new $ExprCtx(context,'str',commas),arguments[2])}
        else if(token==='int'){return new $IntCtx(new $ExprCtx(context,'int',commas),arguments[2])}
        else if(token==='float'){return new $FloatCtx(new $ExprCtx(context,'float',commas),arguments[2])}
        else if(token==='('){return new $ListOrTupleCtx(new $ExprCtx(context,'tuple',commas),'tuple')}
        else if(token==='['){return new $ListOrTupleCtx(new $ExprCtx(context,'list',commas),'list')}
        else if(token==='{'){return new $DictOrSetCtx(new $ExprCtx(context,'dict_or_set',commas))}
        else if(token==='not'){
            if(context.type==='op'&&context.op==='is'){ // "is not"
                context.op = 'is_not'
                return context
            }else{
                return new $NotCtx(new $ExprCtx(context,'not',commas))
            }
        }else if(token==='lambda'){return new $LambdaCtx(new $ExprCtx(context,'lambda',commas))}
        else if(token==='op'){
            if('+-~'.search(arguments[2])>-1){ // unary + or -, bitwise ~
                return new $UnaryCtx(new $ExprCtx(context,'unary',false),arguments[2])
            }else{$_SyntaxError(context,'token '+token+' after '+context)}
        }else if(token==='='){$_SyntaxError(context,token)}
        else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='assert'){
    
        if(token==='eol'){
            return $transition(context.parent,token)
        }else{$_SyntaxError(context,token)}
        
    }else if(context.type==='assign'){
    
        if(token==='eol'){return $transition(context.parent,'eol')}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='attribute'){ 

        if(token==='id'){
            var name = arguments[2]
            if(name.substr(0,2)=='$$'){name=name.substr(2)}
            context.name=name
            return context.parent
        }else{$_SyntaxError(context,token)}

    }else if(context.type==='call'){ 
        if(token===','){return context}
        else if($expr_starters.indexOf(token)>-1){
            var expr = new $CallArgCtx(context)
            return $transition(expr,token,arguments[2])
        }else if(token===')'){context.end=$pos;return context.parent}
        else if(token==='op'){
            var op=arguments[2]
            if(op==='-'||op==='~'){return new $UnaryCtx(new $ExprCtx(context,'unary',false),op)}
            else if(op==='+'){return context}
            else if(op==='*'){return new $StarArgCtx(context)}
            else if(op==='**'){return new $DoubleStarArgCtx(context)}
            else{throw Error('SyntaxError')}
        }else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='call_arg'){

        if($expr_starters.indexOf(token)>-1 && context.expect==='id'){
            context.expect=','
            var expr = new $AbstractExprCtx(context,false)
            return $transition(expr,token,arguments[2])
        }else if(token==='=' && context.expect===','){
            return new $ExprCtx(new $KwArgCtx(context),'kw_value',false)
        }else if(token==='for'){
            // comprehension
            var lst = new $ListOrTupleCtx(context,'gen_expr')
            lst.vars = context.vars // copy variables
            lst.locals = context.locals
            lst.intervals = [context.start]
            context.tree.pop()
            lst.expression = context.tree
            context.tree = [lst]
            lst.tree = []
            var comp = new $ComprehensionCtx(lst)
            return new $TargetListCtx(new $CompForCtx(comp))
        }else if(token==='op' && context.expect==='id'){
            var op = arguments[2]
            context.expect = ','
            if(op==='+'||op==='-'){
                return $transition(new $AbstractExprCtx(context,false),token,op)
            }else if(op==='*'){context.expect=',';return new $StarArgCtx(context)}
            else if(op==='**'){context.expect=',';return new $DoubleStarArgCtx(context)}
            else{$_SyntaxError(context,'token '+token+' after '+context)}
        }else if(token===')' && context.expect===','){
            if(context.tree.length>0){
                var son = context.tree[context.tree.length-1]
                if(son.type==='list_or_tuple'&&son.real==='gen_expr'){
                    son.intervals.push($pos)
                }
            }
            return $transition(context.parent,token)
        }else if(token===':' && context.expect===',' && context.parent.parent.type==='lambda'){
            return $transition(context.parent.parent,token)
        }else if(token===','&& context.expect===','){
            return new $CallArgCtx(context.parent)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='class'){
    
        if(token==='id' && context.expect==='id'){
            context.name = arguments[2]
            context.expect = '(:'
            return context
        }
        else if(token==='(' && context.expect==='(:'){
            return $transition(new $AbstractExprCtx(context,true),'(')
        }else if(token===':' && context.expect==='(:'){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='comp_if'){

        return $transition(context.parent,token,arguments[2])

    }else if(context.type==='comp_for'){

        if(token==='in' && context.expect==='in'){
            context.expect = null
            return new $AbstractExprCtx(new $CompIterableCtx(context),true)
        }else if(context.expect===null){
            // ids in context.tree[0] are local to the comprehension
            $comp_env(context,'locals',context.tree[0])
            return $transition(context.parent,token,arguments[2])
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='comp_iterable'){

        return $transition(context.parent,token,arguments[2])

    }else if(context.type==='comprehension'){
        if(token==='if'){return new $AbstractExprCtx(new $CompIfCtx(context),false)}
        else if(token==='for'){return new $TargetListCtx(new $CompForCtx(context))}
        else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='condition'){

        if(token===':'){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='decorator'){
    
        if(token==='id' && context.tree.length===0){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }else if(token==='eol'){return $transition(context.parent,token)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='def'){
    
        if(token==='id'){
            if(context.name){
                $_SyntaxError(context,'token '+token+' after '+context)
            }else{
                context.name = arguments[2]
                return context
            }
        }else if(token==='('){context.has_args=true;return new $FuncArgs(context)}
        else if(token===':' && context.has_args){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='del'){

        if(token==='eol'){return $transition(context.parent,token)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='dict_or_set'){ 

        if(context.closed){
            if(token==='['){return new $SubCtx(context)}
            else if(token==='('){return new $CallArgCtx(new $CallCtx(context))}
            //else if(token==='.'){return new $AttrCtx(context)}
            else if(token==='op'){
                return new $AbstractExprCtx(new $OpCtx(context,arguments[2]),false)
            }else{return $transition(context.parent,token,arguments[2])}
        }else{
            if(context.expect===','){
                if(token==='}'){
                    if(context.real==='dict_or_set'&&context.tree.length===1){
                        // set with single element
                        context.real = 'set'
                    }
                    if(['set','set_comp','dict_comp'].indexOf(context.real)>-1||
                        (context.real==='dict'&&context.tree.length%2===0)){
                        context.items = context.tree
                        context.tree = []
                        context.closed = true
                        return context
                    }else{$_SyntaxError(context,'token '+token+' after '+context)}
                }else if(token===','){
                    if(context.real==='dict_or_set'){context.real='set'}
                    if(context.real==='dict' && context.tree.length%2){
                        $_SyntaxError(context,'token '+token+' after '+context)
                    }
                    context.expect = 'id'
                    return context
                }else if(token===':'){
                    if(context.real==='dict_or_set'){context.real='dict'}
                    if(context.real==='dict'){
                        context.expect='id'
                        return context
                    }else{$_SyntaxError(context,'token '+token+' after '+context)}
                }else if(token==='for'){
                    // comprehension
                    if(context.real==='dict_or_set'){context.real = 'set_comp'}
                    else{context.real='dict_comp'}
                    var lst = new $ListOrTupleCtx(context,'dict_or_set_comp')
                    lst.intervals = [context.start+1]
                    lst.vars = context.vars
                    context.tree.pop()
                    lst.expression = context.tree
                    context.tree = [lst]
                    lst.tree = []
                    var comp = new $ComprehensionCtx(lst)
                    return new $TargetListCtx(new $CompForCtx(comp))

                }else{$_SyntaxError(context,'token '+token+' after '+context)}   
            }else if(context.expect==='id'){
                if(token==='}'&&context.tree.length===0){ // empty dict
                    context.items = []
                    context.tree = []
                    context.closed = true
                    context.real = 'dict'
                    return context
                }else if($expr_starters.indexOf(token)>-1){
                    context.expect = ','
                    var expr = new $AbstractExprCtx(context,false)
                    return $transition(expr,token,arguments[2])
                }else{$_SyntaxError(context,'token '+token+' after '+context)}
            }else{return $transition(context.parent,token,arguments[2])}
        }

    }else if(context.type==='double_star_arg'){
    
        if($expr_starters.indexOf(token)>-1){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }else if(token===','){return context.parent}
        else if(token===')'){return $transition(context.parent,token)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='except'){ 

        if(token==='id' && context.expect==='id'){
            new $TargetCtx(context,arguments[2])
            context.expect='as'
            return context
        }else if(token==='as' && context.expect==='as'
            && context.has_alias===undefined  // only one alias allowed
            && context.tree.length===1){ // if aliased, must be the only exception
            context.expect = 'alias'
            context.has_alias = true
            return context
        }else if(token==='id' && context.expect==='alias'){
            if(context.parenth!==undefined){context.expect = ','}
            else{context.expect=':'}
            context.tree[context.tree.length-1].alias = arguments[2]
            return context
        }else if(token===':' && ['id','as',':'].indexOf(context.expect)>-1){
            return $BodyCtx(context)
        }else if(token==='(' && context.expect==='id' && context.tree.length===0){
            context.parenth = true
            return context
        }else if(token===')' && [',','as'].indexOf(context.expect)>-1){
            context.expect = ':'
            return context
        }else if(token===',' && context.parenth!==undefined &&
            context.has_alias === undefined &&
            ['as',','].indexOf(context.expect)>-1){
                context.expect='id'
                return context
        }else{$_SyntaxError(context,'token '+token+' after '+context.expect)}
    
    }else if(context.type==='expr'){

        if($expr_starters.indexOf(token)>-1 && context.expect==='expr'){
            context.expect = ','
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }else if(token==='not'&&context.expect===','){
            return new $ExprNot(context)
        }else if(token==='in'&&context.expect===','){
            return $transition(context,'op','in')
        }else if(token===',' && context.expect===','){
            if(context.with_commas){
                // implicit tuple
                context.parent.tree.pop()
                var tuple = new $ListOrTupleCtx(context.parent,'tuple')
                tuple.tree = [context]
                return tuple
            }else{return $transition(context.parent,token)}
        }else if(token==='.'){return new $AttrCtx(context)}
        else if(token==='['){return new $AbstractExprCtx(new $SubCtx(context),false)}
        else if(token==='('){return new $CallCtx(context)}
        else if(token==='op'){
            // handle operator precedence
            var op_parent=context.parent,op=arguments[2]
            var op1 = context.parent,repl=null
            while(true){
                if(op1.type==='expr'){op1=op1.parent}
                else if(op1.type==='op'&&$op_weight[op1.op]>$op_weight[op]){repl=op1;op1=op1.parent}
                else{break}
            }
            if(repl===null){
                if(op1.type==='op' 
                    && ['<','<=','==','!=','is','>=','>'].indexOf(op1.op)>-1
                    && ['<','<=','==','!=','is','>=','>'].indexOf(op)>-1){
                    // chained comparisions such as 1 <= 3 < 5
                    // replace by (c1 op1 c2) and (c2 op ...)
                    op1.parent.tree.pop()
                    var and_expr = new $OpCtx(op1,'and')
                    var c2 = op1.tree[1] // right operand of op1
                    // clone c2
                    var c2_clone = new Object()
                    for(var attr in c2){c2_clone[attr]=c2[attr]}
                    c2_clone.parent = and_expr
                    // add fake element to and_expr : it will be removed
                    // when new_op is created at the next line
                    and_expr.tree.push('xxx')
                    var new_op = new $OpCtx(c2_clone,op)
                    return new $AbstractExprCtx(new_op,false)
                }
                if(['and','or'].indexOf(op)>-1){
                    while(context.parent.type==='not'||
                        (context.parent.type==='expr'&&context.parent.parent.type==='not')){
                        // 'and' and 'or' have higher precedence than 'not'
                        context = context.parent
                        op_parent = context.parent
                    }
                }
                context.parent.tree.pop()
                var expr = new $ExprCtx(op_parent,'operand',context.with_commas)
                expr.expect = ','
                context.parent = expr
                var new_op = new $OpCtx(context,op)
                return new $AbstractExprCtx(new_op,false)
            }
            repl.parent.tree.pop()
            var expr = new $ExprCtx(repl.parent,'operand',false)
            expr.tree = [op1]
            repl.parent = expr
            var new_op = new $OpCtx(repl,op) // replace old operation
            //var res = new $AbstractExprCtx(new_op,false)
            return new $AbstractExprCtx(new_op,false)

        }else if(token==='augm_assign' && context.expect===','){
            return $augmented_assign(context,arguments[2])
        }else if(token==='=' && context.expect===','){
            if(context.parent.type==="call_arg"){
                return new $AbstractExprCtx(new $KwArgCtx(context),true)
            }else{
                while(context.parent!==undefined){context=context.parent}
                context = context.tree[0]
                return new $AbstractExprCtx(new $AssignCtx(context),true)
            }
        }else if(token==='if' && context.parent.type!=='comp_iterable'){ 
            // ternary operator : expr1 if cond else expr2
            return new $AbstractExprCtx(new $TernaryCtx(context),false)
        }else{return $transition(context.parent,token)}

    }else if(context.type==='expr_not'){
    
        if(token==='in'){ // expr not in : operator
            context.parent.tree.pop()
            return new $AbstractExprCtx(new $OpCtx(context.parent,'not_in'),false)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}
        
    }else if(context.type==='for'){
    
        if(token==='in'){return new $AbstractExprCtx(context,true)}
        else if(token===':'){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='from'){

        if(token==='id' && context.expect==='module'){
            context.module = arguments[2]
            context.expect = 'import'
            return context
        }else if(token==='import' && context.expect==='import'){
            context.expect = 'id'
            return context
        }else if (token==='import' && context.expect==='module' 
                 && context.parent_module !== undefined) {
            context.expect = 'id'
            return context
        }else if(token==='id' && context.expect==='id'){
            context.names.push(arguments[2])
            context.expect = ','
            return context
        }else if(token==='op' && arguments[2]==='*' 
            && context.expect==='id'
            && context.names.length ===0){
            context.names.push('*')
            context.expect = 'eol'
            return context
        }else if(token===',' && context.expect===','){
            context.expect = 'id'
            return context
        }else if(token==='eol' && 
            (context.expect ===',' || context.expect==='eol')){
            return $transition(context.parent,token)
        }else if (token==='.' && context.expect === 'module') {
            context.expect='module'
            // this is a relative import
            context.parent_module=context.parent.node.module;
            return context
        }else if (token==='as' &&
            (context.expect ===',' || context.expect==='eol')){
            context.expect='alias'
            return context
        }else if(token==='id' && context.expect==='alias'){
            context.aliases[context.names[context.names.length-1]]= arguments[2]
            context.expect=','
            return context
        }else if (token==='(' && context.expect === 'id') {
            context.expect='id'
            return context
        }else if (token===')' && context.expect === ',') {
            context.expect='eol'
            return context
        }else{$_SyntaxError(context,'token '+token+' after '+context)}
            

    }else if(context.type==='func_arg_id'){
        if(token==='=' && context.expect==='='){
            context.parent.has_default = true
            return new $AbstractExprCtx(context,false)
        }else if(token===',' || token===')'){
            if(context.parent.has_default && context.tree.length==0){
                throw Error('SyntaxError: non-default argument follows default argument')
            }else{
                return $transition(context.parent,token)
            }
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='func_args'){
    
        if(token==='id' && context.expect==='id'){
            context.expect = ','
            return new $FuncArgIdCtx(context,arguments[2])
        }else if(token===','){
            if(context.has_kw_arg){throw Error('SyntaxError')}
            else if(context.expect===','){
                context.expect = 'id'
                return context
            }else{$_SyntaxError(context,'token '+token+' after '+context)}
        }else if(token===')'){
            if(context.expect===','){return context.parent}
            else if(context.tree.length==0){return context.parent} // no argument
            else{$_SyntaxError(context,'token '+token+' after '+context)}
        }else if(token==='op'){
            var op = arguments[2]
            context.expect = ','
            if(op=='*'){return new $FuncStarArgCtx(context,'*')}
            else if(op=='**'){return new $FuncStarArgCtx(context,'**')}
            else{$_SyntaxError(context,'token '+op+' after '+context)}
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='func_star_arg'){
    
        if(token==='id' && context.name===undefined){
            context.name = arguments[2]
            return context.parent
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='global'){

        if(token==='id' && context.expect==='id'){
            new $IdCtx(context,arguments[2])
            context.expect=','
            return context
        }else if(token===',' && context.expect===','){
            context.expect='id'
            return context
        }else if(token==='eol' && context.expect===','){
            return $transition(context.parent,token)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}
        

    }else if(context.type==='id'){
    
        if(token==='='){
            if(context.parent.type==='expr' &&
                context.parent.parent !== undefined &&
                context.parent.parent.type ==='call_arg'){
                    return new $AbstractExprCtx(new $KwArgCtx(context.parent),false)
            }else{return $transition(context.parent,token,arguments[2])}             
        }else if(token==='op'){return $transition(context.parent,token,arguments[2])}
        else if(['id','str','int','float'].indexOf(token)>-1){
            $_SyntaxError(context,'token '+token+' after '+context)
        }else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='import'){
    
        if(token==='id' && context.expect==='id'){
            new $ImportedModuleCtx(context,arguments[2])
            context.expect=','
            return context
        }else if(token===',' && context.expect===','){
            context.expect = 'id'
            return context
        }else if(token==='as' && context.expect===','){
            context.expect = 'alias'
            return context
        }else if(token==='id' && context.expect==='alias'){
            context.expect = ','
            context.tree[context.tree.length-1].alias = arguments[2]
            var mod_name=context.tree[context.tree.length-1].name;
            __BRYTHON__.$py_module_alias[mod_name]=arguments[2]
            return context
        }else if(token==='eol' && context.expect===','){
            return $transition(context.parent,token)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='int'||context.type==='float'){
    
        if($expr_starters.indexOf(token)>-1){
            $_SyntaxError(context,'token '+token+' after '+context)
        }else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='kwarg'){

        if(token===','){return new $CallArgCtx(context.parent)}
        else{return $transition(context.parent,token)}

    }else if(context.type==="lambda"){
    
        if(token===':' && context.args===undefined){
            context.args = context.tree
            context.tree = []
            context.body_start = $pos
            return new $AbstractExprCtx(context,false)
        }else if(context.args!==undefined){ // returning from expression
            context.body_end = $pos
            return $transition(context.parent,token)
        }else if(context.args===undefined){
            return $transition(new $CallCtx(context),token,arguments[2])
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='list_or_tuple'){ 

        if(context.closed){
            if(token==='['){return new $SubCtx(context.parent)}
            else if(token==='('){return new $CallCtx(context)}
            else if(token==='op'){
                return new $AbstractExprCtx(new $OpCtx(context,arguments[2]),false)
            }
            else{return $transition(context.parent,token,arguments[2])}
        }else{
            if(context.expect===','){
                if((context.real==='tuple'||context.real==='gen_expr')
                    && token===')'){
                    context.closed = true
                    if(context.real==='gen_expr'){context.intervals.push($pos)}
                    return context.parent
                }else if((context.real==='list'||context.real==='list_comp')
                    && token===']'){
                    context.closed = true
                    if(context.real==='list_comp'){context.intervals.push($pos)}
                    return context
                }else if(context.real==='dict_or_set_comp' && token==='}'){
                    context.intervals.push($pos)
                    return $transition(context.parent,token)
                }else if(token===','){
                    if(context.real==='tuple'){context.has_comma=true}
                    context.expect = 'id'
                    return context
                }else if(token==='for'){
                    // comprehension
                    if(context.real==='list'){context.real = 'list_comp'}
                    else{context.real='gen_expr'}
                    context.intervals = [context.start+1]
                    context.expression = context.tree
                    context.tree = [] // reset tree
                    var comp = new $ComprehensionCtx(context)
                    return new $TargetListCtx(new $CompForCtx(comp))
                }else{return $transition(context.parent,token,arguments[2])}   
            }else if(context.expect==='id'){
                if(context.real==='tuple' && token===')'){
                    context.closed = true
                    return context
                }else if(context.real==='gen_expr' && token===')'){
                    context.closed = true
                    return $transition(context.parent,token)
                }else if(context.real==='list'&& token===']'){
                    context.closed = true
                    return context
                }else if(token !==')'&&token!==']'&&token!==','){
                    context.expect = ','
                    var expr = new $AbstractExprCtx(context,false)
                    return $transition(expr,token,arguments[2])
                }
            }else{return $transition(context.parent,token,arguments[2])}
        }

    }else if(context.type==='list_comp'){ 

        if(token===']'){return context.parent}
        else if(token==='in'){return new $ExprCtx(context,'iterable',true)}
        else if(token==='if'){return new $ExprCtx(context,'condition',true)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='node'){
    
        if($expr_starters.indexOf(token)>-1){
            var expr = new $AbstractExprCtx(context,true)
            return $transition(expr,token,arguments[2])
        }else if(token==="op" && '+-~'.search(arguments[2])>-1){
            var expr = new $AbstractExprCtx(context,true)
            return $transition(expr,token,arguments[2])
        }else if(token==='class'){return new $ClassCtx(context)}
        else if(token==='def'){return new $DefCtx(context)}
        else if(token==='for'){return new $TargetListCtx(new $ForExpr(context))}
        else if(['if','elif','while'].indexOf(token)>-1){
            return new $AbstractExprCtx(new $ConditionCtx(context,token),false)
        }else if(['else','finally'].indexOf(token)>-1){
            return new $SingleKwCtx(context,token)
        }else if(token==='try'){return new $TryCtx(context)}
        else if(token==='except'){return new $ExceptCtx(context)}
        else if(token==='assert'){return new $AbstractExprCtx(new $AssertCtx(context),'assert',true)}
        else if(token==='from'){return new $FromCtx(context)}
        else if(token==='import'){return new $ImportCtx(context)}
        else if(token==='global'){return new $GlobalCtx(context)}
        else if(token==='lambda'){return new $LambdaCtx(context)}
        else if(token==='pass'){return new $PassCtx(context)}
        else if(token==='raise'){return new $RaiseCtx(context)}
        else if(token==='return'){
            var ret = new $ReturnCtx(context)
            return new $AbstractExprCtx(ret,true)
        }else if(token==='yield'){
            var yield = new $YieldCtx(context)
            return new $AbstractExprCtx(yield,true)
        }else if(token==='del'){return new $AbstractExprCtx(new $DelCtx(context),true)}
        else if(token==='@'){return new $DecoratorCtx(context)}
        else if(token==='eol'){
            if(context.tree.length===0){ // might be the case after a :
                context.node.parent.children.pop()
                return context.node.parent.context
            }
            return context
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='not'){
        if(token==='in'){ // operator not_in
            // not is always in an expression : remove it
            context.parent.parent.tree.pop() // remove 'not'
            return new $ExprCtx(new $OpCtx(context.parent,'not_in'),'op',false)
        }else if($expr_starters.indexOf(token)>-1){
            var expr = new $AbstractExprCtx(context,false)
            return $transition(expr,token,arguments[2])
        }else{return $transition(context.parent,token)}

    }else if(context.type==='op'){ 
    
        if($expr_starters.indexOf(token)>-1){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }else if(token==='op' && '+-~'.search(arguments[2])>-1){
            return new $UnaryCtx(context,arguments[2])
        }else{return $transition(context.parent,token)}

    }else if(context.type==='pass'){ 

        if(token==='eol'){return context.parent}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='raise'){ 

        if(token==='id' && context.tree.length===0){
            return new $IdCtx(new $ExprCtx(context,'exc',false),arguments[2])
        }else if(token==='eol'){
            return $transition(context.parent,token)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='return'){

        return $transition(context.parent,token)

    }else if(context.type==='single_kw'){

        if(token===':'){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='star_arg'){
    
        if($expr_starters.indexOf(token)>-1){
            return $transition(new $AbstractExprCtx(context,false),token,arguments[2])
        }else if(token===','){return $transition(context.parent,token)}
        else if(token===')'){return $transition(context.parent,token)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='str'){

        if(token==='['){return new $AbstractExprCtx(new $SubCtx(context.parent),false)}
        else if(token==='('){return new $CallCtx(context)}
        //else if(token==='.'){return new $AttrCtx(context)}
        else if(token=='str'){context.value += '+'+arguments[2];return context}
        else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='sub'){ 
    
        // subscription x[a] or slicing x[a:b:c]
        if($expr_starters.indexOf(token)>-1){
            var expr = new $AbstractExprCtx(context,false)
            return $transition(expr,token,arguments[2])
        }else if(token===']'){return context.parent}
        else if(token===':'){
            return new $AbstractExprCtx(context,false)
        }else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='target_list'){
    
        if(token==='id' && context.expect==='id'){
            context.expect = ','
            new $IdCtx(context,arguments[2])
            return context
        }else if((token==='('||token==='[')&&context.expect==='id'){
            context.expect = ','
            return new $TargetListCtx(context)
        }else if((token===')'||token===']')&&context.expect===','){
            return context.parent
        }else if(token===',' && context.expect==','){
            context.expect='id'
            return context
        }else if(context.expect===','){return $transition(context.parent,token,arguments[2])}
        else{$_SyntaxError(context,'token '+token+' after '+context)}

    }else if(context.type==='ternary'){
    
        if(token==='else'){return new $AbstractExprCtx(context,false)}
        else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='try'){ 

        if(token===':'){return $BodyCtx(context)}
        else{$_SyntaxError(context,'token '+token+' after '+context)}
    
    }else if(context.type==='unary'){

        if(['int','float'].indexOf(token)>-1){
            // replace by real value of integer or float
            // parent of context is a $ExprCtx
            // grand-parent is a $AbstractExprCtx
            // we remove the $ExprCtx and trigger a transition 
            // from the $AbstractExpCtx with an integer or float
            // of the correct value
            context.parent.parent.tree.pop()
            var value = arguments[2]
            if(context.op==='-'){value=-value}
            if(context.op==='~'){value=~value}
            return $transition(context.parent.parent,token,value)
        }else if(token==='id'){
            // replace by x.__neg__(), x.__invert__ or x
            context.parent.tree.pop()
            var expr = new $ExprCtx(context.parent,'id',false)
            new $IdCtx(expr,arguments[2]) // create id
            if(context.op !== '+'){
                var repl = new $AttrCtx(expr)
                if(context.op==='-'){repl.name='__neg__'}
                else{repl.name='__invert__'}
                // method is called with no argument
                var call = new $CallCtx(expr)
            }
            return context.parent
        }else if(token==="op" && '+-'.search(arguments[2])>-1){
            var op = arguments[2]
            if(context.op===op){context.op='+'}else{context.op='-'}
            return context
        }else{return $transition(context.parent,token,arguments[2])}

    }else if(context.type==='yield'){

        return $transition(context.parent,token)

    }
}

__BRYTHON__.py2js = function(src,module){
    src = src.replace(/\r\n/gm,'\n')
    while (src.length>0 && (src.charAt(0)=="\n" || src.charAt(0)=="\r")){
        src = src.substr(1)
    }
    if(src.charAt(src.length-1)!="\n"){src+='\n'}
    if(module===undefined){module='__main__'}
    __BRYTHON__.scope[module] = {}

    document.$py_src[module]=src
    var root = $tokenize(src,module)
    root.transform()
    if(document.$debug>0){$add_line_num(root,null,module)}
    return root
}

__BRYTHON__.forbidden = ['catch','Date','delete','default','document',
    'function','location','Math','new','RegExp','this','throw','var','super','window']
    /*
    ['case','debugger','default',
    'do','instanceof','switch',
    'typeof','void','with','enum','export','extends',
    'Anchor','Area','arguments','Array','assign','blur','Boolean','Button',
    'callee','caller','captureEvents','Checkbox','clearInterval','clearTimeout',
    'close','closed','constructor','Date','defaultStatus','document','Document',
    'Element','escape','FileUpload','find','focus','Form','Frame','Frames','Function',
    'getClass','Hidden','history','History','home','Image','Infinity','InnerHeight',
    'InnerWidth','isFinite','isNan','java','JavaArray','JavaClass','JavaObject',
    'JavaPackage','length','Link','location','Location','locationbar','Math','menubar',
    'MimeType','moveBy','moveTo','name','NaN','navigate','navigator','Navigator','netscape',
    'Number','Object','onBlur','onError','onFocus','onLoad','onUnload','opener',
    'Option','outerHeight','OuterWidth','Packages','pageXoffset','pageYoffset',
    'parent','parseFloat','parseInt','Password','personalbar','Plugin','prototype',
    'Radio','ref','RegExp','releaseEvents','Reset','resizeBy','resizeTo','routeEvent',
    'scroll','scrollbars','scrollBy','scrollTo','Select','self','setInterval','setTimeout',
    'status','statusbar','stop','String','Submit','sun','taint','Text','Textarea','toolbar',
    'top','toString','unescape','untaint','unwatch','valueOf','watch','window','Window'
    ]
    */

function $tokenize(src,module){
    var delimiters = [["#","\n","comment"],['"""','"""',"triple_string"],
        ["'","'","string"],['"','"',"string"],
        ["r'","'","raw_string"],['r"','"',"raw_string"]]
    var br_open = {"(":0,"[":0,"{":0}
    var br_close = {")":"(","]":"[","}":"{"}
    var br_stack = ""
    var br_pos = new Array()
    var kwdict = ["class","return",
        "for","lambda","try","finally","raise","def","from",
        "nonlocal","while","del","global","with",
        "as","elif","else","if","yield","assert","import",
        "except","raise","in","not","pass",
        //"False","None","True","break","continue",
        // "and',"or","is"
        ]
    var unsupported = ["nonlocal","with"]
    var $indented = ['class','def','for','condition','single_kw','try','except']
    // from https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Reserved_Words

    var punctuation = {',':0,':':0} //,';':0}
    var int_pattern = new RegExp("^\\d+")
    var float_pattern1 = new RegExp("^\\d+\\.\\d*(e-?\\d+)?")
    var float_pattern2 = new RegExp("^\\d+(e-?\\d+)")
    var hex_pattern = new RegExp("^0[xX]([0-9a-fA-F]+)")
    var octal_pattern = new RegExp("^0[oO]([0-7]+)")
    var binary_pattern = new RegExp("^0[bB]([01]+)")
    var id_pattern = new RegExp("[\\$_a-zA-Z]\\w*")
    var qesc = new RegExp('"',"g") // to escape double quotes in arguments

    var context = null
    var root = new $Node('module')
    root.indent = -1
    var new_node = new $Node('expression')
    current = root
    var name = ""
    var _type = null
    var pos = 0
    indent = null

    var lnum = 1
    while(pos<src.length){
        var flag = false
        var car = src.charAt(pos)
        // build tree structure from indentation
        if(indent===null){
            var indent = 0
            while(pos<src.length){
                if(src.charAt(pos)==" "){indent++;pos++}
                else if(src.charAt(pos)=="\t"){ 
                    // tab : fill until indent is multiple of 8
                    indent++;pos++
                    while(indent%8>0){indent++}
                }else{break}
            }
            // ignore empty lines
            if(src.charAt(pos)=='\n'){pos++;lnum++;indent=null;continue}
            else if(src.charAt(pos)==='#'){ // comment
                var offset = src.substr(pos).search(/\n/)
                if(offset===-1){break}
                pos+=offset+1;lnum++;indent=null;continue
            }
            new_node.indent = indent
            new_node.line_num = lnum
            new_node.module = module
            // attach new node to node with indentation immediately smaller
            if(indent>current.indent){
                // control that parent ended with ':'
                if(context!==null){
                    if($indented.indexOf(context.tree[0].type)==-1){
                        $pos = pos
                        $_SyntaxError(context,'unexpected indent',pos)
                    }
                }
                // add a child to current node
                current.add(new_node)
            }else if(indent<=current.indent &&
                $indented.indexOf(context.tree[0].type)>-1 &&
                context.tree.length<2){
                    $pos = pos
                    $_SyntaxError(context,'expected an indented block',pos)
            }else{ // same or lower level
                while(indent!==current.indent){
                    current = current.parent
                    if(current===undefined || indent>current.indent){
                        $pos = pos
                        $_SyntaxError(context,'unexpected indent',pos)
                    }
                }
                current.parent.add(new_node)
            }
            current = new_node
            context = new $NodeCtx(new_node)
            continue
        }
        // comment
        if(car=="#"){
            var end = src.substr(pos+1).search('\n')
            if(end==-1){end=src.length-1}
            pos += end+1;continue
        }
        // string
        if(car=='"' || car=="'"){
            var raw = false
            var end = null
            if(name.length>0 && name.toLowerCase()=="r"){
                // raw string
                raw = true;name=""
            }
            if(src.substr(pos,3)==car+car+car){_type="triple_string";end=pos+3}
            else{_type="string";end=pos+1}
            var escaped = false
            var zone = car
            var found = false
            while(end<src.length){
                if(escaped){zone+=src.charAt(end);escaped=false;end+=1}
                else if(src.charAt(end)=="\\"){
                    if(raw){
                        zone += '\\\\'
                        end++
                    } else {
                        if(src.charAt(end+1)=='\n'){
                            // explicit line joining inside strings
                            end += 2
                            lnum++
                        } else {
                            zone+=src.charAt(end);escaped=true;end+=1
                        }
                    }
                } else if(src.charAt(end)==car){
                    if(_type=="triple_string" && src.substr(end,3)!=car+car+car){
                        end++
                    } else {
                        found = true
                        // end of string
                        $pos = pos
                        var string = zone.substr(1).replace(qesc,'\\"')
                        context = $transition(context,'str',zone+car)
                        pos = end+1
                        if(_type=="triple_string"){pos = end+3}
                        break
                    }
                } else { 
                    zone += src.charAt(end)
                    if(src.charAt(end)=='\n'){lnum++}
                    end++
                }
            }
            if(!found){$_SyntaxError(context,"String end not found")}
            continue
        }
        // identifier ?
        if(name==""){
            if(car.search(/[a-zA-Z_]/)!=-1){
                name=car // identifier start
                pos++;continue
            }
        } else {
            if(car.search(/\w/)!=-1){
                name+=car
                pos++;continue
            } else{
                if(kwdict.indexOf(name)>-1){
                    if(unsupported.indexOf(name)>-1){
                        $_SyntaxError(context,"Unsupported Python keyword '"+name+"'")                    
                    }
                    $pos = pos-name.length
                    context = $transition(context,name)
                } else if(name in $operators) { // and, or
                    $pos = pos-name.length
                    context = $transition(context,'op',name)
                } else {
                    if(__BRYTHON__.forbidden.indexOf(name)>-1){name='$$'+name}
                    $pos = pos-name.length
                    context = $transition(context,'id',name)
                }
                name=""
                continue
            }
        }
        // point
        if(car=="."){
            $pos = pos
            context = $transition(context,'.')
            pos++;continue
        }
        // octal, hexadecimal, binary
        if(car==="0"){
            var res = hex_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],16))
                pos += res[0].length
                continue
            }
            var res = octal_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],8))
                pos += res[0].length
                continue
            }
            var res = binary_pattern.exec(src.substr(pos))
            if(res){
                context=$transition(context,'int',parseInt(res[1],2))
                pos += res[0].length
                continue
            }
        }
        // number
        if(car.search(/\d/)>-1){
            // digit
            var res = float_pattern1.exec(src.substr(pos))
            if(res){
                if(res[0].search('e')>-1){
                    $pos = pos
                    context = $transition(context,'float',res[0])
                }else{
                    $pos = pos
                    context = $transition(context,'float',eval(res[0]))
                }
            }else{
                res = float_pattern2.exec(src.substr(pos))
                if(res){
                    $pos =pos
                    context = $transition(context,'float',res[0])
                }else{
                    res = int_pattern.exec(src.substr(pos))
                    $pos = pos
                    context = $transition(context,'int',eval(res[0]))
                }
            }
            pos += res[0].length
            continue
        }
        // line end
        if(car=="\n"){
            lnum++
            if(br_stack.length>0){
                // implicit line joining inside brackets
                pos++;continue
            } else {
                if(current.context.tree.length>0){
                    $pos = pos
                    context = $transition(context,'eol')
                    indent=null
                    new_node = new $Node()
                }else{
                    new_node.line_num = lnum
                }
                pos++;continue
            }
        }
        if(car in br_open){
            br_stack += car
            br_pos[br_stack.length-1] = [context,pos]
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car in br_close){
            if(br_stack==""){
                $_SyntaxError(context,"Unexpected closing bracket")
            } else if(br_close[car]!=$last(br_stack)){
                $_SyntaxError(context,"Unbalanced bracket")
            } else {
                br_stack = br_stack.substr(0,br_stack.length-1)
                $pos = pos
                context = $transition(context,car)
                pos++;continue
            }
        }
        if(car=="="){
            if(src.charAt(pos+1)!="="){
                $pos = pos
                context = $transition(context,'=')
                pos++;continue
            } else {
                $pos = pos
                context = $transition(context,'op','==')
                pos+=2;continue
            }
        }
        if(car in punctuation){
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car===";"){ // next instruction
            $transition(context,'eol') // close previous instruction
            // create a new node, at the same level as current's parent
            if(current.context.tree.length===0){
                // consecutive ; are not allowed
                $pos=pos
                $_SyntaxError(context,'invalid syntax')
            }
            new_node = new $Node()
            new_node.indent = current.indent
            new_node.line_num = lnum
            new_node.module = module
            current.parent.add(new_node)
            current = new_node
            context = new $NodeCtx(new_node)
            pos++;continue
        }
        // operators
        if(car in $first_op_letter){
            // find longest match
            var op_match = ""
            for(op_sign in $operators){
                if(op_sign==src.substr(pos,op_sign.length) 
                    && op_sign.length>op_match.length){
                    op_match=op_sign
                }
            }
            $pos = pos
            if(op_match.length>0){
                if(op_match in $augmented_assigns){
                    context = $transition(context,'augm_assign',op_match)
                }else{
                    context = $transition(context,'op',op_match)
                }
                pos += op_match.length
                continue
            }
        }
        if(car=='\\' && src.charAt(pos+1)=='\n'){
            lnum++;pos+=2;continue
        }
        if(car=='@'){
            $pos = pos
            context = $transition(context,car)
            pos++;continue
        }
        if(car!=' '&&car!=='\t'){$pos=pos;$_SyntaxError(context,'unknown token ['+car+']')}
        pos += 1
    }

    if(br_stack.length!=0){
        var br_err = br_pos[0]
        $pos = br_err[1]
        $_SyntaxError(br_err[0],"Unbalanced bracket "+br_stack.charAt(br_stack.length-1))
    }
    if($indented.indexOf(context.tree[0].type)>-1){
        $pos = pos-1
        $_SyntaxError(context,'expected an indented block',pos)    
    }
    
    return root

}

function brython(options){
    document.$py_src = {}
    __BRYTHON__.$py_module_path = {}
    __BRYTHON__.$py_module_alias = {}
    //__BRYTHON__.$py_modules = {}
    __BRYTHON__.modules = {}
    __BRYTHON__.$py_next_hash = -Math.pow(2,53)
    document.$debug = 0
    if(options===undefined){options={'debug':0}}
    if(typeof options==='number'){options={'debug':options}}
    if (options.debug == 1 || options.debug == 2) {
       document.$debug = options.debug
    }
    __BRYTHON__.$options=options
    __BRYTHON__.exception_stack = []
    __BRYTHON__.scope = {}
    var $elts = document.getElementsByTagName("script")
    var $href = window.location.href
    var $href_elts = $href.split('/')
    $href_elts.pop()
    var $script_path = $href_elts.join('/')

    __BRYTHON__.path = []
    if (isinstance(options.pythonpath, list)) {
       __BRYTHON__.path = options.pythonpath
    }
    if (!(__BRYTHON__.path.indexOf($script_path) > -1)) {
       __BRYTHON__.path.push($script_path)
    }
    // get path of brython.js or py2js to determine brython_path
    // it will be used for imports

    for(var $i=0;$i<$elts.length;$i++){
        var $elt = $elts[$i]
        var $br_scripts = ['brython.js','py2js.js','py_loader.js']
        for(var j=0;j<$br_scripts.length;j++){
            var $bs = $br_scripts[j]
            if($elt.src.substr($elt.src.length-$bs.length)==$bs){
                if($elt.src.length===$bs.length ||
                    $elt.src.charAt($elt.src.length-$bs.length-1)=='/'){
                        var $path = $elt.src.substr(0,$elt.src.length-$bs.length)
                        __BRYTHON__.brython_path = $path
                        if (!(__BRYTHON__.path.indexOf($path+'Lib')> -1)) {
                           __BRYTHON__.path.push($path+'Lib')
                        }
                        break
                }
            }
        }
    }

    // get all scripts with type = text/python and run them
    
    for(var $i=0;$i<$elts.length;$i++){
        var $elt = $elts[$i]
        if($elt.type=="text/python"||$elt.type==="text/python3"){
            var $src = null
            if($elt.src!==''){ 
                // format <script type="text/python" src="python_script.py">
                // get source code by an Ajax call
                if (window.XMLHttpRequest){// code for IE7+, Firefox, Chrome, Opera, Safari
                    var $xmlhttp=new XMLHttpRequest();
                }else{// code for IE6, IE5
                    var $xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
                }
                $xmlhttp.onreadystatechange = function(){
                    var state = this.readyState
                    if(state===4){
                        $src = $xmlhttp.responseText
                    }
                }
                $xmlhttp.open('GET',$elt.src,false)
                $xmlhttp.send()
                __BRYTHON__.$py_module_path['__main__']=$elt.src 
                var $src_elts = $elt.src.split('/')
                $src_elts.pop()
                var $src_path = $src_elts.join('/')
                if (__BRYTHON__.path.indexOf($src_path) == -1) {
                    // insert in first position : folder /Lib with built-in modules
                    // should be the last used when importing scripts
                    __BRYTHON__.path.splice(0,0,$src_path)
                }
            }else{
                var $src = ($elt.innerHTML || $elt.textContent)
                __BRYTHON__.$py_module_path['__main__']='.' 
            }
            try{
                var $root = __BRYTHON__.py2js($src,'__main__')
                var $js = $root.to_js()
                if(document.$debug===2){console.log($js)}
                eval($js)
            }catch($err){
                if($err.py_error===undefined){$err = RuntimeError($err+'')}
                var $trace = $err.__name__+': '+$err.message
                if($err.__name__=='SyntaxError'||$err.__name__==='IndentationError'){
                    $trace += $err.info
                }
                document.$stderr.__getattr__('write')($trace)
                $err.message += $err.info
                throw $err
            }
        }
    }
}
