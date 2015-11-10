## 依赖iscroll5的jquery滚动加载插件

---
###描述
尽管iscroll5已有**iscroll-infinite.js**版本，但公司业务需求依然需要仿照移动APP的滚动加载方式。
插件依赖[iscroll5][1]和[jQuery][2],其中对于iscroll需要**iscroll-probe.js** 
###HTML结构部分
    <div id="scrollLoad">
        
	 <div class='content'>
        <!--刷新提示class必须-->
		 <div class='scrollLoad-tipRefresh'><span class='tip'></span></div>
		 <!--内容部分class必须-->
		 <ul class="scrollLoad-content">

		 </ul>
		 <!--加载提示class必须-->
		 <div class='scrollLoad-tipLoad'><span class='tip'></span></div>
	 </div>

 </div>
###初始化

    $("#scrollLoad").scrollLoad({

        request:function(SLObj){//到达设定位置，触发此加载函数
     		    if(SLObj.isRefresh()){//是否刷新
                }
                if(SLObj.isLoad()){//是否加载
                }
                var $ts = this;//指向当前数据存储容器
                //模拟请求
                var a='';
                for(var i=0;i<30;i++){
                    a+="<li>"+i+"</li>"
                }
                setTimeout(function(){
                    SLObj.html(a);//此方法必须调用，且在调用complete之前调用
                    if($ts.find('li').length>30){
                        SLObj.complete('数据加载完成！')
                    }
    
                },1000)
    
    
     	}
    })

###提示栏class标记

    before-load 	标记未加载状态
    prepare-load    标记准备加载状态
    load			标记正在加载状态
    对于底部提示框，还有一个complete状态
    complete		标记没有数据或者数据加载全部完成状态


  [1]: http://iscrolljs.com/
  [2]: http://jquery.com/