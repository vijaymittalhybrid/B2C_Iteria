(function(global){
    var AnalyticsModel,
        app = global.app = global.app || {};
    
    var productId = "f59992bd604a4febb1309522069c3937",
        version   = "1.5";
    
    AnalyticsModel = kendo.data.ObservableObject.extend({
        
       userStatus:function()
       {   
           var loginStatus = localStorage.getItem("isLoggedIn");
           if(loginStatus === 'true' || loginStatus === true)
           {
               app.analyticsService.viewModel.trackFeature("login"+"."+localStorage.getItem("userEmail"));
               app.analyticsService.viewModel.setInstallationInfo(localStorage.getItem("userEmail"));
           }
           else
           {
               app.analyticsService.viewModel.trackFeature("login.unauthorize User");
           }
       },
        
       userLogin:function()
       {
           console.log(localStorage.getItem("isLoggedIn"));
           console.log(localStorage.getItem("userEmail"));
          
           console.log(apps.view()['element']['0']['id']);
       },
        
       monitorStatusCheck:function()
       {
           var factory = window.plugins.EqatecAnalytics.Factory;
           factory.IsMonitorCreated(function(result){
               if(result.IsCreated === 'true' || result.IsCreated === true)
               {
                   console.log("monitor create");
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
                    app.analyticsService.viewModel.monitorStart();
                },
                function(msg)
                {
                    console.log("Error creating monitor :"+msg);
                }
            )
            console.log(settings);
        },
        
        monitorStart:function()
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            //app.analyticsService.viewModel.monitorStart();
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
            console.log(trackfeature);
            monitor.TrackFeature(trackfeature);
        },
        
        setInstallationInfo:function(installationId)
        {
            var monitor = window.plugins.EqatecAnalytics.Monitor;
            console.log(installationId);
            monitor.SetInstallationInfo(installationId);
        }
    });
    app.analyticsService = {
        viewModel :new AnalyticsModel()
    };
})(window);