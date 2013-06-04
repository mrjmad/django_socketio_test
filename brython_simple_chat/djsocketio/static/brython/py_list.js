list = function(){

function $list(){
    // used for list displays
    // different from list : $list(1) is valid (matches [1])
    // but list(1) is invalid (integer 1 is not iterable)
    var args = new Array()
    for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
    return new $ListClass(args)
}

function list(){
    if(arguments.length===0){return []}
    else if(arguments.length>1){
        throw TypeError("list() takes at most 1 argument ("+arguments.length+" given)")
    }
    var res = []
    list.__init__(res,arguments[0])
    res.__brython__ = true // false for Javascript arrays - used in sort()
    return res
}

list.__add__ = function(self,other){
    var res = self.valueOf().concat(other.valueOf())
    if(isinstance(self,tuple)){res = tuple(res)}
    return res
}

list.__class__ = $type

list.__contains__ = function(self,item){
    for(var i=0;i<self.length;i++){
        try{if(self[i].__eq__(item)){return true}
        }catch(err){void(0)}
    }
    return false
}

list.__delitem__ = function(self,arg){
    if(isinstance(arg,int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){
            self.splice(pos,1)
            return
        }
        else{throw IndexError('list index out of range')}
    } else if(isinstance(arg,slice)) {
        var start = arg.start || 0
        var stop = arg.stop || self.length
        var step = arg.step || 1
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        var res = [],i=null
        if(step>0){
            if(stop>start){
                for(i=start;i<stop;i+=step){
                    if(self[i]!==undefined){res.push(i)}
                }
            }
        } else {
            if(stop<start){
                for(i=start;i>stop;i+=step.value){
                    if(self[i]!==undefined){res.push(i)}
                }
                res.reverse() // must be in ascending order
            }
        }
        // delete items from left to right
        for(var i=res.length-1;i>=0;i--){
            self.splice(res[i],1)
        }
        return
    } else {
        throw TypeError('list indices must be integer, not '+str(arg.__class__))
    }
}

list.__eq__ = function(self,other){
    if(other===undefined){ // compare object "self" to class "list"
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

list.__getattr__ = function(attr){
    switch(attr){
        case '__class__':
            var res = function(){return list}
            res.__str__ = list.__str__
            return res
        case '__name__':
            var res = function(){
                throw AttributeError(" 'list' object has no attribute '__name__'")
            }
            res.__str__ = function(){return 'list'}
            return res
        default:
            return list[attr]
    }
}

list.__getitem__ = function(self,arg){
    if(isinstance(arg,int)){
        var items=self.valueOf()
        var pos = arg
        if(arg<0){pos=items.length+pos}
        if(pos>=0 && pos<items.length){return items[pos]}
        else{
            throw IndexError('list index out of range')
        }
    } else if(isinstance(arg,slice)) {
        var step = arg.step===None ? 1 : arg.step
        if(step>0){
            var start = arg.start===None ? 0 : arg.start
            var stop = arg.stop===None ? self.__len__() : arg.stop
        }else{
            var start = arg.start===None ? self.__len__()-1 : arg.start
            var stop = arg.stop===None ? 0 : arg.stop
        }
        if(start<0){start=int(self.length+start)}
        if(stop<0){stop=self.length+stop}
        var res = [],i=null,items=self.valueOf()
        if(step>0){
            if(stop<=start){return res}
            else {
                for(i=start;i<stop;i+=step){
                    if(items[i]!==undefined){res.push(items[i])}
                    else {res.push(None)}
                }
                return res
            }
        } else {
            if(stop>=start){return res}
            else {
                for(i=start;i>=stop;i+=step){
                    if(items[i]!==undefined){res.push(items[i])}
                    else {res.push(None)}
                }
                return res
            }
        } 
    } else if(isinstance(arg,bool)){
        return self.__getitem__(int(arg))
    } else {
        throw TypeError('list indices must be integer, not '+str(arg.__class__))
    }
}

list.__hash__ = function(self){throw TypeError("unhashable type: 'list'")}

list.__in__ = function(self,item){return item.__contains__(self)}

list.__init__ = function(self){
    while(self.__len__()>0){self.pop()}
    if(arguments.length===1){return}
    var arg = arguments[1]
    for(var i=0;i<arg.__len__();i++){self.push(arg.__item__(i))}
}

list.__item__ = function(self,i){return self[i]}

list.__len__ = function(self){return self.length}

list.__mul__ = function(self,other){
    if(isinstance(other,int)){return other.__mul__(self)}
    else{throw TypeError("can't multiply sequence by non-int of type '"+other.__name+"'")}
}

list.__name__ = 'list'

list.__ne__ = function(self,other){return !self.__eq__(other)}

list.__new__ = function(){return []}

list.__not_in__ = function(self,item){return !list.__in__(self,item)}

list.__repr__ = function(self){
    if(self===undefined){return "<class 'list'>"}
    var items=self.valueOf()
    var res = '['
    if(self.__class__===tuple){res='('}
    for(var i=0;i<self.length;i++){
        var x = self[i]
        if(x.__repr__!==undefined){res+=x.__repr__()}
        else{res += x.toString()}
        if(i<self.length-1){res += ','}
    }
    if(self.__class__===tuple){return res+')'}
    else{return res+']'}
}

list.__setitem__ = function(self,arg,value){
    if(isinstance(arg,int)){
        var pos = arg
        if(arg<0){pos=self.length+pos}
        if(pos>=0 && pos<self.length){self[pos]=value}
        else{throw IndexError('list index out of range')}
    } else if(isinstance(arg,slice)){
        var start = arg.start===None ? 0 : arg.start
        var stop = arg.stop===None ? self.__len__() : arg.stop
        var step = arg.step===None ? 1 : arg.step
        if(start<0){start=self.length+start}
        if(stop<0){stop=self.length+stop}
        self.splice(start,stop-start)
        // copy items in a temporary JS array
        // otherwise, a[:0]=a fails
        if(hasattr(value,'__item__')){
            var $temp = list(value)
            for(var i=$temp.length-1;i>=0;i--){
                self.splice(start,0,$temp[i])
            }
        }else{
            throw TypeError("can only assign an iterable")
        }
    }else {
        throw TypeError('list indices must be integer, not '+str(arg.__class__))
    }
}

list.__str__ = list.__repr__

list.append = function(self,other){self.push(other)}

list.count = function(self,elt){
    var res = 0
    for(var i=0;i<self.length;i++){
        if(self[i].__eq__(elt)){res++}
    }
    return res
}

list.extend = function(self,other){
    if(arguments.length!=2){throw TypeError(
        "extend() takes exactly one argument ("+arguments.length+" given)")}
    try{
        for(var i=0;i<other.__len__();i++){self.push(other.__item__(i))}
    }catch(err){
        throw TypeError("object is not iterable")
    }
}

list.index = function(self,elt){
    for(var i=0;i<self.length;i++){
        if(self[i].__eq__(elt)){return i}
    }
    throw ValueError(str(elt)+" is not in list")
}

list.insert = function(self,i,item){self.splice(i,0,item)}

list.remove = function(self,elt){
    for(var i=0;i<self.length;i++){
        if(self[i].__eq__(elt)){
            self.splice(i,1)
            return
        }
    }
    throw ValueError(str(elt)+" is not in list")
}

list.pop = function(self,pos){
    if(pos===undefined){ // can't use self.pop() : too much recursion !
        var res = self[self.length-1]
        self.splice(self.length-1,1)
        return res
    }else if(arguments.length==2){
        if(isinstance(pos,int)){
            var res = self[pos]
            self.splice(pos,1)
            return res
        }else{
            throw TypeError(pos.__class__+" object cannot be interpreted as an integer")
        }
    }else{ 
        throw TypeError("pop() takes at most 1 argument ("+(arguments.length-1)+' given)')
    }
}

list.reverse = function(self){
    for(var i=0;i<parseInt(self.length/2);i++){
        var buf = self[i]
        self[i] = self[self.length-i-1]
        self[self.length-i-1] = buf
    }
}
    
// QuickSort implementation found at http://en.literateprograms.org/Quicksort_(JavaScript)
function $partition(arg,array,begin,end,pivot)
{
    var piv=array[pivot];
    array.swap(pivot, end-1);
    var store=begin;
    for(var ix=begin;ix<end-1;++ix) {
        if(arg(array[ix]).__le__(arg(piv))) {
            array.swap(store, ix);
            ++store;
        }
    }
    array.swap(end-1, store);
    return store;
}

Array.prototype.swap=function(a, b)
{
    var tmp=this[a];
    this[a]=this[b];
    this[b]=tmp;
}

function $qsort(arg,array, begin, end)
{
    if(end-1>begin) {
        var pivot=begin+Math.floor(Math.random()*(end-begin));
        pivot=$partition(arg,array, begin, end, pivot);
        $qsort(arg,array, begin, pivot);
        $qsort(arg,array, pivot+1, end);
    }
}

list.sort = function(self){
    var func=function(x){return x}
    var reverse = false
    for(var i=1;i<arguments.length;i++){
        var arg = arguments[i]
        if(isinstance(arg,$Kw)){
            if(arg.name==='key'){func=arg.value}
            else if(arg.name==='reverse'){reverse=arg.value}
        }
    }
    if(self.length==0){return}
    $qsort(func,self,0,self.length)
    if(reverse){list.reverse(self)}
    // Javascript libraries might use the return value
    if(!self.__brython__){return self}
}

list.toString = list.__str__

function $ListClass(items){

    var x = null,i = null;
    this.iter = null
    this.__class__ = list
    this.items = items // JavaScript array
}

// add Brython attributes to Javascript Array


// set other Array.prototype attributes

for(var attr in list){
    if(typeof list[attr]==='function'){list[attr].__str__=function(){return "<list method "+attr+">"}}
    var func = (function(attr){
        return function(){
            var args = [this]
            for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
            return list[attr].apply(this,args)
        }
    })(attr)
    func.__str__ = (function(attr){
        return function(){return "<method-wrapper '"+attr+"' of list object>"}
    })(attr)
    Array.prototype[attr] = func
}

Array.prototype.__class__ = list

Array.prototype.__getattr__ = function(attr){
    if(attr==='__class__'){return this.__class__} // may be list or tuple
    if(list[attr]===undefined){
        throw AttributeError("'"+this.__class__.__name__+"' object has no attribute '"+attr+"'")
    }
    if(this.__class__===tuple && 
        ['__add__','__delitem__','__setitem__',
        'append','extend','insert','remove','pop','reverse','sort'].indexOf(attr)>-1){
        throw AttributeError("'"+this.__class__.__name__+"' object has no attribute '"+attr+"'")
    }
    var obj = this
    var res = function(){
        var args = [obj]
        for(var i=0;i<arguments.length;i++){args.push(arguments[i])}
        return list[attr].apply(obj,args)
    }
    res.__str__ = function(){return "<built-in method "+attr+" of "+obj.__class__.__name__+" object>"}
    return res
}
return list
}()

