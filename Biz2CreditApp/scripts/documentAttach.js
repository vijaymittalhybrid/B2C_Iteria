(function(global){
    var documentAttachModel,
        app = global.app = global.app || {};
    
    documentAttachModel = kendo.data.ObservableObject.extend({
        show:function()
        {
            alert("hello");
            /*Upload Buutton*/
            $("#uploadify").kendoUpload({
                async: {
                    saveUrl: "save",
                    removeUrl: "remove"
                },
                localization:{
                    select:"Browse..."
                }
            });
            
            /*Document API Load*/
            parentId=0;
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
            dataSource.fetch(function(){
                var that = this;
                var data = that.data();
                var docdata = data[0];
                console.log(data);
                app.documentAttach.viewModel.setManageDocument(data);
            });

            
            
            
            
            app.documentAttach.viewModel.uploadDocumentClick();
        },
        setManageDocument:function(data)
        {
            console.log(data);
            var that = this;
             $.each(data, function( index, value ) {
                 
                 
                 console.log(value.length);
                 for(i=0;i<value.length;i++)
                 {
                    if(value[i]['docType'] === "Folder" && value[i]['name'] !== "Shared Files" && value[i]['name'] !== "Shared Folders")
                    {
                        console.log(value[i]['name']);
                        that.set('folderList',(value[i]!== false) ? value[i] : []);
                    }
                 }
                 
               
        	});  
        },
        uploadDocumentClick:function()
        {
            var that=this;
            $('#tabstrip ul li').removeClass('k-state-active');
            $('#tabstrip ul li.postd_icn').addClass('k-state-active');
            that.set('uploadDocumentTab',true);
            that.set('existingDocumentTab',false);
        },
        existingDocumentClick:function()
        {
            var that=this;
            $('#tabstrip ul li').removeClass('k-state-active');
            $('#tabstrip ul li.end_icon').addClass('k-state-active');
            that.set('uploadDocumentTab',false);
            that.set('existingDocumentTab',true);
        },
        uploadDocumentData:function()
        {
            alert("upload");
        },
        attachDocumentData:function()
        {
            alert("attach");
        }
    });
    app.documentAttach = {
      viewModel:new documentAttachModel()  
    };
})(window);