(function(global){
    var DocumentPendingModel,
        app = global.app = global.app || {};
    
    DocumentPendingModel = kendo.data.ObservableObject.extend({
        show:function()
        {
            /*Upload Document Toggle*/
            
            $(".documentList .wrap-content h2").on("click", function() {                                    
                $(this).next(".rows").slideToggle();
                $(this).toggleClass("off");
            });

            $(".documentList .wrap-content .row .name a").on("click", function() {
                $(this).parents('.row').next(".filesBlock").slideToggle();	
            });
        },
        UploadExisting:function()
        {
            apps.navigate("views/document_attach.html");
        },
    });
    app.documentService ={
        viewModel:new DocumentPendingModel()
    };
})(window);