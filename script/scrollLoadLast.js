//v1.0 by PP;
//初始化
// $(dom).scrollLoad(
// 	{
// 		spaceUp:0.5,//触发下拉刷新的拉动距离比例，覆盖默认space
// 		spaceDown:0.5,//触发上拉加载的拉动距离比例，覆盖默认space
// 		request:function(SLObj){//到达设定位置，触发此加载函数
// 			if(SLObj.load){
// 				//加载
// 				data={};
// 			}else if(SLObj.refresh){
// 				//刷新
// 				data={};
// 			}
// 			Ares.Service.get(data,{},function(json){
//
SLObj.html($(temp).render(json));//通知插件插入html
// 				SLObj.complete();//通知插件数据全部加载完成，后续将不再执行request方法,并回显数据加载完成数据
//
// 			})
// 		}
// 	}
// )

/*提示栏样式部分
 * before-load 	标记未加载状态
 * prepare-load 标记准备加载状态
 * load			标记正在加载状态
 * 对于底部提示框，还有一个complete状态
 * complete		标记没有数据或者数据加载全部完成状态
 * */

/*HTML结构部分
 *<div id="scrollLoad"><!--滚动容器-->

 <div class='content'>

 <div class='scrollLoad-tipRefresh'><span class='tip'></span></div><!--刷新提示-->
 <ul class="scrollLoad-content"><!--内容部分-->

 </ul>
 <div class='scrollLoad-tipLoad'><span class='tip'></span></div><!--加载提示-->
 </div>

 </div>
 *
 *
 * */

// $(dom).scrollLoad('load');//手动触发加载，将会覆盖掉已有数据
// $(dom).scrollLoad('destroy');//销毁滚动加载实例


$.fn.scrollLoad=function(){

	var defaultOption={
		spaceUp:0.3,
		spaceDown:0.3,
		content: ".scrollLoad-content",//数据加载容器
		tip:{
			load:".scrollLoad-tipLoad",//加载，提示节点
			refresh:".scrollLoad-tipRefresh"//刷新，提示节点
		},
		reminder : {//提示语句
			load:{
				tipShow:"向上继续拖动加载数据！",
				tipChange:"释放以加载！",
				tipLoading:"正在加载！"
			},
			refresh:{
				tipShow:"向下拖动刷新！",
				tipChange:"释放以刷新！",
				tipLoading:"正在加载！"
			}
		},
		request:function(e){

			console.log(e);
		}
	};

	return function(option){

		var ts= this[0];

		if($(ts).data('method')){

			var method=$(ts).data('method');

			if(typeof option =='string'){

				if(option in method){

					method[option]();

				}else{

					throw new Error('无效的传入参数，包含refresh和destroy两个方法');
				}
			}else{

				throw new Error('无效的传入参数，包含refresh和destroy两个方法');
			}
			return;
		}


		//合并参数
		var args=$.extend(true,{},defaultOption,option);
		var spaceUp=args.spaceUp,
			spaceDown=args.spaceDown;
		var $tipLoad=$(args.tip.load),//刷新提示
			$tipRefresh=$(args.tip.refresh);//加载提示
		var $content=$(args.content);//内容区域
		var refreshH=$tipRefresh.outerHeight();//获取上拉刷新提示框的高度

		$tipLoad.addClass('before-load').hide().find('.tip').text(args.reminder.load.tipShow);
		$tipRefresh.addClass('before-load').hide().css({marginTop:refreshH*-1+'px'}).find('.tip').text(args.reminder.refresh.tipShow);

		var myScroll= new IScroll(ts,{probeType:2}),
			wrapperHeight=myScroll.wrapperHeight,
			isTouch=false,//滚动是由手指点击触发的
			scrollStartTime= 0,//记录滚动的起始时间
			currentY=0;//记录当前滚动距离

		spaceUp*=wrapperHeight;
		spaceDown*=wrapperHeight;

		var lock=false,//锁定加载状态
			complete=false,//加载完成
			lockRefreshOn=false,//锁定状态，确保tipchange事件不会反复触发
			lockRefreshOff=false,//锁定状态，确保tipchange事件不会反复触发
			lockLoadOn=false,//锁定状态，确保tipchange事件不会反复触发
			lockLoadOff=false;//锁定状态，确保tipchange事件不会反复触发

		var myScrollEvent=function(){//request函数传参，通过此方法可以控制滚动加载
			return {
				html:function(html){//插入内容

					var $fragment=$(html);

					if(lock&&lockLoadOn){//追加
						$content.append($fragment);
					}else if(lock&&lockRefreshOn){//覆盖
						$content.html($fragment);
					}
					lock=false;
					lockRefreshOn=false;
					lockLoadOn=false;
					$(myScroll.wrapper).trigger("tipHide");
					return $fragment;
				},
				complete:function(txt){//数据加载完成,不再加载数据
					complete=true;
					$tipLoad.removeClass('before-load').addClass('complete').show().find('.tip').text(txt||'数据加载完成');
					myScroll.refresh();
				},
				isLoad:function(){return lock&&lockLoadOn},//加载
				isRefresh:function(){return lockRefreshOn&&lock}//刷新
			}

		}();


		//myScroll控制位置判断
		myScroll.on('beforeScrollStart',function(){
			if(lock)return;
			isTouch=true;
			scrollStartTime= myScroll.startTime;
			currentY=myScroll.y;


		});
		myScroll.on('scrollEnd',function(){//此处需要隐藏提示框
			if(lock)return;

			lockRefreshOff=lockRefreshOn=false;
			lockLoadOff=lockLoadOn=false;
			//提示框隐藏
			$(myScroll.wrapper).trigger("tipHide");
		})
		myScroll.on('touchout',function(){
			isTouch=false;//确保事件是由手指拖动触发的
			if(lockRefreshOn||lockLoadOn){
				if(lock)return;//触发加载时锁定此状态
				lock=true;
				var type=lockRefreshOn?'refresh':'load';

				if(type=='load'&&complete)return;

				complete=type=='refresh'?false:complete;//重置complete状态

				$(myScroll.wrapper).trigger(type);
			}
		})
		myScroll.on('scroll',function(){

			if(!isTouch||lock) return;
			if(myScroll.y>0){//准备下拉刷新

				if(myScroll.y>=spaceUp){//到达指定位置
					lockRefreshOff=false;
					if(lockRefreshOn)return;
					lockRefreshOn=true;
					$(myScroll.wrapper).trigger("tipRefreshChange",true);



				}else{
					lockRefreshOn=false;
					if(lockRefreshOff)return;
					lockRefreshOff=true;
					$(myScroll.wrapper).trigger("tipRefreshChange",false);

				}


				//提示框出现
				$(myScroll.wrapper).trigger("tipShow",-1);

			}else if(myScroll.y<0){//准备上拉加载

				if(!complete){
					if(myScroll.maxScrollY-myScroll.y>=spaceDown){//到达指定位置
						lockLoadOff=false;
						if(lockLoadOn)return;
						lockLoadOn=true;
						$(myScroll.wrapper).trigger("tipLoadChange",true);//提示框可在此时出现

					}else{
						lockLoadOn=false;
						if(lockLoadOff)return;
						lockLoadOff=true;
						$(myScroll.wrapper).trigger("tipLoadChange",false);//提示框可在此时出现
					}
					//提示框出现
					$(myScroll.wrapper).trigger("tipShow",1);
				}



			}
			currentY=myScroll.y;//记录当前滚动高度

		})



		$(myScroll.wrapper).on("tipRefreshChange",function(e,status){
			var msg;

			if(status){//释放以刷新
				msg=args.reminder.refresh.tipChange;
				$tipRefresh.addClass('prepare-load').removeClass('before-load');
			}else{//下拉以刷新
				msg=args.reminder.refresh.tipShow;
				$tipRefresh.removeClass('prepare-load').addClass('before-load');
			}

			$tipRefresh.find('.tip').text(msg);


		}).on("tipLoadChange",function(e,status){

			var msg;
			if(status){//释放以加载
				msg=args.reminder.load.tipChange;
				$tipLoad.addClass('prepare-load').removeClass('before-load');
			}else{//上拉以刷新
				msg=args.reminder.load.tipShow;
				$tipLoad.removeClass('prepare-load').addClass('before-load');
			}
			$tipLoad.find('.tip').text(msg);

		}).on('tipShow',function(e,a){

			if(a<0){//重载

				if($tipRefresh.is(':hidden')){
					$tipRefresh.show().find('.tip').text(args.reminder.refresh.tipShow);
				}

			}
			if(a>0){//加载

				if($tipLoad.is(':hidden')) {
					$tipLoad.show().find('.tip').text(args.reminder.load.tipShow);
				}
			}

		}).on('tipHide',function(){
			if(!complete){

				$tipLoad
					.addClass('before-load')
					.removeClass('prepare-load load')
					.hide().find('.tip')
					.text(args.reminder.load.tipShow);


			}

			$tipRefresh
				.addClass('before-load')
				.removeClass('prepare-load load')
				.hide()
				.css({marginTop:refreshH*-1+'px'})
				.find('.tip').
				text(args.reminder.refresh.tipShow);
			myScroll.refresh();
		}).on('refresh',function(){

			$tipLoad.hide().removeClass('complete').addClass('before-load');
			$tipRefresh.show().addClass('load')
				.removeClass('prepare-load before-load')
				.css({marginTop:0})
				.find('.tip')
				.text(args.reminder.refresh.tipLoading);
			myScroll.refresh();
			myScroll.scrollToElement($tipRefresh[0],0)
			args.request.call($content,myScrollEvent);
		}).on("load",function(){


			$tipRefresh.hide();
			$tipLoad
				.addClass('load')
				.removeClass('prepare-load before-load')
				.find('.tip')
				.text(args.reminder.load.tipLoading);
			myScroll.refresh();
			myScroll.scrollToElement($tipLoad[0],0)
			args.request.call($content,myScrollEvent);

		})

		//首次加载
		var method={
			refresh:function(){//刷新数据
				lock=true;
				lockRefreshOn=true;
				complete=false;
				$(myScroll.wrapper).trigger('refresh');
			},
			destroy:function(){
				myScroll.destroy();
			}
		};
		$(ts).data('method',method);//缓存对象
		//第一次加载数据
		method.refresh();
	};
}();
