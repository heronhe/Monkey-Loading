//cce heron
//update time:2016-12-27
//参数{LDpage,LDdom,LDtween,LDup,LDsuccess}
//对象加载状态0:未开始加载，1：加载完成，2：加载失败，3：加载失败结束加载

//MK继承
function MK_Extend(SubClass, SuperClass){
	//原型链层级保持一致性
	var __prototype = function(){};
	__prototype.prototype = SuperClass.prototype;
  	SubClass.prototype = new __prototype();
  	SubClass.prototype.constructor = SubClass;
}

function EventDispatcher()
{
    this.registorPool = {};
    this.registorPoolvision = "1.0";
}

EventDispatcher.prototype.addEventListener = function(eventtype,fun) {
	var self = this;
    if(!self.registorPool[eventtype]) {
        self.registorPool[eventtype]=new Array();
    }
	var arr = self.registorPool[eventtype];
	var isContain=false;
	for(var i=0, lgt = arr.length; i < lgt; i++)
	{
		if(arr[i]==fun)
		{
			isContain=true;
			break;
		}
	}
	
	if(!isContain && fun && typeof fun == 'function') self.registorPool[eventtype].push(fun);
	
}
EventDispatcher.prototype.dispatchEvent = function(event,fn){
	var self = this;
    if(self.registorPool[event.type]) {
        var arr = self.registorPool[event.type];
		var isMatch = false;
		
        for(var i = 0, lgt = arr.length; i < lgt; i++) {
			event.target = self;
			if(fn && fn == arr[i]){
				isMatch = true;
			}
        }
		if(isMatch){
			 fn(event.data);
		}else if(fn && !isMatch){
			 alert("未先监听"+fn.getName()+"方法");
		}else{
			for(var i = 0, lgt = arr.length; i < lgt; i++) {
				arr[i](event.data);
			}
		}
    }
}
EventDispatcher.prototype.removeEventListener = function(eventtype,fun) {
	var self = this;
    if(self.registorPool[eventtype]) {
        var arr = self.registorPool[eventtype];
        for(var i=0, lgt = arr.length; i < lgt; i++) {
            if(arr[i]==fun) {
                arr.splice(i,1);
            }
        }
    }
}

function Event(type,data){
    this.type=type;
    this.data=data;
    this.target=null;
}

Function.prototype.getName = function(){
    return this.name || this.toString().match(/function\s*([^(]*)\(/)[1]
}

//是否安卓
var isAndroid=(function(){
	return /(Android)/i.test(navigator.userAgent);
})();

//是否是dom对象
var isDom=function(e){
	if(typeof(e)=="object" && e instanceof HTMLElement){
		return true;
	}
	return false;
};

//是否是JQdom对象
var isJQ=function(e){
	if(window.jQuery&&typeof(e) == "object"&&e instanceof jQuery){
		return true;
	}
	return false;
};

//是否是加载dom对象
var isLdDom = function(e){
	if(typeof(e)=="object" && e instanceof HTMLElement){
		var type=e.nodeName.toLowerCase();
		if(type=="img"){
			return true;
		}
	}
	return false;
};

//是否是加载完成对象
var isLdCompleteList = function(e){
	if(typeof(e)=="object"&&"sort" in e){
		var _obj=e[0];
		if("src" in _obj&&"e" in _obj){
			return true;
		}
	}
	return false;
};

//是否设置load格式
var isLdDomFormat = function(e){
	if(!e)
		return false;
	return e.src && e.type === 'img' ? true : false;
}

//获取dom类型
var getDomType=function(e){
	return e.nodeName.toLowerCase();
};

Array.prototype.getImgList=function(){
	var _imgList=[];
	for(val in this){
		var _obj=this[val];
		if("src" in _obj&&"e" in _obj)
		_imgList.push(_obj.e);
	}
	return _imgList;
};

var MK_Loading = (function(){

	function _targetLibrary(o){
		for(var _attr in o){
			this[_attr] = o[_attr];
		}
	};
	_targetLibrary.prototype.getDom = function(){
		return this.e || null;
	}

	_targetLibrary.prototype.load = function(){
		this.count++; //load次数
		this.e.src = this.src;
	};

	function MK_Loading(p){
		var _s = this;
		EventDispatcher.call(this);
		_s.p = p;
		_s.srcNames = p.srcNames ? p.srcNames : "alts";
		_s.loadUp = typeof(p.LDup)==="function" ? p.LDup : null;
		_s.callback = typeof(p.LDsuccess)==="function" ? p.LDsuccess : null;//加载完成回调
		
		_s.list = [];//需要加载列表
		_s.suclist = [];//加载成功列表
		_s.set = null;
		_s.timers = 30;
		_s.length = null;
		_s.errorCount = 3; //错误加载次数
		_s.upDate(0);

		if(_s.p.LDpage){//加载页面所有加载对象
			_s.getDomList(document);
			return;
		};
		
		if(_s.p.LDdom){
			_s.addLoadObject(_s.p.LDdom);
		};
		
	};

	MK_Extend(MK_Loading, EventDispatcher);

	MK_Loading.prototype.setDomList = function(domlist, type){
		var _s = this,
			stack=[];
		for(var m = 0, lgt = domlist.length; m < lgt; m++){
			var _src = domlist[m].getAttribute(_s.srcNames);
			if(_src){
				stack.push(_s.addLDstack({type: type, src: _src, e: domlist[m]}));
			}
		};
		return stack;
	};
	
	MK_Loading.prototype.setAddList = function(arry){
		var _s = this,
			stack = [];
		for(var n = 0, lgt = arry.length; n < lgt; n++){
			stack.push(_s.addLDstack(arry[n]));
		};
		return stack;
	};
	
	//获取dom所有加载对象
	MK_Loading.prototype.getDomList = function(o){
		var _s = this,
			imglist =  o.getElementsByTagName("img");
		return _s.setDomList(imglist,"img");
	};
	
	//获取jq对象所有加载对象
	MK_Loading.prototype.getJqList = function(o, list){
		var _s = this,
			data = [],
			imglist = o.find("img");
		return _s.setDomList(imglist, "img");
	};
	
	MK_Loading.prototype.addLoadObject = function(o){
		var _s = this;

		if(isDom(o)){
			if(isLdDom(o)){
				return _s.setDomList([o],type);
			}else{
				return _s.getDomList(o);
			}
		}else if(isJQ(o)){
			if(o.length <= 0)
				return [];
			var type = getDomType(o[0]);
			if(type == "img"){
				return _s.setDomList(o, type);
			}else{
				return _s.getJqList(o);
			}
		}else if(isLdDomFormat(o)){
			return [_s.addLDstack(o)];
		}else if(typeof o.sort == 'function'){
			var _ldDomList = [];
			for(var i = 0, lgt = o.length; i < lgt; i++){
				if(isLdDomFormat[i])
					_ldDomList.push(_s.addLDstack(o));

			}
			return _ldDomList;
		}

		return [];
	};

	MK_Loading.prototype.init = function(){//加载对象初始化
		var _s = this;
		console.log(_s.list)
		for(var m=0, lgt = _s.list.length; m < lgt; m++){

			(function(n){
				var _LDobj=_s.list[n];
				_LDobj.status=0;
				_LDobj.count=0;

				switch(_LDobj.type){
					case 'img': //图片加载
					_LDobj.e = _LDobj.e || new Image();
					
					//suc
					_LDobj.e.onload = function(){
						_LDobj.status=1;
						_s.removeLD(_LDobj);
					};
					
					//fail
					_LDobj.e.onerror = function(){
						if(_LDobj.count < _s.errorCount){
							_LDobj.status=2;
							_LDobj.load();
						}else{
							_LDobj.status=3;
							_s.removeLD(_LDobj);
						}
					};
					break;

					case 'ajax'://ajax
					_LDobj.load = function(){
						_LDobj.count++;
						_LDobj.ajaxFn();
					};
				}
				
			})(m);
		};
	};

	MK_Loading.prototype.upDate=function(val){
		var _s = this;

		if(_s.loadUp)
			_s.loadUp(val);		
		_s.dispatchEvent(new Event("update",val));
	};

	MK_Loading.prototype.start=function(){//加载开始
		var _s = this;
		_s.init();
		_s.length = _s.getLength();
		_s.loads();
		
		var	speed=0,
			__up = function(){
				var LDprogress = parseInt(_s.suclist.length / _s.length * 100);
				if(LDprogress <= 100){
					if(_s.p.LDtween && speed < LDprogress){
						speed++;
					}else{
						speed=LDprogress;
					}
					
					//加载更新
					_s.upDate(speed);
					
					//加载成功
					if(speed == 100){
						clearInterval(_s.set);

						if(_s.callback)
							_s.callback();
						
						_s.dispatchEvent(new Event("complete",speed));
					}
				};
			};
		_s.set = setInterval(__up, _s.timers);
	};
	
	MK_Loading.prototype.add = function(__o){
		var _s = this;
		return typeof __o === 'object' ? _s.addLoadObject(__o) : [];
	};
	
	MK_Loading.prototype.addLDstack = function(o){
		var _s = this,
			isLD = _s.isLoad(o.e),
			__LDobj;

		if(isLD){
			__LDobj = isLD;
		}else{
			var _tagLib = new _targetLibrary(o);
			var length = _s.list.push(_tagLib);
			__LDobj = _tagLib;
		}

		return __LDobj;
	};
	

	MK_Loading.prototype.addImgSheet = function(){//添加图片动画帧 参数imgPrefix,imgType,start,length,step
		var _s = this,
			arg = arguments[0],
            _list = [];
        var mask=arg.mask || '00';
        for(var i=0, lgt = arg.length; i < lgt; i += arg.step){
            var pindex = arg.start + i;
            pindex = mask.toString() + pindex;
            pindex = pindex.substr(pindex.length-mask.length, mask.length);
            _list.push({type:"img", src:arg.imgPrefix+pindex+"."+arg.imgType});
        };
        return _s.setAddList(_list);
    };

	//添加ajax进入load
    MK_Loading.prototype.addAjax = function(fn){
    	var _s = this;
    	_s.list.push({
            id: Math.random(),
    		type: 'ajax',
    		ajaxFn: function(){
    			var _LDobj = this;
    			fn(function(err, result){
    				
					if(err){ //成功
						if(_LDobj.count < _s.errorCount){
                            _LDobj.status=2;
                            _LDobj.load();
						}else{
                            _LDobj.status=3;
							_s.removeLD(_LDobj);
						}
					}else{ //成功
						_LDobj.status=1;
						_s.removeLD(_LDobj);
					}
					
    			});
    		}
    	});
    }
	
	MK_Loading.prototype.isLoad = function(e){//判断是否已经添加过load对象
		var _s = this;
		for(var m = 0, lgt = _s.list.length; m < lgt; m++){
			if(e && _s.list[m].e == e){
				return _s.list[m];
			}
		}
		return false;
	};
	
	MK_Loading.prototype.loads = function(){
		var _s = this;
		for(var m=0, lgt = _s.list.length; m < lgt; m++){
			_s.list[m].load();
		}
	};
	
	MK_Loading.prototype.getLength = function(){//获取加载长度
		var _s = this;
		return _s.list.length;
	};
	
	MK_Loading.prototype.removeLD = function(o){//移除加载队列
		var _s = this;
		var n=0;
		while(n < _s.list.length){
			if(_s.list[n] == o){
				_s.suclist.push(o);
				_s.list.splice(n,1);
				break;
			}
			n++;
		};
	};

	return MK_Loading;
}());


//参数说明,parents:目标对象，type：播放类型；widht:宽，height:高，imgList：加载完成图片数组，step：播放序列帧步长，times：播放间隔时间,loop:循环播放boolean类型
var MK_animateImages=(function(){
	
	var rmsPrefix = /^-ms-/,
		rdashAlpha = /-([\da-z])/gi,
		fcamelCase = function( all, letter) {
			return letter.toUpperCase();
		},
		cssPrefixes = [ "Webkit", "O", "Moz", "ms" ];
	
	function camelCase(string) {
		return string.replace( rmsPrefix, "ms-" ).replace( rdashAlpha, fcamelCase );
	}
	
	function vendorPropName( style, name ) {
		if ( name in style ) {
			return name;
		}
		var capName = name.charAt(0).toUpperCase() + name.slice(1),
			origName = name,
			i = cssPrefixes.length;
	
		while ( i-- ) {
			name = cssPrefixes[ i ] + capName;
			if ( name in style ) {
				return name;
			}
		}
	
		return origName;
	}
	
	var setOp=function(o,_v){
		if(o.runtimeStyle) { //ie
			if(typeof o.runtimeStyle["opacity"] === "undefined"){
				o.style.filter="alpha(opacity="+_v*100+")";
			}
			else{
				o.runtimeStyle["opacity"]=_v;
			}
		} else{
			o.style["opacity"]=_v;
		}
	};
	
	function animateImages(p){
		EventDispatcher.call(this);
		var self=this;
		if(p.imgList.length>0){
			self.width = p.width?p.width:p.imgList[0].width;//宽
			self.height = p.height?p.height:p.imgList[0].height;//高
		}
		if(isDom(p.parents))
		self.parents=p.parents;//显示对象
		else if(isJQ(p.parents))
		self.parents=p.parents[0];
		self.anmtList=p.imgList;//加载的图片数组
		self.type=p.type?p.type:"canvas";//播放类型
		self.step=p.step;//播放跳屏次数
		self.times=p.times;//播放时间
		self.ITV=null;
		self.startIndex=0;//起始帧数
		self.endIndex;//结束帧数
		self.progress=0;//播放进度
		self.loop = p.loop;//是否循环
		self.up=null;//播放更新
		self.drawImages = function(){};
		self.clear = function(){};//清空
	}

	MK_Extend(animateImages, EventDispatcher);

	animateImages.prototype.toProgress=function(n){//设置播放进度
		var self = this;
		self.progress=n;
		self.drawImages(n);
	};
	
	animateImages.prototype.setStart=function(n){//设置播放起始帧数
		var self = this;
		self.startIndex=n;
		self.toProgress(n);
	};
	
	animateImages.prototype.setEnd=function(n){//设置结束帧数
		var self = this;
		if(n>self.length)
		self.endIndex=self.length
		else
		self.endIndex=n;
	};
	
	animateImages.prototype.play=function(){//播放
		var self = this;
		if(self.ITV || this.anmtList.length == 0)
            return;
		self.ITV=setInterval(function(){
			if(self.progress >= self.endIndex){
				self.dispatchEvent(new Event("complete",self.progress));
				if(self.loop)
					self.progress = self.startIndex;
				else{
					self.stop();
					return;
				}
				
			}
			self.toProgress(self.progress);
			self.dispatchEvent(new Event("update",self.progress));
			self.dispatchEvent(new Event(self.progress,self.progress));
			self.progress+=self.step;
			
		},self.times);
	};
	
	animateImages.prototype.stopActivity=function(){
		var self = this;
		if(self.ITV){
			clearInterval(self.ITV);
			self.ITV=null;
		}
	};
	
	animateImages.prototype.pause=function(){//暂停
		var self = this;
		self.stopActivity();
	};
	
	animateImages.prototype.stop=function(){//停止
		var self = this;
		self.stopActivity();
		self.progress=self.startIndex;
	};
	
	animateImages.prototype.creatElment=function(name){
		var self = this;
		return document.createElement(name);
	}
	
	animateImages.prototype.setCssObj=function(o,jsons){
		var self = this;
		for(name in jsons){
			self.css(o,name,jsons[name]);
		}
	};
	
	animateImages.prototype.css=function(obj,_s,_v){
		var self = this;
		if(typeof _s==="undefined"||!_s)
		return false;
		
		if(typeof _s==="object"){
			self.setCssObj(obj,_s);
			return false;
		};
		
		var origName = camelCase(_s);
		var style = obj.style;
		var name = vendorPropName( style, origName );
		
		if(name == "opacity"){
			setOp(obj,_v);
			return ;
		}
		
		if(typeof _v==="undefined"){
			if(obj.style[name]!=""){
				return obj.style[name];
			}else if(window.getComputedStyle){
				return window.getComputedStyle(obj , null)[name];
			}else if(obj.currentStyle){
				return obj.currentStyle[name];
			}else{
				return "auto";
			}
		}else{
			if(obj.runtimeStyle) { //ie
				obj.runtimeStyle[name]=_v;
			} else{
				obj.style[name]=_v;
			}
		}
	}
	
	animateImages.prototype.remove=function(){
		var self = this;
		while(self.parents.hasChildNodes()){
			self.parents.removeChild(self.parents.firstChild);
		}
	};
	
	return animateImages;

})();


function MK_animateSheet(p){
	if(isLdCompleteList(p.imgList)){
		p.imgList = p.imgList.getImgList();
	}else{
		p.imgList = [];
	}
	this.length = p.imgList.length;

	MK_animateImages.call(this,p);

	var self = this;
	if(self.type == "canvas"){
		self.canvas = self.creatElment("canvas");
		self.canvas.width = self.width;
		self.canvas.height = self.height;
		self.parents.appendChild(self.canvas);
		var ctx = self.canvas.getContext("2d");
		self.drawImages = function(n){
			self.clear();
			ctx.drawImage(self.anmtList[n],0,0);
		};
		self.clear = function(){
			ctx.clearRect(0,0,self.width,self.height);
		};
	}else if(self.type == "img"){
		self.drawImages = function(n){
			self.clear();
			self.parents.appendChild(self.anmtList[n]);
		};
		self.clear = function(){
			while(self.parents.hasChildNodes()){
				self.parents.removeChild(self.parents.firstChild);
			}
		};
	}
	
	self.endIndex = self.length;
	self.toProgress(self.progress);
}
MK_Extend(MK_animateSheet, MK_animateImages);

//参数：row：行数，column：列数；
function MK_animateSprite(p){
	
	if(isDom(p.imgList)){
		p.imgList=[p.imgList];
	}else if(isLdCompleteList(p.imgList)){
		p.imgList=p.imgList.getImgList();
	}else if(!isJQ(p.imgList)){
		p.imgList=[];
	}
	this.length=p.row*p.column;

	MK_animateImages.call(this,p);

	var self=this;
	var _img=self.anmtList[0];
	if(!_img)
		return;

	self.getPosition=function(n){
		return {
			x:-(n%p.column*self.width),
			y:-(parseInt(n/p.column)*self.height)
		};
	};
	if(self.type == "canvas"){
		self.remove();
		self.canvas = self.creatElment("canvas");
		self.canvas.width = self.width;
		self.canvas.height = self.height;
		self.parents.appendChild(self.canvas);
		var ctx = self.canvas.getContext("2d");
		var imgW = _img.width;
		var imgH = _img.height;
		self.drawImages = function(n){
			self.clear();
			var _position = self.getPosition(n);
			ctx.drawImage(_img, _position.x, _position.y, imgW, imgH);
		};
		self.clear = function(){
			ctx.clearRect(0, 0, self.width, self.height);
		};
	}else if(self.type == "img"){
		var box = self.creatElment("div");
		self.css(box,{position:"absolute",top:0,left:0,width:self.width+"px",height:self.height+"px",overflow:"hidden"});
		self.parents.appendChild(box);
		box.appendChild(_img);
		self.css(_img,{position:"absolute",top:0,left:0});
		self.drawImages = function(n){
			var _position = self.getPosition(n);
			self.css(_img,{top:_position.y+"px",left:_position.x+"px"});
		};
		self.clear = function(){
			while(self.parents.hasChildNodes()){
				self.parents.removeChild(self.parents.firstChild);
			}
		};
	}
	
	self.endIndex = self.length;
	self.toProgress(self.progress);
}

MK_Extend(MK_animateSprite, MK_animateImages);
