(function(global){
    var documentAttachModel,
        app = global.app = global.app || {};
    
    documentAttachModel = kendo.data.ObservableObject.extend({
        show:function()
        {
            app.loginService.viewModel.showloder();
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
                app.documentAttach.viewModel.existingDocumentList(data);
                app.documentAttach.viewModel.uplocadDocumentList(data);
            });

            
            
            
            
            app.documentAttach.viewModel.uploadDocumentClick();
        },
        existingDocumentList:function(docsData)
        {
           /* console.log(data);
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
                 
               
        	});  */
          //  console.log(docsData);
            var template = kendo.template($("#documentList-template").html());

            //Create some dummy data
            var data = docsData;
           // console.log(localStorage.getItem("userFName"));
           // console.log(data[0].length);

            var result = template(data); //Execute the template
            $("#documentList").html(result); //Append the result
            app.loginService.viewModel.hideloder();
       
        },
        uplocadDocumentList:function(docsData)
        {
           // console.log(docsData);
            var template = kendo.template($("#dropdownList-template").html());

            //Create some dummy data
            var data = docsData;
            console.log(localStorage.getItem("userFName"));
            console.log(data[0].length);

            var result = template(data); //Execute the template
            $("#dropdownList").html(result); //Append the result
        },
        getFileExtension:function(filename)
        {
           // console.log(filename);
            var ext = /^.+\.([^.]+)$/.exec(filename);
            return ext === null ? "" : ext[1];
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