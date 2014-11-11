(function (global) {
    var loanAppViewModal,
        app = global.app = global.app || {};

    loanAppViewModal = kendo.data.ObservableObject.extend({
        username: "",
        postApp:0,
        endedApp:0,
        savedApp:0,
        postAppList:[],
        endedAppList:[],
        savedAppList:[],
        postAppTab:true,
        endedAppTab:false,
        savedAppTab:false,
        showrefreshLoan:true,
        show:function()
        {

             if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
        			if (confirmed === true || confirmed === 1) {
        				app.loanApp.viewModel.show(e);
        			}

        		}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                app.loginService.viewModel.showloder();  
                var dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: localStorage.getItem("urlMobAppApiLoan"),
                            type:"POST",
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            data: { apiaction:"manageapp",cust_id:localStorage.getItem("userID")} // search for tweets that contain "html5"
                        }
                        
                    },
                    schema: {
                        data: function(data)
                        {
                        	return [data];
                        }
                    },
                    error: function (e) {
                    	apps.hideLoading();
                    	navigator.notification.alert("Server not responding properly.Please check your internet connection.",
                    	function () { }, "Notification", 'OK');
                    },
                });
                dataSource.fetch(function(){
                    var that = this;
                    var data = that.data();
                    app.loginService.viewModel.hideloder(); 
                    if(data[0]['results']['faultcode']===1 && data[0]['results']['faultmsg']==='success')
                    {
                         app.loanApp.viewModel.setManageStatus(data[0]['results']['results']);
                    }    

                });
                app.loanApp.viewModel.postAppClick();
                
            }
            
       },
        applyFreshLoan:function(e)
        {
            app.loginService.viewModel.application(e);  
        },
        applyIteriaLoan:function(e)
        {
           /* console.log(e.target.dataset.fid);
            localStorage.setItem("fid",e.target.dataset.fid);
            app.iteriaService.viewModel.IteriaAPILoad();*/
            if(e.button.context.id === 'applyIteria')
            {
               // app.iteriaService.viewModel.openModalView();
                //app.iteriaService.viewModel.IteriaAPILoad();
                app.iteriaService.viewModel.IteriaAPILoad();
               // app.iteriaService.viewModel.submitSSNValue();
            }
            
        },
        setManageStatus:function(data)
        {
            var that = this;
            var blankArray =[];
            blankArray['fid']='';
            blankArray['updatetime']='';
            blankArray['matchCount']='';
            $.each(data, function( index, value ) {
                
            	
                if(value['apptype']==='posted')
                {
                    that.set('postApp',value['appcount']);
                    that.set('postAppList',(value['appdetails']!== false) ? value['appdetails'] : []);
                    
                }
                if(value['apptype']==='saved')
                {
                  that.set('savedApp',value['appcount']);
                  that.set('savedAppList',(value['appdetails']!== false) ? value['appdetails'] : []);
                }
                if(value['apptype']==='ended')
                {
                    that.set('endedApp',value['appcount']);
                    that.set('endedAppList',(value['appdetails']!== false) ? value['appdetails'] : []);
                }
        	});   
        },
        postAppClick:function(e)
        {
            var that=this;
            $('#tabstrip ul li').removeClass('k-state-active');
            $('#tabstrip ul li.postd_icn').addClass('k-state-active');
            that.set('postAppTab',true);
            that.set('endedAppTab',false);
            that.set('savedAppTab',false);
        },
        endedAppClick:function(e)
        {
            var that=this;
            $('#tabstrip ul li').removeClass('k-state-active');
            $('#tabstrip ul li.end_icon').addClass('k-state-active');
            that.set('postAppTab',false);
            that.set('endedAppTab',true);
            that.set('savedAppTab',false);
        },
        savedAppClick:function(e)
        {
            var that=this;
            app.analyticsService.viewModel.trackFeature("ManageApplication.User click on Application by Edit Mode");
            $('#tabstrip ul li').removeClass('k-state-active');
            $('#tabstrip ul li.sevd_icon').addClass('k-state-active');
            that.set('postAppTab',false);
            that.set('endedAppTab',false);
            that.set('savedAppTab',true);
        },
        refreshViewLoan:function()
        {

            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
        			if (confirmed === true || confirmed === 1) {
        				app.loanApp.viewModel.refreshViewLoan();
        			}

        		}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                
                app.loanApp.viewModel.setShowrefreshLoanFalse();
                var dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: localStorage.getItem("urlMobAppApiLoan"),
                            type:"POST",
                            dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                            data: { apiaction:"manageapp",cust_id:localStorage.getItem("userID")} // search for tweets that contain "html5"
                        }
                        
                    },
                    schema: {
                        data: function(data)
                        {
                        	return [data];
                        }
                    },
                    error: function (e) {
                    	apps.hideLoading();
                    	navigator.notification.alert("Server not responding properly.Please check your internet connection.",
                    	function () { }, "Notification", 'OK');
                    },
                });
                dataSource.fetch(function(){
                    var that = this;
                    var data = that.data(); 
                    if(data[0]['results']['faultcode']===1 && data[0]['results']['faultmsg']==='success')
                    {
                         app.loanApp.viewModel.setShowrefreshLoanTrue();
                         app.loanApp.viewModel.setManageStatus(data[0]['results']['results']);
                         
                    }    

                });
                app.loanApp.viewModel.postAppClick();
                
            }
            
        },
        setShowrefreshLoanFalse:function()
        {
            var that = this;
            that.set("showrefreshLoan",false);
        },
        setShowrefreshLoanTrue:function()
        {
            var that = this;
            that.set("showrefreshLoan",true);
        }
    });
   
    app.loanApp = {
        viewModel: new loanAppViewModal()	
    };
})(window);
