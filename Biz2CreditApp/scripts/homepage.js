(function (global,$) {
    var HomepageViewModel,
        app = global.app = global.app || {};

    HomepageViewModel = kendo.data.ObservableObject.extend({
		Matches:[],
        LoanAmt:"",
        YearsBus:"",
        AnnnualRevenue:"",
        CreditScore:"",
        State:"",
        toolStatus:false,
        name:localStorage.getItem("userFName"),
        email:localStorage.getItem("userEmail"),
        phone:"+"+localStorage.getItem("userMobile"),
        dHeader:(window.localStorage.getItem("dHeader") !== null) ?  localStorage.getItem("dHeader") : '',
        dDescription:(window.localStorage.getItem("dDescription") !== null) ?  localStorage.getItem("dDescription") : '',
        dButtonText :(window.localStorage.getItem("dButtonText") !== null) ?  localStorage.getItem("dButtonText") : '',
        dButtonLink:(window.localStorage.getItem("dButtonLink") !== null) ?  localStorage.getItem("dButtonLink") : '',
        repaymentStatus:false,

        matchShow:function()
        { 
			var latestMatches = app.homesetting.viewModel.Matches;
            if(latestMatches.length===0)
            {
                mHtml = '<div class="bmatches"><p>Loading...</p>';
                $("#MatchesListnew").html(mHtml);
            }
            else
            {
                $("#MatchesListnew").html('');
            }
        },
        homeShow: function (e) {
			
            app.loginService.viewModel.formValidateReset();
            $(".km-scroll-container").css("-webkit-transform", "");
            $("[data-role=\"popover\"][id =\"popover-people\"]").each(function() {
            	$(this).parent().attr('id', 'dynamicCl');
                
            });
            app.homesetting.viewModel.reSetRepaymentStatus();
            app.loginService.viewModel.showloder();  
            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiUser"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: { apiaction:"userdashboard",userid:localStorage.getItem("userID")} // search for tweets that contain "html5"
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
                app.loginService.viewModel.setSettingsPage();
                var data = that.data();
                app.homesetting.viewModel.setMatches(data['0']['results']['data']['loan']['matchrows']);
                pos = 1;
                var appId = data[0]['results']['data']['appid'];
                var cntGetStarted = data[0]['results']['data']['cntGetStarted'];
                var matchstatus = data[0]['results']['data']['matchstatus'];
                var totmatch = data[0]['results']['data']['totmatch'];
                var creditscore = data[0]['results']['data']['creditscore'];
                var loan_total = data[0]['results']['data']['loan']['total'];
                var loan_posted = data[0]['results']['data']['loan']['posted'];
                var loan_ended = data[0]['results']['data']['loan']['ended'];
                var loan_saved = data[0]['results']['data']['loan']['saved'];
                var matches = data[0]['results']['data']['loan']['matches'];
                var matchrows =data[0]['results']['data']['loan']['matchrows'];
                var funded =data[0]['results']['data']['funded'];
                var repaymentdata =data[0]['results']['data']['repaymentdata'];
                outFullHtml= '';
                for(i in repaymentdata){
                    
                   if($.isNumeric(i))
                    {
                        app.homesetting.viewModel.setRepaymentStatus();
                        //set date formate to resole invalid date in safari
                        
                        values_ifd = repaymentdata[i][0]['initial_funding_date'].split(/[^0-9]/),
                        year_ifd = parseInt(values_ifd[0], 10),
                        month_ifd = parseInt(values_ifd[1], 10) - 1, // Month is zero based, so subtract 1
                        day_ifd = parseInt(values_ifd[2], 10),
                        hours_ifd = parseInt(values_ifd[3], 10),
                        minutes_ifd = parseInt(values_ifd[4], 10),
                        seconds_ifd = parseInt(values_ifd[5], 10),
                        ifdDate =  new Date(year_ifd, month_ifd, day_ifd, hours_ifd, minutes_ifd, seconds_ifd);
                        //set date formate to resole invalid date in safari
                        
                        values_td = repaymentdata[i][0]['transaction_date'].split(/[^0-9]/),
                        year_td = parseInt(values_td[0], 10),
                        month_td = parseInt(values_td[1], 10) - 1, // Month is zero based, so subtract 1
                        day_td = parseInt(values_td[2], 10),
                        hours_td = parseInt(values_td[3], 10),
                        minutes_td = parseInt(values_td[4], 10),
                        seconds_td = parseInt(values_td[5], 10),
                        
                        tdDate =  new Date(year_td, month_td, day_td, hours_td, minutes_td, seconds_td);
                        
                        repaymentHtml ='';
                        repaymentHtml += '<ul id="repypmContent"><li>Bank Name<br><span class="tx">'+repaymentdata[i][0]['lender_name']+'</span></li>';
                        repaymentHtml += '<li>Application #<br><a href="javascript:void(0);" class="reld_info1" style="display: block;><span class="tx">'+repaymentdata[i][0]['appid']+'</span></a>';
                        repaymentHtml += '<div class="tooltip" style="position: absolute; data-click="viewtoolTip" opacity: 0; display: none;">';
                        repaymentHtml += '<span>Lender<span>'+repaymentdata[i][0]['lender_name']+'</span></span>';
                        repaymentHtml += '<span>Funded Amount<span> USD '+numeral(repaymentdata[i][0]['advance_amount']).format('0,0')+'</span></span> ';
                        repaymentHtml += '<span>Funded Date<span>'+kendo.toString(new Date(ifdDate), "MM-dd-yyyy")+'</span></span>';
                        repaymentHtml += '<span>Payback Amount<span> USD '+numeral(repaymentdata[i][0]['purchase_amount']).format('0,0')+'</span></span>';
                        repaymentHtml += '<span>Oustanding Balance<span> USD '+numeral(repaymentdata[i][0]['EndingBalance']).format('0,0')+'</span></span>';
                        repaymentHtml += '</div></li>';
                        repaymentHtml += '<li>Outstanding Balance<br><span class="tx">USD '+numeral(repaymentdata[i][0]['EndingBalance']).format('0,0')+'</span></li>';
                        repaymentHtml += '<li>Last Transaction<br><span class="tx">USD '+numeral(repaymentdata[i][0]['repay_amount']).format('0,0')+'</span></li>';
                        repaymentHtml += '<li>Last Updated Date<br><span class="tx">'+kendo.toString(new Date(tdDate), "MM-dd-yyyy")+'</span></li></ul>';
                        outFullHtml +=repaymentHtml;
                    }
                    
                }
                $("#repypmContent").remove();
                $("#repypm").append(outFullHtml);
                $(".reld_info1").on("click", function(e){                  
                    if($(".tooltip").css('display') === 'none'){ 
                    	$(".tooltip").show(); 
                    } else { 
                    	$(".tooltip").hide(); 
                    }

                });
                
                var userName= localStorage.getItem("userFName");
                
            	if(cntGetStarted === 0 && loan_total === 0){
                	pos = 1;
                   
                }
                if(matchstatus === 2 && loan_total > 0){
                	pos = 2;
                   
                }
                if(matchstatus === 0){
                	pos = 3;
                    
                }
                if(matchstatus === 1 &&  app.homesetting.checkMatchesStatus(data[0]['results']['data']['loan']['matchrows'])){
                	pos = 3;
                    
                }else if(matchstatus === 1 && funded === 0){
                	pos = 4;
                  
                }
                if(matchstatus === 1 && funded === 1){
                	pos = 5;
                   
                }
                if(app.homesetting.viewModel.repaymentStatus === true)
                {
                    pos = 6;
                }

                if((cntGetStarted >= 1 && loan_posted === 0)){
                   
                        if(totmatch === "0")
                        { 
                            
                            if(creditscore.search("-")){
                                var tempvar = creditscore.lastIndexOf("-");
            		        	var substr = creditscore.substring(0,tempvar);
                                totmatch = app.homesetting.viewModel.getTotalMatches(substr);
                                
                            }
                            else{
                                totmatch = app.homesetting.viewModel.getTotalMatches(creditscore);
                            }
                            dHeader ='Hi '+userName+', we have '+totmatch+' potential options for you!';
                        }
                    	else
                    	{
                        	dHeader ='Hi '+userName+', we have '+totmatch+' potential options for you!';
                    	}
                    	
                        dDescription='Please start your application in order to get matched to pre-qualified funding opportunities';
                        dButtonText = "Start an Application";
                        dButtonLink ="views/loanAppBI.html";
                    }
               if((cntGetStarted>=1 && loan_total===0) || (loan_total===loan_ended)) {
                   
                        if(totmatch === 0 || totmatch === '')
                        {
                            dHeader='Hi '+userName+', We have 1200+ lenders to finance your needs';
                        }
                        else
                        {
                            dHeader ='Hi '+userName+', we have '+totmatch+' potential options for you!'; 
                        }
                		
                		dDescription='Please start your application in order to get matched to pre-qualified funding opportunities';
                		dButtonText = "Start an Application";
                		dButtonLink ="views/loanAppBI.html";
                    }
                if(cntGetStarted===0 && loan_total===0) {
                        dHeader='Hi '+userName+', We have 1200+ lenders to finance your needs';
                        dDescription='Please start your application in order to get matched to pre-qualified funding opportunities';
                        dButtonText = "Start an Application";
                        dButtonLink ="views/loanAppBI.html";
    				}
               /* if(loan_total === loan_saved && loan_total>0) {
    					dHeader= userName+', your loan application is incomplete.';
                        dDescription='In order to see what loan offers you qualify for, you must finish the application. Please click to resume or schedule a call to receive help from a loan expert.';
                        dButtonText = "Complete Application";
                        dButtonLink ="#";
                    }*/
                if(loan_posted === 0 && loan_saved >= 1){
                    	dHeader= userName+', your loan application is incomplete.';
                        dDescription='In order to see what loan offers you qualify for, you must finish the application. Please click to resume or schedule a call to receive help from a loan expert.';
                        dButtonText = "Complete Application";
                        dButtonLink ="#tabstrip-mess-two";
                    }
                if(matchstatus===0 && matches>=1) {
                     dHeader= userName+', you have '+matches+' pre-qualified loan matches.';
                     dDescription='Please review your matches and select your preferred financing option(s)';
                     dButtonText = "Select a Loan Product";
                     dButtonLink ="views/matches.html";
                    }
                if(matchstatus===0 && matches===0) { 
                     dHeader= 'You have '+matches+' loan matches';
                     dDescription='No worries! We are here to help you. Use BizAnalyzer to find ways to improve your business\'s finances and funding opportunities.';
                     dButtonText = "Check your BizAnalyzer Score";
                     dButtonLink ="#tabstrip-mess-third";
                    }
                if(matchstatus === 1 && app.homesetting.checkMatchesStatus(matchrows)){
                     dHeader= userName+', you have '+matches+' pre-qualified loan matches.';
                     dDescription='Please review your matches and select your preferred financing option(s)';
                     dButtonText = "Select a Loan Product";
                     dButtonLink ="views/matches.html";
                    }
                else if(matchstatus === 1 && funded === 0)
                {
                     dHeader= userName+', Your submissions are still pending.';
                     dDescription= 'Please review these items and complete any remaining actions if necessary';
                     dButtonText = app.homesetting.viewModel.getLatestMatchStatus(matchrows);
                     dButtonLink ="views/matches.html";
                }
                if(matchstatus === 1 && funded === 1){
    			
    				dHeader= userName+', Your submissions are still pending.';
    				dDescription= 'Please review these items and complete any remaining actions if necessary';
                	dButtonText = app.homesetting.viewModel.getLatestMatchStatus(matchrows);
                	dButtonLink ="views/matches.html";
                    
    		    }
                if(app.homesetting.viewModel.repaymentStatus === true)
                {
                    dHeader='Congratulations '+userName+'!';
                    dDescription='Please reapply when you need additional funds or would like to refinance.';
                    dButtonText = "Start an Application";
                    dButtonLink ="views/loanAppBI.html";
                }
                
                $('#stps ul li').removeClass();
                if(pos===1)
                {
                     $('#stps ul li:eq('+(pos-1)+')').addClass('activ');
                     $('#stps ul li:lt('+(pos)+')').addClass('dn');
                }
                else if(pos ===6)
                {
                    $('#stps ul li:eq(4)').addClass('activ');
                	$('#stps ul li:lt(5)').addClass('dn'); 
                    
                }
                else
                {
                     $('#stps ul li:eq('+(pos-1)+')').addClass('activ');
                	$('#stps ul li:lt('+(pos-1)+')').addClass('dn');
           		 
                }
                
                $("#home-call-btn").html("");
                localStorage.setItem("fid",'72115');
                //dHeader='Congratulations '+userName+'!';
                //dDescription='Please reapply when you need additional funds or would like to refinance.';
               //dButtonText = "Start an Application";
                //dButtonLink ="views/matches.html";
                if(dButtonLink === "views/matches.html")
                {
                    var html = '<a class="btngr" href="'+dButtonLink+'" data-role="button">'+dButtonText+'</a>';
                }
                else if(dButtonLink === "views/loanAppBI.html")
                {
                    var html = '<a class="btngr" href="'+dButtonLink+'" data-role="button">'+dButtonText+'</a>';
                }
                else if(dButtonLink === "#tabstrip-mess-two")
                {
                    var html = '<a class="btngr" data-bind="click: applyFreshLoan" data-mode="edit"  data-fid="'+appId+'">'+dButtonText+'</a>';
                }
                else{
                    var html = '<a class="btngr" href="'+dButtonLink+'" data-rel="modalview" data-role="button">'+dButtonText+'</a>';
                }
                 
                $("#home-call-btn").append(html);
                kendo.bind($("#home-call-btn"), app.homesetting.viewModel);
                app.homesetting.viewModel.setHomeToolTips(data[0]['results']['data']);
                app.homesetting.viewModel.setcache(dHeader,dDescription,dButtonText,dButtonLink);

            });
        },
		setcache:function(dHeader,dDescription,dButtonText,dButtonLink)
        {
            var that = this; 
            that.set("dHeader",dHeader);
            that.set("dDescription",dDescription);
            that.set("dButtonText",dButtonText);
            that.set("dButtonLink",dButtonLink);
            app.loginService.viewModel.hideloder();
        },
        getLatestMatchStatus:function(matchrows){
            var status;
            dateArray1 =[];
            dateArray2 =[];
            $.each(matchrows , function(index, val) {
                
                if(val['statusid']>1)
                {
                    dateArray1.push(app.homesetting.viewModel.toTimestamp(val['status_date'])); 
                    dateArray2.push(val['status_name']);
                }
				             
            });
            
           status =  dateArray2[$.inArray(Math.max.apply( Math, dateArray1), dateArray1)];
           if(status === '' || typeof status === "undefined"){
               
			status = "View Matches";
               
			}
            return status;
        },
        toTimestamp:function(strDate){
       	 var datum = Date.parse(strDate);
       	 return datum/1000;
        },
        getTotalMatches: function(creditscore)
        {
            var strfoption = "";
            if(creditscore < 600) {        
            	strfoption = app.homesetting.viewModel.randumNumber(50, 55);
            } else if(creditscore >=600 && creditscore <=659){         
            	strfoption = app.homesetting.viewModel.randumNumber(56, 65);
            } else if(creditscore >=660 && creditscore <=720){        
            	strfoption = app.homesetting.viewModel.randumNumber(66, 80);
            } else if(creditscore >=721 && creditscore <=850){         
            	strfoption = app.homesetting.viewModel.randumNumber(81, 100);
            } else{
            	strfoption = "49";
            }

            return strfoption;  
        },
        randumNumber:function(m,n)
        {
            var m = parseInt(m);
            var n = parseInt(n);
            return Math.floor( Math.random() * (n - m + 1) ) + m;  
        },
        setMatches: function(data)
        { 
            var that = this;
            that.set("Matches", data);
            var latestMatches = app.homesetting.viewModel.Matches;
            if(latestMatches.length===0)
            {
                mHtml = '<div class="bmatches"><p>Unfortunately, we do not have any options for you at this time.</p>';
                mHtml += '<p>But dont worry, call our toll free number <span>(800-200-5678)</span> to speak with a loan specialist to discuss other options or how to improve your credit. Also, we are constantly adding new lenders and products and will notify you once there is a  new match. </p>';
                $("#MatchesListnew").html(mHtml);
            }
            else
            {
                $("#MatchesListnew").html('');
            }
            
        },
        getMatches: function()
        { 
               var that = this;
               that.get("Matches");
        },
        reqDocuments: function(e)
        {
            if(!window.connectionInfo.checkConnection()){
                navigator.notification.confirm('No Active Connection Found.', function (confirmed) {
            	if (confirmed === true || confirmed === 1) {
            		app.homesetting.viewModel.reqDocuments();
            	}

            }, 'Connection Error?', 'Retry,Cancel');
            }
            var pdata = e.button.data();
        	app.loginService.viewModel.showloder();

            var dataSource = new kendo.data.DataSource({
                transport: {
                    read: {
                        url: localStorage.getItem("urlMobAppApiUser"),
                        type:"POST",
                        dataType: "json", // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                        data: { apiaction:"reqdoclist",prodid:pdata.prodid,prodtype:pdata.prodtype} // search for tweets that contain "html5"
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
                $("#tabstrip-mess-fourth p").html("");
                if(typeof data[0]['results']['docLists'] !== "undefined")
                {
                    html ="<ol class='rdocs'>";
                    for(i =0; i < data[0]['results']['docLists'].length; i ++)
                    {
                    	html += "<li>"+data[0]['results']['docLists'][i]+"</li>"; 
                    }
                    html +="</ol>";
                    $(".doc-content").append(html);
                    $("#tabstrip-mess-fourth").data("kendoMobileModalView").open();  
                }
                
                $("#tabstrip-mess-fourth").find(".km-scroll-container").css("-webkit-transform", "");
                app.loginService.viewModel.hideloder();
            });    
        },
        matchAppy:function()
        {
            app.loginService.viewModel.showloder();
            // this space for send mail
            $("#tabstrip-mess-dynamic p").html("");
            html ="To apply for this product, Please log on to the web version of Biz2Credit.com";
            $("#tabstrip-mess-dynamic p").append(html);
            $("#tabstrip-mess-dynamic").data("kendoMobileModalView").open();
            
            app.loginService.viewModel.hideloder();
        },
        setHomeToolTips:function(data)
        {
            var that = this;
            that.set("toolStatus",false);
            if(data['loanamt'] ==="")
            {
                that.set("LoanAmt", false);
            }
            else
            {
                that.set("LoanAmt", "$"+data['loanamt']);
            }
            
            if(data['ageofbuss'] ==="")
            {
                that.set("YearsBus", false);
            }
            else
            {
                that.set("YearsBus", "$"+data['ageofbuss']);
            }
            
            if(data['annrevenue'] ==="")
            {
                that.set("AnnnualRevenue", false);
            }
            else
            {
                that.set("AnnnualRevenue", "$"+data['annrevenue']);
            }
            
            if(data['creditscore'] ==="")
            {
                that.set("CreditScore", false);
            }
            else
            {
                that.set("CreditScore", "$"+data['creditscore']);
            }
           // that.set("State",data['state']);
            that.set("name",localStorage.getItem("userFName"));
            that.set("email",localStorage.getItem("userEmail"));
            that.set("phone","+"+localStorage.getItem("userMobile"));
         
        },
        setToolTips:function()
        {
          
            var that = this;
            if(app.homesetting.viewModel.toolStatus === true)
            {
                that.set("toolStatus", false); 
            }
            else
            { 
                that.set("toolStatus", true);
            }
        },
        closeParentPopover:function()
        {
             $("#popover-people").data("kendoMobilePopOver").close();
            
        },
        setRepaymentStatus:function()
        {
             var that = this;
             that.set("repaymentStatus", true);
        },
        reSetRepaymentStatus:function()
        {
             var that = this;
             that.set("repaymentStatus", false);
        },
        applyFreshLoan:function(e)
        {
            app.loginService.viewModel.application(e);  
        }

  
    });
    app.homesetting = {
        checkMatchesStatus: function(msdata)
        {
            var ms = true;
            $.each(msdata, function( index, value ) {
                if(value.statusid > 1){
                	ms = false;
                } 
            });
            return ms;
        },
        
		viewModel: new HomepageViewModel(),     	
    };
 
})(window,jQuery);