(function(global){
    var LoanAppFPModel,
    	app = global.app = global.app || {};
    
    LoanAppFPModel = kendo.data.ObservableObject.extend({
        
        currentfid:(localStorage.getItem("fid") !== '') ?  localStorage.getItem("fid") : '',
        funding_priority:'',
        min_loan_amount:'',
        max_loan_amount:'',
        colateral:[],
        agreement:0,
        loanagreement:0,
        
        show:function(e){
            e.sender.reload=false;
            e.view.reload=false; 
            $(".km-native-scroller").scrollTop(0);
            $.validator.addMethod("greaterThan",
                function (value, element, param) {
                    var $min = $(param);

                    var max1 = $min.val().replace(/,/g,"");
                    var min1 = value.replace(/,/g,"");

                    if (this.settings.onfocusout) 
                    {
                        $min.off(".validate-greaterThan").on("blur.validate-greaterThan", function () {
                       	 $(element).valid();
                   	 });
                	}
                return parseInt(min1) > parseInt(max1);
            });
            
            $.validator.addMethod("greaterThanzero",function (value, element) {
                var num = value.replace(/,/g,"");
                return num > 0;
            });
           
            $("#b2cApp4").validate({

                rules:{
                    priority1:{
                       required:true
                    },
                    ammount:{
                        required:true,
                        number: true,
                        greaterThanzero:true
                    },
                    txtmaxammount:{
                        required:true,
                        number: true,
                        greaterThanzero:true,
                        greaterThan:"#ammount"
                    },
                    'chkuseplan[]':{
                        required:true,
                        minlength:1
                    },
                    agreement: {
                  	  required:true
                    },
                    loanagreement: {
                   	 required:true
                    }

            },
            messages: {

                priority1:{
               	 required:"This value is required",
                },
                ammount:{
                    required:"This value is required",
                    number: "Please enter digits only",
                    greaterThanzero: "Value should be greater then zero"
                },
                txtmaxammount:{
                    required:"This value is required",
                    number: "Please enter digits only",
                    greaterThan:"Must be greater than to minimum amount",
                    greaterThanzero: "Value should be greater then zero"
                },
                'chkuseplan[]':{
                    required:"This value is required",
                    minlength:"Please select atleast one"
                },
                agreement: {
               	 required:"This value is required"
                },
                loanagreement: {
               	 required:"This value is required"
                }

            },
            submitHandler: function(form) {
               /* $("#hidorgtype").val($("#orgtype").val());
                form.submit();
                return false;*/
                }
            });
            if(sessionStorage.getItem("LoanAppFPEditMode") ==='1')
            {
                sessionStorage.setItem("LoanAppPIEditMode",'0');
                sessionStorage.setItem("LoanAppFPEditMode",'0');
                app.loanFP.viewModel.setFPeditForm();
            }      
        },
        
       setFPeditForm:function(){
            var that=this;
            var data =manageData;
            var minLoanAmount =  app.loansetting.viewModel.setCommaNumber(Number(data['findetails']['ammount']).toString());
            var maxLoanAmount =  app.loansetting.viewModel.setCommaNumber(Number(data['findetails']['max_amount']).toString());

            that.set("funding_priority",(Number(data['findetails']['priority1'])!== 0) ? Number(data['findetails']['priority1']) : "");

            that.set("min_loan_amount",(minLoanAmount!== '0') ? minLoanAmount : "");
            that.set("max_loan_amount",(maxLoanAmount!== '0') ? maxLoanAmount : "");
            var planChk = data['findetails']['plansids'].split(",");
            $.each(planChk,function(index,value){
                if($.isNumeric(index))
                {
                    $(".useplan:checkbox[value="+value+"]").prop("checked",true);
                }
            });  
       },
       
        
        loanFPSubmit:function(){
            var status = $("#b2cApp4").valid();

            if(status === false)
            {
            	return false;
            }
            dataParam =  {};
            var that = this;
            var chkuseplan = [];

            dataParam['apiaction']='loanappstep4';
            dataParam['cust_id']=localStorage.getItem("userID");
            dataParam['fid']=localStorage.getItem("fid");
            dataParam['type']='';
            dataParam['frmname']='b2cApp4';
            dataParam['prefer_act']='Next';    
            dataParam['priority1']=that.get("funding_priority");
            dataParam['ammount']=that.get("min_loan_amount").trim();
            dataParam['txtmaxammount']=that.get("max_loan_amount").trim();
            $(".useplan:checked").each(function() {
            	chkuseplan.push($(this).val());
            });
            dataParam['chkuseplan']=chkuseplan;
            dataParam['agreement']=$("#agreement").is(':checked') ? 1 : 0;
            dataParam['loanagreement']=$("#loanagreement").is(':checked') ? 1 : 0;

            dataParam['hidacccard']='';
            dataParam['orgtype']='';
            
            app.loginService.viewModel.showloder();
            var dataSource = new kendo.data.DataSource({
                transport: {
                read: {
                    url: localStorage.getItem("urlMobAppApiLoan"),
                    type:"POST",
                    dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                    data: dataParam
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
                app.loginService.viewModel.hideloder();
                if(data[0]['results']['faultcode'] === 1 || data[0]['results']['faultcode'] === "1")
                {
                    $msg= "Finacial Preference submitted successfully";
                    app.analyticsService.viewModel.trackFeature("FreshLoanApplication.All Loan Application submitted successfully");
                    app.loginService.viewModel.mobileNotification($msg,'info');
                    
                    app.loanAppPI.viewModel.ManageOwnerHideenField(dataParam);
                    app.homesetting.viewModel.homeShow(); 
                    apps.navigate('views/matches.html');
                }
                else if(data[0]['results']['faultcode'] === 0 || data[0]['results']['faultcode'] === "0")
                {
                    $msg= "Finacial Preference not submitted successfully.";
                    app.loginService.viewModel.mobileNotification($msg,'info'); 
                    return;
                }
                else if(data[0]['results']['faultcode'] === 3 || data[0]['results']['faultcode'] === "3")
                {
                    $msg= "Please enter all fields.";
                    app.loginService.viewModel.mobileNotification($msg,'info');
                    return;
                }
                else{
                    $msg= "Server not responding properly,Please try again";
                    app.loginService.viewModel.mobileNotification($msg,'info');
                    return;
                }            

                });
        },
        resetLoanAppFPForm:function()
        {
        	var that = this;
        	that.set("funding_priority",'');
        	that.set("min_loan_amount",'');
        	that.set("max_loan_amount",'');
            that.set("agreement",0);
            that.set("loanagreement",0);
        	that.set("colateral",[]);
            $("input[type=checkbox]" ).attr( "checked",false);
        }
    });
    
    app.loanFP = {
      viewModel:new LoanAppFPModel()
    };
})(window);