(function(global){
    var AnalyticsModel,
        app = global.app = global.app || {};
    
    var productId = "12ee882498d84d6f960f0ceb5f22afc3",
        version   = "1.5";
    
    AnalyticsModel = kendo.data.ObservableObject.extend({
        
       userStatus:function()
       {   
           var loginStatus = localStorage.getItem("isLoggedIn");
           
           if(loginStatus === 'true' || loginStatus === true)
           {
               app.analyticsService.viewModel.trackFeature("AppOpen&login_FirstTime"+"."+localStorage.getItem("userEmail"));
               app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("userEmail"));
           }
           else
           {
               app.analyticsService.viewModel.trackFeature("AppLoad_FirstTime.Unknown User");
               app.analyticsService.viewModel.setInstallationInfo("Not Register");
           }
       },
        
       monitorStatusCheck:function()
       {
           var factory = window.plugins.EqatecAnalytics.Factory;
           
           factory.IsMonitorCreated(function(result){
               if(result.IsCreated === 'true' || result.IsCreated === true)
               {
                   console.log("monitor has been create");
               }
               else
               {
                   console.log("monitor not create");
                   app.analyticsService.viewModel.monitorCreate();
               }
           });
       },
        
        monitorCreate:function()
        {
            var factory = window.plugins.EqatecAnalytics.Factory;
            var settings = factory.CreateSettings(productId,version);
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            
            settings.TestMode = 'true';
            settings.LoggingInterface = {
                                            LogError:function(errorMsg)
                                            {
                                                console.log("Error :"+errorMsg);
                                            },
                                            LogMessage:function(msg)
                                            {
                                                console.log(msg);    
                                            }
                                        };
            settings.DailyNetworkUtilizationInKB = 5120;
            settings.MaxStorageSizeInKB = 8192;
            
            factory.CreateMonitorWithSettings(settings,
                function()
                {
                    console.log("Monitor create");
                    app.analyticsService.viewModel.monitorStart(monitor);
                },
                function(msg)
                {
                    console.log("Error creating monitor :"+msg);
                }
            )
        },
        
        monitorStart:function(monitor)
        {
            monitor.Start(function()
            {
                console.log('monitor start');
                app.analyticsService.viewModel.userStatus();
            });
        },
        
        monitorStop:function(stopReason)
        {   
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            app.analyticsService.viewModel.trackFeature(stopReason);
            monitor.Stop(function()
            {
                console.log('monitor stop');
            });
        },
        
        trackFeature:function(trackfeature)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            monitor.TrackFeature(trackfeature);
        },
        
        setInstallationInfo:function(installationId)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            monitor.SetInstallationInfo(installationId);
        },
        
        getStatus:function(app){
            var monitor = window.plugins.EqatecAnalytics.Monitor;
           
            monitor.GetStatus(function(status) {

                if(status.IsStarted === true)
                {
                    console.log("monitor start");
                }
            });
        }
    });
    app.analyticsService = {
        viewModel :new AnalyticsModel()
    };
})(window);