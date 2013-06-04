str = function(){

function str(arg){
    if(arg===undefined){return '<undefined>'}
    else if(arg.__str__!==undefined){return arg.__str__()}
    else if(arg.__getattr__('__str__')!==undefined){
        return arg.__getattr__('__str__')()
    }else{return arg.toString()}
}

str.__name__ = 'str'
str.__str__ = function(){return "<class 'str'>"}
str.toString = str.__str__

// add Brython attributes to Javascript String

str.__add__ = function(self,other){
    if(!(typeof other==="string")){
        try{return other.__radd__(self)}
        catch(err){throw TypeError(
            "Can't convert "+other.__class__+" to str implicitely")}
    }else{
        return self+other
    }
}

str.__class__ = $type

str.__contains__ = function(self,item){
    if(!(typeof item==="string")){throw TypeError(
         "'in <string>' requires string as left operand, not "+item.__class__)}
    var nbcar = item.length
    for(var i=0;i<self.length;i++){
        if(self.substr(i,nbcar)==item){return True}
    }
    return False
}

str.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "str"
        return self===str
    }
    return other===self.valueOf()
}

str.__getattr__ = function(attr){return this[attr]}

str.__getitem__ = function(self,arg){
    if(isinstance(arg,int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){return self.charAt(pos)}
        else{throw IndexError('string index out of range')}
    } else if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? self.__len__() : arg.stop
        }else{
            var start = arg.start===None ? self.__len__()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        var res = '',i=null
        if(step>0){
            if(stop<=start){return ''}
            else {
                for(i=start;i<stop;i+=step){
                    res += self.charAt(i)
                }
            }
        } else {
            if(stop>=start){return ''}
            else {
                for(i=start;i>=stop;i+=step){
                    res += self.charAt(i)
                }
            }
        }            
        return res
    } else if(isinstance(arg,bool)){
        return self.__getitem__(int(arg))
    }
}

str.__hash__ = function(self) {
  //http://stackoverflow.com/questions/2909106/python-whats-a-correct-and-good-way-to-implement-hash
  // this implementation for strings maybe good enough for us..

  var hash=1;
  for(var i=0; i < self.length; i++) {
      hash=(101*hash + self.charCodeAt(i)) & 0xFFFFFFFF;
  }

  return hash;
}

str.__in__ = function(self,item){return item.__contains__(self.valueOf())}

str.__item__ = function(self,i){return self.charAt(i)}

str.__len__ = function(self){return self.length}

str.__mod__ = function(self,args){
    // string formatting (old style with %)
    var flags = $List2Dict('#','0','-',' ','+')
    var ph = [] // placeholders for replacements
    
    function format(s){
        var conv_flags = '([#\\+\\- 0])*'
        var conv_types = '[diouxXeEfFgGcrsa%]'
        var re = new RegExp('\\%(\\(.+\\))*'+conv_flags+'(\\*|\\d*)(\\.\\*|\\.\\d*)*(h|l|L)*('+conv_types+'){1}')
        var res = re.exec(s)
        this.is_format = true
        if(!res){this.is_format = false;return}
        this.src = res[0]
        if(res[1]){this.mapping_key=str(res[1].substr(1,res[1].length-2))}
        else{this.mapping_key=null}
        this.flag = res[2]
        this.min_width = res[3]
        this.precision = res[4]
        this.length_modifier = res[5]
        this.type = res[6]
            
        this.toString = function(){
            var res = 'type '+this.type+' key '+this.mapping_key+' min width '+this.min_width
            res += ' precision '+this.precision
            return res
        }
        this.format = function(src){
            if(this.mapping_key!==null){
                if(!isinstance(src,dict)){throw TypeError("format requires a mapping")}
                src=src.__getitem__(this.mapping_key)
            }
            if(this.type=="s"){
                var res = str(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="r"){
                var res = repr(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="a"){
                var res = ascii(src)
                if(this.precision){res = res.substr(0,parseInt(this.precision.substr(1)))}
                return res
            }else if(this.type=="g" || this.type=="G"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var prec = -4
                if(this.precision){prec=parseInt(this.precision.substr(1))}
                var res = parseFloat(src).toExponential()
                var elts = res.split('e')
                if((this.precision && eval(elts[1])>prec)||
                    (!this.precision && eval(elts[1])<-4)){
                    this.type === 'g' ? this.type='e' : this.type='E'
                    // The precision determines the number of significant digits 
                    // before and after the decimal point and defaults to 6
                    var prec = 6
                    if(this.precision){prec=parseInt(this.precision.substr(1))-1}
                    var res = parseFloat(src).toExponential(prec)
                    var elts = res.split('e')
                    var res = elts[0]+this.type+elts[1].charAt(0)
                    if(elts[1].length===2){res += '0'}
                    return res+elts[1].substr(1)
                }else{
                    var prec = 6
                    if(this.precision){prec=parseInt(this.precision.substr(1))-1}
                    var elts = str(src).split('.')
                    this.precision = '.'+(prec-elts[0].length)
                    this.type="f"
                    return this.format(src)
                }
            }else if(this.type=="e" || this.type=="E"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var prec = 6
                if(this.precision){prec=parseInt(this.precision.substr(1))}
                var res = parseFloat(src).toExponential(prec)
                var elts = res.split('e')
                var res = elts[0]+this.type+elts[1].charAt(0)
                if(elts[1].length===2){res += '0'}
                return res+elts[1].substr(1)
            }else if(this.type=="x" || this.type=="X"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = src
                res = src.toString(16)
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}
                else if(this.flag==='#'){
                    if(this.type==='x'){res = '0x'+res}
                    else{res = '0X'+res}
                }
                if(this.min_width){
                    var pad = ' '
                    if(this.flag==='0'){pad="0"}
                    while(res.length<parseInt(this.min_width)){res=pad+res}
                }
                return res
            }else if(this.type=="i" || this.type=="d"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = parseInt(src)
                if(this.precision){num = num.toFixed(parseInt(this.precision.substr(1)))}
                res = num+''
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}
                if(this.min_width){
                    var pad = ' '
                    if(this.flag==='0'){pad="0"}
                    while(res.length<parseInt(this.min_width)){res=pad+res}
                }
                return res
            }else if(this.type=="f" || this.type=="F"){
                if(!isinstance(src,[int,float])){throw TypeError(
                    "%"+this.type+" format : a number is required, not "+str(src.__class__))}
                var num = parseFloat(src)
                if(this.precision){num = num.toFixed(parseInt(this.precision.substr(1)))}
                res = num+''
                if(this.flag===' '){res = ' '+res}
                else if(this.flag==='+' && num>=0){res = '+'+res}
                if(this.min_width){
                    var pad = ' '
                    if(this.flag==='0'){pad="0"}
                    while(res.length<parseInt(this.min_width)){res=pad+res}
                }
                return res
            }
        }
    }
    
    // elts is an Array ; items of odd rank are string format objects
    var elts = []
    var pos = 0, start = 0, nb_repl = 0
    var val = self.valueOf()
    while(pos<val.length){
        if(val.charAt(pos)=='%'){
            var f = new format(val.substr(pos))
            if(f.is_format && f.type!=="%"){
                elts.push(val.substring(start,pos))
                elts.push(f)
                start = pos+f.src.length
                pos = start
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
                var fmt = elts[1+2*i]
                elts[1+2*i]=fmt.format(args[i])
            }
        }else if(nb_repl<args.length){throw TypeError(
            "not all arguments converted during string formatting")
        }else{throw TypeError('not enough arguments for format string')}
    }
    var res = ''
    for(var i=0;i<elts.length;i++){res+=elts[i]}
    // finally, replace %% by %
    res = res.replace(/%%/g,'%')
    return res
}

str.__mul__ = function(self,other){
    if(!isinstance(other,int)){throw TypeError(
        "Can't multiply sequence by non-int of type '"+str(other.__class__)+"'")}
    $res = ''
    for(var i=0;i<other;i++){$res+=self.valueOf()}
    return $res
}

str.__ne__ = function(self,other){return other!==self.valueOf()}

str.__new__ = function(){return ''}

str.__not_in__ = function(self,item){return !str.__in__(self,item)}

str.__repr__ = function(self){
    if(self===undefined){return "<class 'str'>"}
    var qesc = new RegExp("'","g") // to escape single quote
    return "'"+self.replace(qesc,"\\'")+"'"
}

str.__setattr__ = function(self,attr,value){setattr(self,attr,value)}

self.__setitem__ = function(self,attr,value){
    throw TypeError("'str' object does not support item assignment")
}
str.__str__ = function(self){
    if(self===undefined){return "<class 'str'>"}
    else{return self.toString()}
}

// generate comparison methods
var $comp_func = function(self,other){
    if(typeof other !=="string"){throw TypeError(
        "unorderable types: 'str' > "+other.__class__+"()")}
    return self > other
}
$comp_func += '' // source code
var $comps = {'>':'gt','>=':'ge','<':'lt','<=':'le'}
for($op in $comps){
    eval("str.__"+$comps[$op]+'__ = '+$comp_func.replace(/>/gm,$op))
}

// unsupported operations
var $notimplemented = function(self,other){
    throw TypeError(
        "unsupported operand types for OPERATOR: '"+str(self.__class__)+"' and '"+str(other.__class__)+"'")
}
$notimplemented += '' // coerce to string
for($op in $operators){
    var $opfunc = '__'+$operators[$op]+'__'
    if(!($opfunc in str)){
        eval('str.'+$opfunc+"="+$notimplemented.replace(/OPERATOR/gm,$op))
    }
}

str.capitalize = function(self){
    if(self.length==0){return ''}
    return self.charAt(0).toUpperCase()+self.substr(1).toLowerCase()
}

str.casefold = function(self) {
  throw NotImplementedError("function casefold not implemented yet");
}

str.center = function(self,width,fillchar){
    if(fillchar===undefined){fillchar=' '}else{fillchar=fillchar}
    if(width<=self.length){return self}
    else{
        var pad = parseInt((width-self.length)/2)
        var res = Array(pad+1).join(fillchar) // is this statement faster than the for loop below?
        //for(var i=0;i<pad;i++){res+=fillchar}
        res = res + self + res
        if(res.length<width){res += fillchar}
        return res
    }
}

str.count = function(self,elt){
    if(!(typeof elt==="string")){throw TypeError(
        "Can't convert '"+str(elt.__class__)+"' object to str implicitly")}
    //needs to be non overlapping occurrences of substring in string.
    var n=0, pos=0
    while(true){
        pos=self.indexOf(elt,pos)
        if(pos>=0){ n++; pos+=elt.length} else break;
    }
    return n
}

str.encode = function(self) {
  throw NotImplementedError("function encode not implemented yet");
}

str.endswith = function(self){
    // Return True if the string ends with the specified suffix, otherwise 
    // return False. suffix can also be a tuple of suffixes to look for. 
    // With optional start, test beginning at that position. With optional 
    // end, stop comparing at that position.
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$MakeArgs("str.endswith",args,['suffix'],
        {'start':null,'end':null},null,null)
    var suffixes = $ns['suffix']
    if(!isinstance(suffixes,tuple)){suffixes=[suffixes]}
    var start = $ns['start'] || 0
    var end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)
    for(var i=0;i<suffixes.length;i++){
        suffix = suffixes[i]
        if(suffix.length<=s.length &&
            s.substr(s.length-suffix.length)==suffix){return True}
    }
    return False
}

str.expandtabs = function(self) {
  throw NotImplementedError("function expandtabs not implemented yet");
}

str.find = function(self){
    // Return the lowest index in the string where substring sub is found, 
    // such that sub is contained in the slice s[start:end]. Optional 
    // arguments start and end are interpreted as in slice notation. 
    // Return -1 if sub is not found.
    var $ns=$MakeArgs("str.find",arguments,['self','sub'],
        {'start':0,'end':self.length},null,null)
    var sub = $ns['sub'],start=$ns['start'],end=$ns['end']
    if(!isinstance(sub,str)){throw TypeError(
        "Can't convert '"+str(sub.__class__)+"' object to str implicitly")}
    if(!isinstance(start,int)||!isinstance(end,int)){throw TypeError(
        "slice indices must be integers or None or have an __index__ method")}
    var s = self.substring(start,end)
    var escaped = list("[.*+?|()$^")
    var esc_sub = ''
    for(var i=0;i<sub.length;i++){
        if(escaped.indexOf(sub.charAt(i))>-1){esc_sub += '\\'}
        esc_sub += sub.charAt(i)
    }
    var res = s.search(esc_sub)
    if(res==-1){return -1}
    else{return start+res}
}

str.format = function(self) {
  throw NotImplementedError("function format not implemented yet");
}

str.format_map = function(self) {
  throw NotImplementedError("function format_map not implemented yet");
}

str.index = function(self){
    // Like find(), but raise ValueError when the substring is not found.
    var res = str.find.apply(self,arguments)
    if(res===-1){throw ValueError("substring not found")}
    else{return res}
}

str.isalnum = function(self) {
  var pat=/^[a-z0-9]+$/i;
  return pat.test(self)
}

str.isalpha = function(self) {
  var pat=/^[a-z]+$/i;
  return pat.test(self)
}

str.isdecimal = function(self) {
  // this is not 100% correct
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

str.isdigit = function(self) {
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

str.isidentifier = function(self) {
  var keywords=['False', 'None', 'True', 'and', 'as', 'assert', 'break',
     'class', 'continue', 'def', 'del', 'elif', 'else', 'except', 'finally',
     'for', 'from', 'global', 'if', 'import', 'in', 'is', 'lambda', 'nonlocal',
     'not', 'or', 'pass', 'raise', 'return', 'try', 'while', 'with', 'yield'];

  if (keywords.contain(self)) return True

  // fixme..  this isn't complete but should be a good start
  var pat=/^[a-z][0-9a-z_]+$/i;
  return pat.test(self)
}

str.islower = function(self) {
  var pat=/^[a-z]+$/;
  return pat.test(self)
}

str.isnumeric = function(self) {
  // not sure how to handle unicode variables
  var pat=/^[0-9]+$/;
  return pat.test(self)
}

str.isprintable = function(self) {
  // inspired by http://www.codingforums.com/archive/index.php/t-17925.html
  var re=/[^ -~]/;
  return !re.test(self);
}

str.isspace = function(self) {
  var pat=/^\s+$/i;
  return pat.test(self)
}

str.istitle = function(self) {
  var pat=/^([A-Z][a-z]+)(\s[A-Z][a-z]+)$/i;
  return pat.test(self)
}

str.isupper = function(self) {
  var pat=/^[A-Z]+$/;
  return pat.test(self)
}

str.join = function(self,iterable){
    if(!'__item__' in iterable){throw TypeError(
         "'"+str(iterable.__class__)+"' object is not iterable")}
    var res = '',count=0
    for(var i=0;i<iterable.length;i++){
        var obj2 = iterable.__getitem__(i)
        if(!isinstance(obj2,str)){throw TypeError(
            "sequence item "+count+": expected str instance, "+obj2.__class__+"found")}
        res += obj2+self
        count++
    }
    if(count==0){return ''}
    res = res.substr(0,res.length-self.length)
    return res
}

str.ljust = function(self, width, fillchar) {
  if (width <= self.length) return self
  if (fillchar === undefined) { fillchar=' '}
  return self + Array(width - self.length + 1).join(fillchar)
}

str.lower = function(self){return self.toLowerCase()}

str.lstrip = function(self,x){
    var pattern = null
    if(x==undefined){pattern="\\s*"}
    else{pattern = "["+x+"]*"}
    var sp = new RegExp("^"+pattern)
    return self.replace(sp,"")
}

str.maketrans = function(self) {
  throw NotImplementedError("function maketrans not implemented yet");
}

str.partition = function(self,sep) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var i=self.indexOf(sep)
  if (i== -1) { return $tuple([self, '', ''])}
  return $tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}

function $re_escape(str)
{
  var specials = "[.*+?|()$^"
  for(var i=0;i<specials.length;i++){
      var re = new RegExp('\\'+specials.charAt(i),'g')
      str = str.replace(re, "\\"+specials.charAt(i))
  }
  return str
}

str.replace = function(self,old,_new,count){
    if(count!==undefined){
        if(!isinstance(count,[int,float])){throw TypeError(
            "'"+str(count.__class__)+"' object cannot be interpreted as an integer")}
        var re = new RegExp($re_escape(old),'g')
        
        var res = self.valueOf()
        while(count>0){
            if(self.search(re)==-1){return res}
            res = res.replace(re,_new)
            count--
        }
        return res
    }else{
        var re = new RegExp($re_escape(old),"g")
        return self.replace(re,_new)
    }
}

str.rfind = function(self){
    // Return the highest index in the string where substring sub is found, 
    // such that sub is contained within s[start:end]. Optional arguments 
    // start and end are interpreted as in slice notation. Return -1 on failure.
    var $ns=$MakeArgs("str.find",arguments,['self','sub'],
        {'start':0,'end':self.length},null,null)
    var sub = $ns['sub'],start=$ns['start'],end=$ns['end']
    if(!isinstance(sub,str)){throw TypeError(
        "Can't convert '"+str(sub.__class__)+"' object to str implicitly")}
    if(!isinstance(start,int)||!isinstance(end,int)){throw TypeError(
        "slice indices must be integers or None or have an __index__ method")}
    var s = self.substring(start,end)
    var reversed = ''
    for(var i=s.length-1;i>=0;i--){reversed += s.charAt(i)}
    var res = reversed.search(sub)
    if(res==-1){return -1}
    else{return start+s.length-1-res-sub.length+1}
}

str.rindex = function(){
    // Like rfind() but raises ValueError when the substring sub is not found
    var res = str.rfind.apply(this,arguments)
    if(res==-1){throw ValueError("substring not found")}
    else{return res}
}

str.rjust = function(self) {
    var $ns=$MakeArgs("str.rjust",arguments,['self','width'],
                      {'fillchar':' '},null,null)
    var width = $ns['width'],fillchar=$ns['fillchar']

    if (width <= self.length) return self

    return Array(width - self.length + 1).join(fillchar) + self
}

str.rpartition = function(self) {
  if (sep === undefined) {
     throw Error("sep argument is required");
     return
  }
  var i=self.lastindexOf(sep)
  if (i== -1) { return $tuple(['', '', self])}
  return $tuple([self.substring(0,i), sep, self.substring(i+sep.length)])
}

str.rsplit = function(self) {
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$MakeArgs("str.split",args,[],{},'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = $ns['kw'].get('maxsplit',maxsplit)

    var array=str.split(self) 

    if (array.length <= maxsplit) {
       return array
    }

    var s=[], j=1
    for (var i=0; i < maxsplit - array.length; i++) {
        if (i < maxsplit - array.length) {
           if (i > 0) { s[0]+=sep}
           s[0]+=array[i]
        } else {
           s[j]=array[i]
           j+=1
        }
    }
    return $tuple(s)
}

str.rstrip = function(self,x){
    if(x==undefined){pattern="\\s*"}
    else{pattern = "["+x+"]*"}
    sp = new RegExp(pattern+'$')
    return str(self.replace(sp,""))
}

str.split = function(self){
    var args = []
    for(var i=1;i<arguments.length;i++){args.push(arguments[i])}
    var $ns=$MakeArgs("str.split",args,[],{},'args','kw')
    var sep=None,maxsplit=-1
    if($ns['args'].length>=1){sep=$ns['args'][0]}
    if($ns['args'].length==2){maxsplit=$ns['args'][1]}
    maxsplit = $ns['kw'].get('maxsplit',maxsplit)
    if(sep===None){
        var res = []
        var pos = 0
        while(pos<self.length&&self.charAt(pos).search(/\s/)>-1){pos++}
        if(pos===self.length-1){return []}
        var name = ''
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
        var escaped = list('*.[]()|$^')
        var esc_sep = ''
        for(var i=0;i<sep.length;i++){
            if(escaped.indexOf(sep.charAt(i))>-1){esc_sep += '\\'}
            esc_sep += sep.charAt(i)
        }
        var re = new RegExp(esc_sep)
        if (maxsplit==-1){
            var a = self.split(re,maxsplit)
        }else{
            // javascript split behavior is different from python when
            // a maxsplit argument is supplied. (see javascript string split
            // function docs for details)
        
            var l=self.split(re,-1)
            var a=l.splice(0, maxsplit)
            var b=l.splice(maxsplit-1, l.length)
            a.push(b.join(sep))
        }
        return a;
    }
}

str.splitlines = function(self){return str.split(self,'\n')}

str.startswith = function(self){
    // Return True if string starts with the prefix, otherwise return False. 
    // prefix can also be a tuple of prefixes to look for. With optional 
    // start, test string beginning at that position. With optional end, 
    // stop comparing string at that position.
    $ns=$MakeArgs("str.startswith",arguments,['self','prefix'],
        {'start':null,'end':null},null,null)
    var prefixes = $ns['prefix']
    if(!isinstance(prefixes,tuple)){prefixes=[prefixes]}
    var start = $ns['start'] || 0
    var end = $ns['end'] || self.length-1
    var s = self.substr(start,end+1)
    for(var i=0;i<prefixes.length;i++){
        prefix = prefixes[i]
        if(prefix.length<=s.length &&
            s.substr(0,prefix.length)==prefix){return True}
    }
    return False
}

str.strip = function(self,x){
    if(x==undefined){x = "\\s"}
    pattern = "["+x+"]"
    return str.rstrip(str.lstrip(self,x),x)
}

str.swapcase = function(self) {
    //inspired by http://www.geekpedia.com/code69_Swap-string-case-using-JavaScript.html
    return self.replace(/([a-z])|([A-Z])/g, function($0,$1,$2)
        { return ($1) ? $0.toUpperCase() : $0.toLowerCase()
    })
}

str.title = function(self) {
    //inspired from http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
    return self.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

str.translate = function() {
    $ns=$MakeArgs("str.translate",arguments,['self','table'],
        {'deletechars':null},null,null)
    var table = $ns['table']
    var self = $ns['self']
    var d = $ns['deletechars']

    if (isinstance(table, str) && table.length !== 255) {
       throw Error("table variable must be a string of size 255")
    }
 
    if (d !== undefined) {
       var re = new RegExp(d)
       self=self.replace(re, '')
    }

    if (table !== None) {
       for (var i=0; i<self.length; i++) {
           self[i] = table.charCodeAt(self.charCodeAt(i));
       }
    }

    return self
}

str.upper = function(self){return self.toUpperCase()}

str.zfill = function(self, width) {
  if (width === undefined || width <= self.length) {
     return self
  }
  if (!self.isnumeric()) {
     return self
  }

  return Array(width - self.length +1).join('0');
}

// set String.prototype attributes

String.prototype.__class__ = str

String.prototype.__getattr__ = function(attr){
    if(attr==='__class__'){return str}
    if(str[attr]===undefined){throw AttributeError("'str' object has no attribute '"+attr+"'")}
    var obj = this
    var res = function(){
        var args = [obj]
        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
        return str[attr].apply(obj,args)
    }
    res.__str__ = function(){return "<built-in method "+attr+" of str object>"}
    return res
}

for(var attr in str){
    if(String.prototype[attr]===undefined){
        String.prototype[attr]=(function(attr){
            return function(){
                var args = [this]
                for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
                return str[attr].apply(this,args)
            }
        })(attr)
    }
}

return str
}()
