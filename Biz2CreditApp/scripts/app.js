(function (global) {
        app = global.app = global.app || {};
    
        // Handle device back button tap
        var onBackKeyDown = function(e) {
        if(apps.view()['element']['0']['id']==='tabstrip-login'|| apps.view()['element']['0']['id']==='tabstrip-home'){
            e.preventDefault();
            navigator.notification.confirm('Do you really want to exit?', function (confirmed) {
            if (confirmed === true || confirmed === 1) {
                app.analyticsService.viewModel.monitorStop("Exit.User exit by Device Backbutton");
            	navigator.app.exitApp();
                
            }

            }, 'Biz2Credit', 'Yes,No');
        }
        else if(apps.view()['element']['0']['id']==='tabstrip-docs' && app.documentsetting.viewModel.showfilter === true)
        {
        	app.documentsetting.viewModel.set("showfilter", false);
        }
        else if(apps.view()['element']['0']['id']==='tabstrip-loanapp-bi'|| apps.view()['element']['0']['id']==='tabstrip-loanapp-ci'|| apps.view()['element']['0']['id']==='tabstrip-loanapp-pi'|| apps.view()['element']['0']['id']==='tabstrip-loanapp-fp'|| apps.view()['element']['0']['id']==='tabstrip-matches' || apps.view()['element']['0']['id']==='tabstrip-docs' || apps.view()['element']['0']['id']==='tabstrip-movedocs' || apps.view()['element']['0']['id']==='tabstrip-file-export')
        {
        	e.preventDefault();
        }
        else if(apps.view()['element']['0']['id']==='tabstrip-sign-up' || apps.view()['element']['0']['id']==='tabstrip-forgot-pass')
        {
        	apps.navigate("#tabstrip-login");
        }
        else
        { 
            $("#tabstrip-mess-fourth").data("kendoMobileModalView").close();
            $("#tabstrip-mess-dynamic").data("kendoMobileModalView").close();
            $("#tabstrip-mess-third").data("kendoMobileModalView").close();
            $("#tabstrip-mess-two").data("kendoMobileModalView").close();
            $("#tabstrip-mess-one").data("kendoMobileModalView").close();
            apps.navigate("#:back");
            
        }
    };
    
    var onMenuKeyDown = function(e){
      alert("hello");  
    };
    
    
    var Keyboardisoff = function() {
      $("#tabstrip-sign-up").find(".km-scroll-container").css("-webkit-transform", "translate3d(0px, 0px, 0px)");
    };

    var onDeviceReady = function() {
        StatusBar.overlaysWebView(false);
        StatusBar.backgroundColorByHexString('#99cc00');
        document.addEventListener('backbutton', onBackKeyDown, false);
        document.addEventListener("menubutton", onMenuKeyDown, false);
        document.addEventListener("hidekeyboard", Keyboardisoff, false);
        window.connectionInfo = new ConnectionApp();
		window.connectionInfo.checkConnection();
        app.analyticsService.viewModel.monitorStatusCheck();
        navigator.splashscreen.hide();
    };

    // Handle "deviceready" event
    document.addEventListener('deviceready', onDeviceReady, false);
    function ConnectionApp() {
	}
 
    ConnectionApp.prototype = { 	
    	checkConnection: function() {
    			if(typeof navigator.connection.type !== "undefined")
                {
                    var networkState = navigator.connection.type;
                    var states = {};
                    states[Connection.UNKNOWN] = 'Unknown connection';
                    states[Connection.ETHERNET] = 'Ethernet connection';
                    states[Connection.WIFI] = 'WiFi connection';
                    states[Connection.CELL_2G] = 'Cell 2G connection';
                    states[Connection.CELL_3G] = 'Cell 3G connection';
                    states[Connection.CELL_4G] = 'Cell 4G connection';
                    states[Connection.CELL] = 'Cell generic connection';
                    states[Connection.NONE] = 'No network connection';
                    if (states[networkState] === 'No network connection') {
                        return false;
                    }
                }
                
                return true;
    	},
        
    }
    
    /*Telerik Analytics*/
   
    
    
    if(localStorage.getItem("isLoggedIn") === 'true')
    {        
    	apps = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout",initial: "tabstrip-home",skin: "flat"}); 
    }
    else
    {
    	apps = new kendo.mobile.Application(document.body, { layout: "tabstrip-layout",initial: "tabstrip-login",skin: "flat"});
    }
    
   /* localStorage.setItem("urlMobAppApiFolder","https://www.biz2services.com/mobapp/api/folder/");
    localStorage.setItem("urlMobAppApiFile","https://www.biz2services.com/mobapp/api/file/");
    localStorage.setItem("urlMobAppApiUser","https://www.biz2services.com/mobapp/api/user/");
    localStorage.setItem("urlMobAppApiLoan","https://www.biz2services.com/mobapp/api/loanapp/");*/
    
   localStorage.setItem("urlMobAppApiFolder","http://sandbox.biz2services.com/mobapp/api/folder/");
   localStorage.setItem("urlMobAppApiFile","http://sandbox.biz2services.com/mobapp/api/file/");
    localStorage.setItem("urlMobAppApiUser","http://sandbox.biz2services.com/mobapp/api/user/");
    localStorage.setItem("urlMobAppApiLoan","http://sandbox.biz2services.com/mobapp/api/loanapp/");
    
    
    $(document).ready(function() {
       document.addEventListener("menubutton", onMenuKeyDown, false);
    });

   
    onMenuKeyDown = function () {
        // your code..
        alert('Menu Button pressed..');
    }
    
    
    
})(window);