(function (global,$) {
    var DocumentsViewModel,
        app = global.app = global.app || {};

    DocumentsViewModel = kendo.data.ObservableObject.extend({
        documents:[],
        showfilter:false,
        innerPage:false,
        parentId:0,
        showrefreshLoading:false,
        newFolderName:'',
        renameFolderName:'',
        renameFileName:'',
        fileExt:'',
        
        documentBeforeShow:function()
        {
            app.loginService.viewModel.formValidateReset();
            
            $(".km-scroll-container").css("-webkit-transform", "");
            $("[data-role=\"popover\"][id =\"tabstrip-folder-events-popup\"]").each(function() {
                $(this).parent().attr('id', 'popoverId');
            });
            $("[data-role=\"popover\"][id =\"tabstrip-files-events-popup\"]").each(function() {
                $(this).parent().attr('id', 'popoverId');
            });
            $("[data-role=\"popover\"][id =\"tabstrip-share-files-file-events-popup\"]").each(function() {
                $(this).parent().attr('id', 'popoverId');
            });
            if(!$('#popover-people ul li:eq(3)').hasClass('newFolderModal'))
            {
                $('#popover-people ul li:eq(2)').after('<li data-bind="click: newFolderModal" class="newFolderModal">New Folder</li>');
                kendo.bind($("#popover-people ul li:eq(3)"), app.documentsetting.viewModel);
            }
  
        },
        beforeHide:function()
        {
            $("#popover-people ul li").remove(".newFolderModal");
        },
        documentAfterShow:function()
        {
            if(device.platform=== 'iOS')
            {
              $('#tabstrip-files-events-popup li.export').remove();
              $('#tabstrip-share-files-file-events-popup li.export').remove();
              $('#tabstrip-files-events-popup li.more a').attr('href','#tabstrip-files-events-ios');
                
            }
        },
        documentShow:function(e)
       { 
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
        			if (confirmed === true || confirmed === 1) {
        				app.documentsetting.viewModel.documentShow(e);
        			}

        		}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                app.loginService.viewModel.showloder();
                if(typeof $(".list-edit-listview").data("kendoMobileListView") !=='undefined')
                {
                	$(".list-edit-listview").data("kendoMobileListView").destroy();
                }
                if(typeof e.view.params.parent !== "undefined" && e.view.params.parent !== "0")
                {
                    parentId = e.view.params.parent;
                    app.documentsetting.viewModel.setInnerPage();
                    app.documentsetting.viewModel.setParentId(e.view.params.parent);
                    
                }
                else
                {
                    docsBackHistory=[];
                    shareBackHistory=[];
                    docsBackHistory.push(0);
                    parentId = 0;
                    app.documentsetting.viewModel.setMainPage();
                    app.documentsetting.viewModel.setParentId(0);
                } 
                parentName = shareBackHistory[shareBackHistory.length-1];
                console.log(parentName);
                if(parentName==='Shared Files' || parentName==='Shared Folders' || parentName==='subSharedFolder')
                {
                    var dataSource = new kendo.data.DataSource({         
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"getlistfilesfolders",userID:localStorage.getItem("userID"),parentID:parentId,parentName:parentName} // search for tweets that contain "html5"
                    }
                    },
                    schema: {
                    data: function(data)
                    {   var docsArray = [];
                        if(data['results']['faultcode']===1)
                        {
                            var sharedFiles ="";
                            var sharedFolders ="";
                            $.each( data['results']['DocLists'], function( i, val ) {

                                if(data['results']['DocLists'][i]['name']==='Shared Files'){
                                     sharedFiles =val;
                                }
                                else if(data['results']['DocLists'][i]['name']==='Shared Folders' ){
                                     sharedFolders =val;
                                }
                                else{
                                    docsArray.push(val);
                                } 
                    		});
                            if(sharedFiles !== '' && sharedFolders !=='')
                            {
                            	docsArray.unshift(sharedFiles,sharedFolders);
                            }
                        }
                    	return [docsArray];
                    }
                    },
                    error: function (e) {
                    	apps.hideLoading();
                    	navigator.notification.alert("Server not responding properly.Please check your internet connection.",
                    	function () { }, "Notification", 'OK');
                    },
                    });

                }
                else
                {
                    var dataSource = new kendo.data.DataSource({         
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"getlistfilesfolders",userID:localStorage.getItem("userID"),parentID:parentId} // search for tweets that contain "html5"
                    }
                    },
                    schema: {
                    data: function(data)
                    {   var docsArray = [];
                        if(data['results']['faultcode']===1)
                        {
                            var sharedFiles ="";
                            var sharedFolders ="";
                            $.each( data['results']['DocLists'], function( i, val ) {

                                if(data['results']['DocLists'][i]['name']==='Shared Files'){
                                     sharedFiles =val;
                                }
                                else if(data['results']['DocLists'][i]['name']==='Shared Folders' ){
                                     sharedFolders =val;
                                }
                                else{
                                    docsArray.push(val);
                                } 
                    		});
                            if(sharedFiles !== '' && sharedFolders !=='')
                            {
                            	docsArray.unshift(sharedFiles,sharedFolders);
                            }
                        }
                    	return [docsArray];
                    }
                    },
                    error: function (e) {
                    	apps.hideLoading();
                    	navigator.notification.alert("Server not responding properly.Please check your internet connection.",
                    	function () { }, "Notification", 'OK');
                    },
                    });

                }
                dataSource.fetch(function(){
                    var that = this;
                    var data = that.data();
                    app.documentsetting.viewModel.setDocuments(data); 
                });
       	 }
       },
       refreshView:function(e)
        {

            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.refreshView(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                if( app.documentsetting.viewModel.parentId === 0)
                {
                    parentId = 0;
                    app.documentsetting.viewModel.setMainPage();
                }
                else
                {
                    parentId =  app.documentsetting.viewModel.parentId;
                    app.documentsetting.viewModel.setInnerPage();
                }
                if(typeof $(".list-edit-listview").data("kendoMobileListView") !=='undefined' )
                {
                	$(".list-edit-listview").data("kendoMobileListView").destroy();
                }
                var that = this;
                that.set("showrefreshLoading", true);
           	 parentName = shareBackHistory[shareBackHistory.length-1];
                if(parentName==='Shared Files' || parentName==='Shared Folders' || parentName==='subSharedFolder')
                {
                    var dataSource = new kendo.data.DataSource({         
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"getlistfilesfolders",userID:localStorage.getItem("userID"),parentID:parentId,parentName:parentName} // search for tweets that contain "html5"
                    }
                    },
                    schema: {
                    data: function(data)
                    {   var docsArray = [];
                        if(data['results']['faultcode']===1)
                        {
                            var sharedFiles ="";
                            var sharedFolders ="";
                            $.each( data['results']['DocLists'], function( i, val ) {

                                if(data['results']['DocLists'][i]['name']==='Shared Files'){
                                     sharedFiles =val;
                                }
                                else if(data['results']['DocLists'][i]['name']==='Shared Folders' ){
                                     sharedFolders =val;
                                }
                                else{
                                    docsArray.push(val);
                                } 
                    		});
                            if(sharedFiles !== '' && sharedFolders !=='')
                            {
                            	docsArray.unshift(sharedFiles,sharedFolders);
                            }
                        }
                    	return [docsArray];
                    }
                    },
                    });

                }
                else
                {
                    var dataSource = new kendo.data.DataSource({         
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"getlistfilesfolders",userID:localStorage.getItem("userID"),parentID:parentId} // search for tweets that contain "html5"
                    }
                    },
                    schema: {
                    data: function(data)
                    {   var docsArray = [];
                        if(data['results']['faultcode']===1)
                        {
                            var sharedFiles ="";
                            var sharedFolders ="";
                            $.each( data['results']['DocLists'], function( i, val ) {

                                if(data['results']['DocLists'][i]['name']==='Shared Files'){
                                     sharedFiles =val;
                                }
                                else if(data['results']['DocLists'][i]['name']==='Shared Folders' ){
                                     sharedFolders =val;
                                }
                                else{
                                    docsArray.push(val);
                                } 
                    		});
                            if(sharedFiles !== '' && sharedFolders !=='')
                            {
                            	docsArray.unshift(sharedFiles,sharedFolders);
                            }
                        }
                    	return [docsArray];
                    }
                    },
                    });

                }
                 
                dataSource.fetch(function(){
                    var data = dataSource.view(); 
                    
                    app.documentsetting.viewModel.setDocuments(data);
                    app.documentsetting.viewModel.hideRefreshLoading();
                }); 
            }
        },
        setDocuments: function(data)
        { 
            
            var that = this;
            that.set("documents", data['0']); 
            if(typeof $(".list-edit-listview").data("kendoMobileListView") !=='undefined')
            {
            	$(".list-edit-listview").data("kendoMobileListView").destroy();
            }
            $(".list-edit-listview").kendoMobileListView({
                dataSource: app.documentsetting.viewModel.documents,
                template: kendo.template($("#docs-template").html()),
                filterable: {
                field: "name",
                operator: "startswith",
                },
                }).kendoTouch({ 
                	filter: "li",
                  	tap: function (e) {
                      // e.touch.currentTarget.className='km-state-active';
							 if(e.touch.initialTouch.dataset.id === "folder")
                            { 
                                if(!hold)
                        		{
                                    sessionStorage.currentFId = e.touch.currentTarget.id;
                            		sessionStorage.currentFName = e.touch.currentTarget.innerText;
                                    if($.trim(e.touch.currentTarget.innerText)==='Shared Files'){
                                        shareBackHistory.push($.trim(e.touch.currentTarget.innerText));
                                        
                                    }
                                    else if($.trim(e.touch.currentTarget.innerText)==='Shared Folders')
                                    {
                                        shareBackHistory.push($.trim(e.touch.currentTarget.innerText));
                                        
                                        
                                    }
                                    else if(shareBackHistory[shareBackHistory.length-1] ==='Shared Folders' || shareBackHistory[shareBackHistory.length-1] ==='subSharedFolder')
                                    {
                                        shareBackHistory.push('subSharedFolder');
                                    }
                        		
                                    if(e.touch.currentTarget.id !== "0")
                                    {  
                                    	app.documentsetting.viewModel.setInnerPage();
                                    	app.documentsetting.viewModel.setParentId(e.touch.currentTarget.id);
                                    }
                                    else
                                    {
                                    	app.movedocumentsetting.viewModel.setMainPage();
                                    	app.movedocumentsetting.viewModel.setParentId(0);
                                    } 
                                	docsBackHistory.push(e.touch.currentTarget.id);
                                	app.documentsetting.viewModel.refreshView();
                                    
                       		 }
                            }
                            else if(e.touch.initialTouch.dataset.id === "files")
                            {
                                if(!hold)
                        		{
                                    sessionStorage.currentFileId = e.touch.currentTarget.id;
                                    sessionStorage.downloadLink = $.trim(e.touch.currentTarget.className);
                                    sessionStorage.currentFileName = e.touch.currentTarget.innerText;
                                    fileName = $.trim(e.touch.currentTarget.innerText);
                                    folderName = "biz2docs";
                                    app.documentsetting.viewModel.downloadFile(fileName,folderName);
                                }
                            }
                	}, 
                	touchstart: function (e) {
                		hold = false;
                        
               	 },
                	hold: function (e) {
                        hold = true;
                        navigator.notification.vibrate(20);
						if(e.touch.initialTouch.dataset.id === "folder")
                        {
                            sessionStorage.currentFId = e.touch.currentTarget.id;
                        	sessionStorage.currentFName = e.touch.currentTarget.innerText;
                            if(e.touch.initialTouch.innerText !== "Shared Files" && e.touch.initialTouch.innerText !== "Shared Folders")
                            {
                                if(shareBackHistory[shareBackHistory.length-1]==='Shared Folders')
                                {
                                    $("#tabstrip-share-folder-events").data("kendoMobileModalView").open();
                                	$("#tabstrip-share-folder-events").find(".km-scroll-container").css("-webkit-transform", "");
                                }
                                else if(shareBackHistory[shareBackHistory.length-1]==='subSharedFolder')
                                {
                                }
                                else
                                {
                                    $("#tabstrip-folder-events").data("kendoMobileModalView").open();
                                	$("#tabstrip-folder-events").find(".km-scroll-container").css("-webkit-transform", "");
                                }
                    			
                    			$('.folderName').html('');
                    			if(e.touch.currentTarget.innerText.length >= 20)
                                {
                                   $('.folderName').append('<span>'+e.touch.currentTarget.innerText.substring(0, 15)+'...</span>'); 
                                }
                                else
                                {
                                    $('.folderName').append('<span>'+e.touch.currentTarget.innerText+'</span>');
                                }
                    			$('.folderName').attr("id",e.touch.currentTarget.id)
                            }
                            else if(e.touch.initialTouch.innerText === "Shared Files" || e.touch.initialTouch.innerText === "Shared Folders")
                            {
                                navigator.notification.alert("This is a default folder. It cannot be shared or removed.",
                                function () { }, "Notification", 'OK');
                            }
                        }
                        else if(e.touch.initialTouch.dataset.id === "files")
                        {
                                sessionStorage.currentFileId = e.touch.currentTarget.id;
                                sessionStorage.currentFileName = e.touch.currentTarget.innerText;
                                sessionStorage.downloadLink = $.trim(e.touch.currentTarget.className);
                                if (device.platform === "Android") {
                                    if(shareBackHistory[0]==='Shared Files'){
                                        $("#tabstrip-share-files-file-events").data("kendoMobileModalView").open();
                                		$("#tabstrip-share-files-file-events").find(".km-scroll-container").css("-webkit-transform", "");  
                                    }
                                    else if(shareBackHistory[0]==='Shared Folders')
                                    {
                                        $("#tabstrip-share-folders-file-events").data("kendoMobileModalView").open();
                                		$("#tabstrip-share-folders-file-events").find(".km-scroll-container").css("-webkit-transform", "");  
                                    }
                                    else
                                    {
                                    	$("#tabstrip-files-events").data("kendoMobileModalView").open();
                                		$("#tabstrip-files-events").find(".km-scroll-container").css("-webkit-transform", "");  
                                    }
                            		
                                }
                            	else
                            	{
                                    if(shareBackHistory[0]==='Shared Files'){
                                    	$("#tabstrip-share-files-file-events-ios").data("kendoMobileModalView").open();
                                		$("#tabstrip-share-files-file-events-ios").find(".km-scroll-container").css("-webkit-transform", "");
                                    }
                                    else if(shareBackHistory[0]==='Shared Folders')
                                    {
                                        $("#tabstrip-share-folders-file-events-ios").data("kendoMobileModalView").open();
                                		$("#tabstrip-share-folders-file-events-ios").find(".km-scroll-container").css("-webkit-transform", "");  
                                    }
                                    else
                                    {
                                    	$("#tabstrip-files-events-ios").data("kendoMobileModalView").open();
                                		$("#tabstrip-files-events-ios").find(".km-scroll-container").css("-webkit-transform", "");
                                    }
                                    
                                }
                            	$('.folderName').html('');
                                if(e.touch.currentTarget.innerText.length >= 20)
                                {
                                   $('.folderName').append('<span>'+e.touch.currentTarget.innerText.substring(0, 15)+'...</span>'); 
                                }
                                else
                                {
                                    $('.folderName').append('<span>'+e.touch.currentTarget.innerText+'</span>');
                                }
                                
                        }
                		e.touch.currentTarget.className=''
                	}          
            });
            $("#tabstrip-docs").find(".km-scroll-container").css("-webkit-transform", "");
            $('#docs-filter').html('');
            $(".km-filter-form").detach().appendTo('#docs-filter');
            
            if(shareBackHistory[0]==='Shared Folders')
            {
 
                $('.list-edit-listview').each(function() {
                	$('.list-edit-listview table tr td:nth-child(3) a.folder').remove();
                    $('.list-edit-listview table tr td:nth-child(3) a.file').attr('href', '\#tabstrip-share-files-file-events-popup');
                });
            }
            else if(shareBackHistory[0]==='Shared Files')
            {
                $('.list-edit-listview').each(function() {
                	$('.list-edit-listview table tr td:nth-child(3) a.file').attr('href', '\#tabstrip-share-files-file-events-popup');
                });
            }
            app.loginService.viewModel.hideloder();    
        },
        setVisibilty:function()
        {
            var that = this;
            $(".km-filter-reset").trigger("click");
            
            if(app.documentsetting.viewModel.showfilter === true)
            {
                that.set("showfilter", false);
            }
            else
            {
                that.set("showfilter", true);
            }
             
        },
        setInnerPage:function()
        {
            var that = this;
            if(app.documentsetting.viewModel.parentId === 0)
            {
                 $(".list-edit-listview").html("");
            }
            that.set("innerPage", true); 
        },
        setMainPage:function()
        {
            var that = this;
            if(app.documentsetting.viewModel.parentId !== 0)
            {
                 $(".list-edit-listview").html("");
            }
            that.set("innerPage", false);  
        },

        
        deleteFolder:function(e)
        { 
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-folder-events-popup").data("kendoMobilePopOver").close();
            }
            
            $("#tabstrip-delete-folder").data("kendoMobileModalView").open();
        },
        thisFolderDelete:function(e)
        {
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.thisFolderDelete(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                parentName = shareBackHistory[shareBackHistory.length-1];
                if(parentName==='Shared Folders' || parentName==='subSharedFolder')
                {
                    var dataSource = new kendo.data.DataSource({
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"deletefolder",userID:localStorage.getItem("userID"),folderID:sessionStorage.getItem("currentFId"),parentName:parentName}  // search for tweets that contain "html5"
                    }
                    },    
                    schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                    },

                    });  
                }
                else
                {
                    var dataSource = new kendo.data.DataSource({
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"deletefolder",userID:localStorage.getItem("userID"),folderID:sessionStorage.getItem("currentFId")}  // search for tweets that contain "html5"
                    }
                    },    
                    schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                    },

                    });   
                }
    		    
                 
                dataSource.fetch(function(){
                    var data = dataSource.data(); 

                    if(data['0']['results']['faultcode'] === 1)
                    {
                        msg ="Folder Deleted Successfully.";
                        app.loginService.viewModel.mobileNotification(msg,'success');
                    }
                    else if(data['0']['results']['faultcode'] === 0)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'info');  
                    }
                    else
                    {
                        msg ='Some Error Occurred';
                        app.loginService.viewModel.mobileNotification(msg,'warning');  
                        
                    }
                }); 
          	  closeModalView(e);
                app.documentsetting.viewModel.refreshView(); 
            }
        },
        deleteFile:function(e)
        {
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-files-events-popup").data("kendoMobilePopOver").close();
                $("#tabstrip-share-files-file-events-popup").data("kendoMobilePopOver").close();
            }
           $("#tabstrip-delete-files").data("kendoMobileModalView").open();
        } ,
        thisFileDelete:function(e)
        {
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.thisFileDelete(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                parentName = shareBackHistory[shareBackHistory.length-1];
                if(parentName==='Shared Files')
                {
                  
                    var dataSource = new kendo.data.DataSource({
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFile"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"deletefile",userID:localStorage.getItem("userID"),fileID:sessionStorage.getItem("currentFileId"),parentName:parentName}  // search for tweets that contain "html5"
                    }
                    },    
                    schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                    },

                    }); 
                }
                else
                {
                    var dataSource = new kendo.data.DataSource({
                    transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFile"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"deletefile",userID:localStorage.getItem("userID"),fileID:sessionStorage.getItem("currentFileId")}  // search for tweets that contain "html5"
                    }
                    },    
                    schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                    },

                    });  
                }
                
                 
                dataSource.fetch(function(){
                    var data = dataSource.data(); 

                    if(data['0']['results']['faultcode'] === 1)
                    {
                        msg ="File Deleted Successfully.";
                        app.loginService.viewModel.mobileNotification(msg,'success');
                    }
                    else if(data['0']['results']['faultcode'] === 0)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'info');  
                    }
                    else
                    {
                        msg ='Some Error Occurred';
                        app.loginService.viewModel.mobileNotification(msg,'warning');  
                        
                    }
                }); 
          	  closeModalView(e);
                app.documentsetting.viewModel.refreshView();
			}
        },
       
        renameFolder:function(e)
        {
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-folder-events-popup").data("kendoMobilePopOver").close();
            }
            var that = this;
            that.set("renameFolderName",$.trim(sessionStorage.getItem("currentFName")));
            $("#tabstrip-rename-folder .new-folder-field").val(that.get("renameFolderName"));
            $("#tabstrip-rename-folder").data("kendoMobileModalView").open();
        },
        thisFolderRenameCancle:function(e)
        {
            var that = this;
            that.set("renameFolderName","");
            $("#tabstrip-rename-folder").data("kendoMobileModalView").close();  
        },
        thisFolderRename:function(e)
        {
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.thisFolderRename(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                var that = this;
                var renameFolder = that.get("renameFolderName");
                if (renameFolder === "") {
                    navigator.notification.alert("Please enter folder name",
                    function () { }, "Notification", 'OK');

                    return;
                }
                if (renameFolder.length > 255) {
                    navigator.notification.alert("Folder name should be less than 255 chracters",
                    function () { }, "Notification", 'OK');

                    return;
                }
    		    var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"renamefolder",userID:localStorage.getItem("userID"),folderID:sessionStorage.getItem("currentFId"),folderName:renameFolder,parentID:parentId}  // search for tweets that contain "html5"
                    }
                },    
                schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                },
         
                });
                 
                dataSource.fetch(function(){
                    var data = dataSource.data(); 
                    if(data['0']['results']['faultcode'] === 1)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'success');
                    }
                    else if(data['0']['results']['faultcode'] === 0)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'info');  
                    }
                    else
                    {
                        msg ='Some Error Occurred';
                        app.loginService.viewModel.mobileNotification(msg,'warning');  
                        
                    }
                }); 
          	  closeModalView(e);
                app.documentsetting.viewModel.refreshView(); 
            }
            
        },
        renameFile:function(e)
        {
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-files-events-popup").data("kendoMobilePopOver").close();
            }
            var that = this;
            that.set("fileExt",$.trim(that.getFileExtension(sessionStorage.getItem("currentFileName"))));
            var fileNameWithoutExt= sessionStorage.getItem("currentFileName").substr(0, sessionStorage.getItem("currentFileName").lastIndexOf('.'));
            that.set("renameFileName",fileNameWithoutExt);
            $("#tabstrip-rename-file .new-folder-field").val(that.get("renameFileName"));
            $("#tabstrip-rename-file").data("kendoMobileModalView").open();
        },
        
        thisFileRenameCancle:function(e)
        {
            var that = this;
            that.set("renameFileName","");
            $("#tabstrip-rename-file").data("kendoMobileModalView").close();  
        },
        thisFileRename:function(e)
        {
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.thisFileRename(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                var that = this;
                var renameFile = that.get("renameFileName");
                if(that.get("fileExt") === '.' || that.get("fileExt") === '')
                {
					renameFileExt = ''; 
                }
                else
                {
    				renameFileExt = '.'+that.get("fileExt");
                }
                if (renameFile === "") {
                    navigator.notification.alert("Please enter file name",
                    function () { }, "Notification", 'OK');

                    return;
                }
                if (renameFile.length > 255) {
                    navigator.notification.alert("File name should be less than 255 chracters",
                    function () { }, "Notification", 'OK');

                    return;
                }
                
    		    var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFile"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"renamefile",userID:localStorage.getItem("userID"),fileID:sessionStorage.getItem("currentFileId"),fileName:renameFile+renameFileExt,parentID:parentId}  // search for tweets that contain "html5"
                    }
                },    
                schema: {
                    data: function(data)
                    {   
                    	return [data];
                    }
                },
         
                });
                 
                dataSource.fetch(function(){
                    var data = dataSource.data(); 

                    if(data['0']['results']['faultcode'] === 1)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'success');
                    }
                    else if(data['0']['results']['faultcode'] === 0)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'info');  
                    }
                    else
                    {
                        msg ='Some Error Occurred';
                        app.loginService.viewModel.mobileNotification(msg,'warning');  
                        
                    }
                }); 
          	  closeModalView(e);
                app.documentsetting.viewModel.refreshView();
            }
        },
        exportFile:function(e)
        {	
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-folder-events-popup").data("kendoMobilePopOver").close();
            }
             apps.navigate('views/fileExport.html');
        },
        moveFolder:function(e)
        {
            if(typeof e.sender.element.context.dataset.src === "undefined" || e.sender.element.context.dataset.src === "")
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-folder-events-popup").data("kendoMobilePopOver").close();
            }
            var params = e.button.data();
            apps.navigate('views/movedocs.html?param='+params.checkstatus);
        },
        hideRefreshLoading:function()
        {
            var that = this;
            that.set("showrefreshLoading", false);
        },
        setParentId:function(id)
        {
            var that = this;
            that.set("parentId", id);
        },
      
        newFolderModal:function(e)
        { 
            var that = this;
            that.set("newFolderName", "");
            app.homesetting.viewModel.closeParentPopover(e);
            if(shareBackHistory[0]==='Shared Files' || shareBackHistory[0]==='Shared Folders')
            {
                navigator.notification.alert("This action can not be complete in share files/folders section.",
                    function () { }, "Notification", 'OK');
                
            }
            else
            {
                 $("#tabstrip-new-folder").data("kendoMobileModalView").open();    
            }
 
        },
        newFolderCreate:function(e)
        {
            if(!window.connectionInfo.checkConnection()){
            	navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            		if (confirmed === true || confirmed === 1) {
            			app.documentsetting.viewModel.newFolderCreate(e);
            		}

            	}, 'Connection Error?', 'Retry,Cancel');
            }
            else
            {
                var that = this;
                newFolderName = that.get("newFolderName");
                if (newFolderName === "") {
                    navigator.notification.alert("Please enter folder name",
                    function () { }, "Notification", 'OK');

                    return;
                }
                if (newFolderName.length > 255) {
                    navigator.notification.alert("Folder name should be less than 255 chracters",
                    function () { }, "Notification", 'OK');

                    return;
                }
                var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiFolder"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: {apiaction:"addfolder",userID:localStorage.getItem("userID"),parentID:parentId,folderName:newFolderName}  // search for tweets that contain "html5"
                    }
                },    
                schema: {
                     data: function(data)
                    {   
                    	return [data];
                    }
                },
         
                });
                     
                dataSource.fetch(function(){
                    var data = dataSource.data(); 

                    if(data['0']['results']['faultcode'] === 1)
                    {
                        msg ="New Folder Created";
                        app.loginService.viewModel.mobileNotification(msg,'success');
                    }
                    else if(data['0']['results']['faultcode'] === 0)
                    {
                        msg =data['0']['results']['faultmsg'];
                        app.loginService.viewModel.mobileNotification(msg,'info');  
                    }
                    else
                    {
                        msg ='Some Error Occurred';
                        app.loginService.viewModel.mobileNotification(msg,'warning');  
                        
                    }
                });   
                closeModalView(e);
                that.get("newFolderName","");
                app.documentsetting.viewModel.refreshView();
            }
        },
        setUserLogout:function()
        {
            app.loginService.viewModel.setUserLogout();
        },
        gobackDocsPage:function()
        {
            
            var that = this;
            if(!that.get("showrefreshLoading")){
                if(app.documentsetting.viewModel.parentId !== "0")
                {
                	app.documentsetting.viewModel.setInnerPage();
                }
                else
                {
                	app.documentsetting.viewModel.setMainPage();

                }
                if(docsBackHistory[docsBackHistory.length-2] === 0){
                	app.documentsetting.viewModel.setMainPage(); 
                }
                app.documentsetting.viewModel.setParentId(docsBackHistory[docsBackHistory.length-2]);
                docsBackHistory.pop();
                shareBackHistory.pop();
                app.documentsetting.viewModel.refreshView();
            }
             
        },
        getFilesystem:function (success, fail) {
        	window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
       	 window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, success, fail);
        },

        getFolder: function (fileSystem, folderName, success, fail) {
        	fileSystem.root.getDirectory(folderName, {create: true, exclusive: false}, success, fail)
        },
        downloadFile:function(fileName,folderName)
        {
		    filePath = "";

            	app.documentsetting.viewModel.getFilesystem(
            		function(fileSystem) {
            			
            			if (device.platform === "Android") {
            				app.documentsetting.viewModel.getFolder(fileSystem, folderName, function(folder) {
            					filePath = folder.fullPath + "\/" + fileName;
                                relPath = folder.name + "\/" + fileName;
                                //relPath =fileName;
                                fileSystem.root.getFile(relPath, { create: false }, app.documentsetting.viewModel.fileExists, app.documentsetting.viewModel.fileDoesNotExist);
                                
            				}, function() {
            					console.log("Failed to get folder");
            				});
            			}
            			else {
            				filePath = fileSystem.root.fullPath + "\/" +"biz2docs\/" +fileName;
                            fileSystem.root.getFile(filePath, { create: false }, app.documentsetting.viewModel.fileExists, app.documentsetting.viewModel.fileDoesNotExist);
            				
            			}
            		},
            		function() {
            			navigator.notification.alert("Failed to get filesystem");
            		}
            		);
           
        },
        
        fileExists:function(fileEntry)
        {
            if(device.platform.toLowerCase() === "ios" )
            {
                window.open(encodeURI(fileEntry.fullPath),"_blank","location=yes,hidden=no");
            }
            else
            {
                window.open(encodeURI(fileEntry.fullPath),"_system","location=yes,hidden=no");
            }
             
        },
        fileDoesNotExist:function(fileError)
        {
            fileName = sessionStorage.getItem("currentFileName");
            downloadLink = sessionStorage.getItem("downloadLink");
            ext = app.documentsetting.viewModel.getFileExtension(fileName);
            uri=encodeURI(downloadLink); 
            $("#tabstrip-download-file").data("kendoMobileModalView").open();
            app.documentsetting.viewModel.transferFile(uri,filePath);
            
            $('.download-file-name').html('');
        	$('.download-file-name').append('<div class="unkown '+ext+'">'+fileName+'</div>');
                                
        },
        transferFile: function (uri, filePath) {
            transfer = new FileTransfer();
            transfer.onprogress = function(progressEvent) {
                if (progressEvent.lengthComputable) {
                   
                	var perc = Math.floor(progressEvent.loaded / progressEvent.total * 100);
                	$('#status').innerHTML = perc + "% loaded...";
                } else {
                	if($('#status').innerHTML === "") {
                       
                		$('#status').innerHTML = "Loading";
                	} else {
                        
                		$('#status').innerHTML += ".";
                	}
                }
            };
            transfer.download(
                uri,
                filePath,
                function(fileEntry) { 
                    $("#tabstrip-download-file").data("kendoMobileModalView").close();
                    if(device.platform.toLowerCase() === "ios" )
            		{
                		window.open(encodeURI(fileEntry.fullPath),"_blank","location=yes,hidden=no");
            		}
            		else
            		{
                		window.open(encodeURI(fileEntry.fullPath),"_system","location=yes,hidden=no");
            		}	
                },
                function(error) {
                    app.documentsetting.viewModel.getFilesystem(
                		function(fileSystem) {
                			fileSystem.root.getFile(filePath, {create: false,exclusive:true},  app.documentsetting.viewModel.gotRemoveFileEntry,  navigator.notification.alert("Download process aborted",function () { }, "Notification", 'OK'));
                		},
                		function() {
                			console.log("failed to get filesystem");
                		}
            		);
                    
                }
            );
            
        },
        gotRemoveFileEntry:function(fileEntry)
        {
          fileEntry.remove(function() {
                			console.log("File is removed from filesystem");
                		}, function() {
                			console.log("File is not removed from filesystem");
                		});  
        },
        transferFileAbort:function()
        {
            transfer.abort();  	
        },
        getFileExtension:function(filename)
        {
            var ext = /^.+\.([^.]+)$/.exec(filename);
            return ext === null ? "" : ext[1];
        },
        closeFileDownloadProcess:function()
        {
           
           $("#tabstrip-download-file").data("kendoMobileModalView").close();
           app.documentsetting.viewModel.transferFileAbort();

        },
        onSettingPage:function()
        {
             app.loginService.viewModel.onSettingPage();
        },
        shareVia:function(e)
        {
            if(typeof e.sender.element.context.dataset.src === 'undefined')
            {
               closeModalView(e); 
            }
            else
            {
                $("#tabstrip-files-events-popup").data("kendoMobilePopOver").close();
            }
            var socialsharing =window.plugins.socialsharing;
            var message ='';
            var subject = '';
            var file = null;
            var url = sessionStorage.getItem("downloadLink");
            //var url = '<a href="'+urltext+'">'+urltext+'</a>';
            socialsharing.share(message,
                subject,
                file,
                url,
                function(downmsg){
                    //navigator.notification.alert(downmsg);
                }, 
                function(downerr){
                    //navigator.notification.alert(downerr);
                }
            );
        }
       
    });
    app.documentsetting = {
        
		viewModel: new DocumentsViewModel(),     	
    };
 
})(window,jQuery);