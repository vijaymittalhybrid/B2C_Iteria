(function (global,$) {
    var LoginViewModel,
        app = global.app = global.app || {};

    LoginViewModel = kendo.data.ObservableObject.extend({
   
        isLoggedIn:(localStorage.getItem("isLoggedIn") === true) ?  true : false,
        username: "",
        password: "",
        email:"",
        name:"",
        forgotmail:"",
        show:function()
        {
            app.loginService.viewModel.formValidateReset();
        },
        validateUser:function()
        {
            var that = this,
            username = that.get("username").trim(),
            password = that.get("password").trim();
            if (username === "") {
                 navigator.notification.confirm('Please enter your username', function (confirmed) {
                if (confirmed === true || confirmed === 1) {
                	$('#loginusername').focus();
                }
                }, 'Notification','OK');

                return;
            }
            if (password === "") {
                 navigator.notification.confirm('Please enter your password', function (confirmed) {
                if (confirmed === true || confirmed === 1) {
                	$('#loginpassword').focus();
                }
                }, 'Notification','OK');

                return;
            }
            if(!window.connectionInfo.checkConnection()){
                    navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
                	if (confirmed === true || confirmed === 1) {
                		app.loginService.viewModel.validateUser();
                	}

                }, 'Connection Error?', 'Retry,Cancel');
            }
            else{
               
               that.userLogin();  
            }
           
        },
        userLogin: function () {
            var that = this;
            username = that.get("username").trim(),
            password = that.get("password").trim();
            that.showloder();
            var dataSource = new kendo.data.DataSource({
            transport: {
            read: {
                    url: localStorage.getItem("urlMobAppApiUser"),
                    type:"POST",
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    data: { apiaction:"userlogin",userID:username,password:password} // search for tweets that contain "html5"
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
                
            	var data = this.data();
            	if(data[0]['results']['faultcode'] === '1')
                {
                    that.setUserLogin(data[0]['results']['UserData']);
                }
                else{
                    that.hideloder();
                    localStorage.setItem("isLoggedIn",false);
                    navigator.notification.alert("Login failed. Invalid username/password",
                    function () { }, "Notification", 'OK');
                    return;
                }            
          
            });      
        },
       
        setUserLogin: function (userinfo) {
            var that = this;
            that.hideloder();
            localStorage.setItem("isLoggedIn",true);
            localStorage.setItem("userFName",userinfo['userFName']);
            localStorage.setItem("userLName",userinfo['userLName']);
            localStorage.setItem("userID",userinfo['userID']);
            localStorage.setItem("userEmail",userinfo['userEmail']);
            localStorage.setItem("userMobile",userinfo['userMobile']);
            app.analyticsService.viewModel.setInstallationInfo(userinfo['userEmail']);
            app.analyticsService.viewModel.trackFeature("login"+"."+userinfo['userEmail']);
            that.setSettingsPage();
            that.navigateHome();
        },
        
		
        setUserLogout: function () {
            var that = this;
            app.analyticsService.viewModel.trackFeature("logout."+localStorage.getItem("userEmail"));
            //app.analyticsService.viewModel.monitorStatusCheck();
            that.set("isLoggedIn", false);
            localStorage.setItem("isLoggedIn",false);
            localStorage.removeItem("userFName");
            localStorage.removeItem("userLName");
            localStorage.removeItem("userID");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userMobile");
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userMobile");
            that.set("email", "");
            that.set("name", "");
            apps.navigate("#tabstrip-login");
            
            kendo.history.navigate("#tabstrip-login");
            that.clearForm();
            
            app.homesetting.viewModel.closeParentPopover();
            
        },
        navigateHome: function()
        {   
             apps.navigate("#tabstrip-home");
             kendo.history.navigate("#tabstrip-home");
        },
        clearForm: function () {
            var that = this;
            that.set("username", "");
            that.set("password", "");
        },

        checkEnter: function (e) {
            var that = this;

            if (e.keyCode === 13) {
                $(e.target).blur();
                that.validateUser();
            }
        },
        showloder:function()
        {	apps.showLoading();
        },
        hideloder:function()
        {
            apps.hideLoading();
        },
        refreshHome:function(e)
        {
           
            if(!window.connectionInfo.checkConnection()){
               
                navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            	if (confirmed === true || confirmed === 1) {
                   
            		app.loginService.viewModel.refreshHome();
            	}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                if(apps.view()['element']['0']['id'] === 'tabstrip-home'){
                    app.homesetting.viewModel.homeShow();
                }
                else
                {
                    app.analyticsService.viewModel.trackFeature("Dashboard.User Reach on Dashboard");
                     apps.navigate('#tabstrip-home');
                }
                  
            }
             app.homesetting.viewModel.closeParentPopover();
        },
        
        onSettingPage:function(e)
        {	
            app.analyticsService.viewModel.trackFeature("Settings.User click on Settings");
            apps.navigate('#tabstrip-Setting');
             app.homesetting.viewModel.closeParentPopover();
        },
        setSettingsPage:function()
        {
 
            var that = this;
            that.set("email", localStorage.getItem("userEmail"));
            that.set("name", localStorage.getItem("userFName")+' '+localStorage.getItem("userLName"));
        },
        mobileNotification:function(msg,status)
        {
            app.analyticsService.viewModel.trackFeature(msg);
            var toast =window.plugins.toast;
            var message =msg;
            toast.showLongBottom(message,
                function(downmsg){
                    //navigator.notification.alert(downmsg);
                }, 
                function(downerr){
                    //navigator.notification.alert(downerr);
                }
            );
        },
        
        forgotMailSend:function()
        {
            var that = this,
            forgotmail = that.get("forgotmail").trim();
            
            
            if (forgotmail === "") {
                navigator.notification.confirm('Please enter your email!.', function (confirmed) {
                if (confirmed === true || confirmed === 1) {
                	$('#forgotpassfield').focus();
                }
                }, 'Notification','OK');

                return;
            }
            if (!app.loginService.viewModel.validateEmailId(forgotmail)) {
                 navigator.notification.confirm('Please enter a valid email address.', function (confirmed) {
                if (confirmed === true || confirmed === 1) {
                	$('#forgotpassfield').focus();
                }
                }, 'Notification','OK');

                return;
            }

            if(!window.connectionInfo.checkConnection()){
                    navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
                	if (confirmed === true || confirmed === 1) {
                		app.loginService.viewModel.forgotMailSend();
                	}

                }, 'Connection Error?', 'Retry,Cancel');
            }
            else{

            that.showloder();
            var dataSource = new kendo.data.DataSource({
            transport: {
            read: {
                    url: localStorage.getItem("urlMobAppApiUser"),
                    type:"POST",
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    data: { apiaction:"forgotpassword",useremail:forgotmail} // search for tweets that contain "html5"
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
                
            	var data = this.data();
                that.hideloder();
            	if(data[0]['results']['faultcode'] === 1)
                {
                	$msg= "New password has been created and sent successfully to your email account.";
                    app.analyticsService.viewModel.trackFeature("forgotPassword."+$msg);
                    app.loginService.viewModel.mobileNotification($msg,'info');
                    apps.navigate("#tabstrip-login");
                    kendo.history.navigate("#tabstrip-login");
                    that.clearForm();
                }
                else if(data[0]['results']['faultcode'] === 2){
                    app.analyticsService.viewModel.trackFeature("forgotPassword.email id does not match");
                    navigator.notification.alert("Sorry, this email id does not match with any user record.",
                    function () { }, "Notification", 'OK');
                    return;
                }
                else
                {

                    return;
                }
            });    
            }
           
        },
        initSetForgotPage:function()
        {
			app.loginService.viewModel.setForgotMail();
            
            
        },
        setForgotMail:function()
        {
            var that = this;
			that.set("forgotmail",""); 
        },
        validateEmailId:function(email)
        {
            var filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
            if (filter.test(email)) {
            	return true;
            }
            else {
           	 return false;
            }
        },
        checkEnterForForgot: function (e) {
            var that = this;

            if (e.keyCode === 13) {
                $(e.target).blur();
                that.forgotMailSend();
            }
        },
        application: function(e)
        {  
            app.loansetting.viewModel.resetLoanAppBIForm();
            app.loanAppCI.viewModel.resetLoanAppCIForm();
            app.loanAppPI.viewModel.resetLoanAppPIForm();
            app.loanFP.viewModel.resetLoanAppFPForm();
			app.loginService.viewModel.formValidateReset();
            
            sessionStorage.setItem("LoanAppBIEditMode",'0');
            sessionStorage.setItem("LoanAppCIEditMode",'0');
            sessionStorage.setItem("LoanAppPIEditMode",'0');
            sessionStorage.setItem("LoanAppFPEditMode",'0');
            
            if(e.target.dataset.mode ==='edit')
            {
                localStorage.setItem("fid",e.target.dataset.fid);
                sessionStorage.setItem("LoanAppBIEditMode",'1');
                apps.navigate("views/loanAppBI.html?param=editMode");
                
            }
            else
            {
                app.analyticsService.viewModel.trackFeature("FreshLoanApplication.User enter in fresh loan application");
                apps.navigate("views/loanAppBI.html");
            }
                 
        },
        mydocuments: function()
        {   
             app.analyticsService.viewModel.trackFeature("Document.User click on Document");
             apps.navigate("views/documents.html");
        },
        formValidateReset:function()
        {
            
            if($('#B2cAppForms').data('validator') !== null)
            {
                $('#B2cAppForms').data('validator').resetForm(); 
            }
            if($('#b2cApp1').data('validator') !== null)
            {
                $('#b2cApp1').data('validator').resetForm(); 
            }
            if($('#b2cApp3').data('validator') !== null)
            {
                $('#b2cApp3').data('validator').resetForm(); 
            }
            if($('#b2cApp4').data('validator') !== null)
            {
                $('#b2cApp4').data('validator').resetForm(); 
            }

        },
        manageApp:function()
        {
            app.analyticsService.viewModel.trackFeature("ManageApplication.User click on Manage Application");
            apps.navigate("views/loanApp.html");
        }

        
    });
    
    app.loginService = {
        viewModel: new LoginViewModel()	
    };
})(window,jQuery);