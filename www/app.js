// Initialize app
var app = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var serviceURL = 'https://okmlshub.com/judson/loan/api/v1/';
var storage = window.localStorage;
var pushNotification;

// Add view
var mainView = app.addView('.view-main', {
    dynamicNavbar: true
});

//setStorage('user_id', 1);
setStorage('max_accounts', 1);

//console.log("LOGGED IN: " + isLoggedIn());
if(isLoggedIn() !== true) {
	//mainView.router.load({pageName: 'dashboard'});
	mainView.router.loadPage('welcome.html');
}
else {
	buildDashboard();
}

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //alert("READY");
})

$$(document).on('pageReinit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
	console.log("PAGE REINIT NAME: " + page.name);

})
// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
app.onPageInit('about', function (page) {
    // Do something here for "about" page
	
})

// Option 2. Using one 'pageInit' event handler for all pages:
$$(document).on('pageInit', function (e) {
    // Get page data from event data
    var page = e.detail.page;
console.log("PAGE NAME: " + page.name);
	if (page.name === 'index') {
		console.log('INDEX, CHECK LOGGIN: ' + isLoggedIn);

	}
    if (page.name === 'about') {
        // Following code will be executed for page with data-page attribute equal to "about"
        app.alert('Here comes About page');
        loading();
    }
    
    if (page.name === 'amortization') {
		var amount = $('input[name="loan_amount"]').val().replace(/,/g, '');
		var rate = $('input[name="int_rate"]').val();
		var years = $('input[name="loan_years"]').val();
		var start_date = $('input[name="start_date"]').val();
		var current_month = $('input[name="current_month"]').val();
		var acct_id = $('input[name="id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'amort_table',
				'format': 'json',
				'amount': amount, 
				'rate': rate, 
				'years': years, 
				'start_date': start_date, 
				'current_month': current_month,
				'acct_id': acct_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
	console.log('Data: ' + data); 
	
				var obj = $.parseJSON(data);
	console.log('Resp: ' + obj.code); 
				if(obj.code === 1) {
					$('#amort-container').html(obj.data);	
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
			},
			error : function(request,error) {
				$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
	
	if (page.name === 'alerts') {
		var user_id = $('input[name="user_id"]').val();
		$$.ajax({
			url : serviceURL,
			type : 'POST',
			data : {
				'method': 'get',
				'action': 'alerts_table',
				'format': 'json',
				'user_id': user_id,	
			},
			dataType: 'html',
			beforeSend: function() {
				loading('show');
		  	},
			success : function(data) {
	console.log('Data: ' + data); 
	
				var obj = $.parseJSON(data);
	console.log('Resp: ' + obj.code); 
				if(obj.code === 1) {
					$('#alerts-container').html(obj.data);	
				}
				else {
					//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				}
				loading('hide');
			},
			error : function(request,error) {
				$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
				console.log("Request (error): "+JSON.stringify(request));
				loading('hide');
			}
		});

	}
})

$$(document).on('pageInit', '.page[data-page="about"]', function (e) {
    // Following code will be executed for page with data-page attribute equal to "about"
    app.alert('Here comes About page');
})

$$(document).on('click', '.loginBtn', function() {
	var email = $$('input[name="email"]').val();
	var password = $$('input[name="password"]').val();
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'user_login',
			'format': 'json',
			'email': email,
			'password': password
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
console.log('Data: ' + data); 

			var obj = $.parseJSON(data);
console.log('Resp: ' + obj.code); 
			if(obj.code === 1) {
				setStorage('email', obj.data.email);
				setStorage('user_id', obj.data.id);
				setStorage('dllogin', 1);
				setStorage('max_accounts', obj.data.max_accounts);
				//$.mobile.navigate("#page-dashboard", {transition: "slide"});
				var mainView = app.addView('.view-dashboard', {
				    dynamicNavbar: true
				});
				//Push Notify
				try { 
                	pushNotification = window.plugins.pushNotification;
          			//$("#app-status-ul").append('<li>registering ' + device.platform + '</li>');
         			 alert('Registering ' + device.platform);
               	 		if(device.platform == 'android' || device.platform == 'Android' ||device.platform == 'amazon-fireos' ) {
                   		 	pushNotification.register(
                   	 		successHandler, 
                    		errorHandler, {
		                        "senderID":"1058444389453",
		                        "ecb":"onNotification"
		                    });     // required!
							
                    		alert('Registered the Android device');
		                } 
		                else {
		                    pushNotification.register(tokenHandler, errorHandler, {"badge":"true","sound":"true","alert":"true","ecb":"onNotificationAPN"});    // required!
		                    alert('Registered the iOS device');
		                }
            	}
            	catch(err) { 
	                txt="There was an error on this page.\n\n"; 
	                txt+="Error description: " + err.message + "\n\n"; 
	                alert(txt); 
	            }
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			$('.login-screen-title').after('<div class="alert alert-error list-block">An unknown error occured</div>');
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});

})

/* Test desktop */
$(document).ready( function() {

})

/*
$('.datepicker').datepicker({
	changeMonth: true,
	changeYear: true, 
	minDate: -20, 
	maxDate: "+1M +10D",
});
*/

$(document).mouseup(function(e) {
    var container = $('#account-container');
    e.stopPropagation();
   
    if (!container.is(e.target) && container.has(e.target).length === 0 && !$('.switchAccountBtn').is(e.target) && $('.switchAccountBtn').has(e.target).length === 0) {
        $('#account-container').removeClass('open');
        
    }
    
    var container2 = $('.app-modal');
	if ((!$('.app-modal').is(e.target) && $('.app-modal').has(e.target).length === 0) ||  ($('.close-modal').is(e.target) || $('.modal-close').is(e.target) ) ) {
		console.log("CLOSED CLICKED");
        modalClose();
    }


});

$(document).on('keyup', 'input[name="loan_term"]', function() {
	new_val = $(this).val().replace(/\D/g,'')
	$(this).val(new_val);
});  

$(document).on('keyup', 'input[name="loan_amount"], input[name="int_rate"], input[name="addl_pmt"]', function() {
	new_val = $(this).val().replace(/[^0-9.]/g, "")
	$(this).val(new_val);
});

$(document).on('click', '.modal-close, .closeModal', function() {
	modalClose();
});

$(document).on('click', '.switchAccountBtn', function() {
	if($('#account-container').hasClass('open')) {
		$('#account-container').removeClass('open');
	}
	else {
		$('#account-container').addClass('open');
	}
});

$(document).on('click', '.refreshBtn', function() {
	location.reload(); 
});


$(document).on('click', '.addAcctBtn', function() {
	showAccountSetupScreen(null);
});

$(document).on('click', '.editAcctBtn', function() {
	var id = $(this).attr('data-id');
	showAccountSetupScreen(id);
});


$(document).on('click', '.makePaymentBtn', function() {
	showPaymentScreen(null);
});

$(document).on('click', '.saveAcctBtn', function() {
	saveAcct();
});

$(document).on('click', '.editPaymentBtn', function() {
	var id = $(this).attr('data-id');
	console.log("ID: " + id);
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'get',
			'action': 'payment_details',
			'format': 'json',
			'id' : id, 
		},
		dataType: 'html',
		beforeSend: function() {

	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				//load screen...
				showPaymentScreen(obj.data);
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');

			}
			
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
		}
	});
});

$(document).on('click', '.showsSavingsBtn', function() {
	if($('#est-savings-form').hasClass('open')) {
		$('#est-savings-form').removeClass('open');
		$('.showsSavingsBtn i').removeClass('typcn-arrow-sorted-up');
		$('.showsSavingsBtn i').addClass('typcn-arrow-sorted-down');
	}
	else {
		$('#est-savings-form').addClass('open');
		$('.showsSavingsBtn i').addClass('typcn-arrow-sorted-up');
		$('.showsSavingsBtn i').removeClass('typcn-arrow-sorted-down');
	}
});

$(document).on('click', '.calcSavingsBtn', function() {
	var error_count = 0;
	$('.helper').remove();
	var id = $('input[name="id"]').val();
	var amount = $('input[name="loan_amount"]').val().replace(/,/g, '');
	var rate = $('input[name="int_rate"]').val();
	var years = $('input[name="loan_years"]').val();
	var start_date = $('input[name="start_date"]').val();
	var current_month = $('input[name="current_month"]').val();
	var ppmnt = $('input[name="addl_pmt"]').val();
	if(ppmnt === '') {
		$('#esinput').addClass('hasError');
		$('#esinput').after('<div class="helper error">Please enter an amount</div>');
		error_count++;
	}
	if(parseFloat(ppmnt) > parseFloat(amount)) {
		$('#esinput').addClass('hasError');
		//' + ppmnt + ' = ' +  amount + '
		$('#esinput').after('<div class="helper error">Amount entered is greater than loan amount.</div>');
		error_count++;
	}
	if(error_count > 0) {
		return false;
	}
	//calculate savings...
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'get',
			'action': 'savings',
			'format': 'json',
			'id' : id, 
			'amount': amount, 
			'rate': rate, 
			'years': years, 
			'start_date': start_date, 
			'current_month': current_month, 
			'ppmnt': ppmnt
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				var html = '<div id="sav-title">You will save</div>';
				html += '<div class="savings-total">$' + obj.data + '*</div>';
				html += '<div id="savings-notice">*Savings are estimated based on paying before the next scheduled payment is due.</div>';
				$('#savingsDisplay').html(html);
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});	
});


$(document).on('click', '#account-container li.sub-account-link', function() {
	$('#account-container').removeClass('open');
	var id = $(this).data('id');
	$('#acct-id-input').val(id);
	buildDashboard();
});

function loading(method) {
	if(method === 'show' || method === '') {
		$('body').append('<div class="page-overlay"><div class="loading"><span style="width:42px; height:42px" class="preloader preloader-white"></span></div></div>');
	}
	else if(method === 'hide') {
		$('.page-overlay').fadeOut('fast', function() {
			$(this).remove();
		});
	}
}

function isLoggedIn() {
	//var logged_in = getStorage('dllogin');
	console.log(getStorage('user_id'));
	if(getStorage('dllogin') !== '' && getStorage('dllogin') !== null && getStorage('user_id') != null) {
		return true;
	}
	return false;	
}

function setStorage(name, value) {
	storage.setItem(name, value);
}

function getStorage(name) {
	var val = storage.getItem(name);
	return val;
}

function deleteStorage(name) {
	//alert("DELETED");
	storage.removeItem(name);
	if(name === 'dllogin') {
		storage.removeItem('id');
		storage.removeItem('user_id');
		storage.removeItem('first_name');
		storage.removeItem('last_name');
		storage.removeItem('email');
	}
}

function modalOpen(id) {
	$('.app-modal').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
}

function modalClose() {
	$('.app-modal').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function confirm_dialog(message, yesCallback, noCallback) {
	$('#confirm').animate({
		'top' : '20px',
		'opacity' : '1'	,
	});
	$('body').append('<div class="page-overlay"></div>');
	$('body').addClass('no-scroll');
	$('#confirm .title').html(message);
	//var confirm_dialog = $('#confirm').confirm_dialog();

	$('#btnYes').click(function() {
		confirm_dialog_close();
		yesCallback();
	});
	$('#btnNo').click(function() {
		confirm_dialog_close();
		noCallback();
	});
}

function confirm_dialog_close() {
	$('#confirm').animate({
		'top' : '-500px',
		'opacity' : '0'	,
	});
	$('.page-overlay').fadeOut().remove();
	$('body').removeClass('no-scroll');
}

function isScrolledIntoView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();

    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();

    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

function showPaymentScreen(e) {
	//AJAX FOR Account
//console.log(e);
	$('.app-modal-title').html('Make Payment');
	$('.app-modal').attr('id', 'payment-app-modal');
	
	if(e !== null && e.payment_date != '') {
		$('.app-modal-title').html('Update Payment');
		var today = new Date(e.payment_date.replace(/-/g, '/'));
		//today = e.payment_date;
	}
	else {
		var today = new Date();	
	}
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd = '0'+dd
	} 

	if(mm<10) {
		mm = '0'+mm
	} 
	today = mm + '/' + dd + '/' + yyyy;
	var form = '';
	form += '<form id="savePaymentFrm" method="post">';
	if(e !== null && e.id != '') {
		form += '<input type="hidden" name="payment_id" value="' + e.id + '">';
	}
	var payment_amt = (e !== null && e.payment_amt != '') ? e.payment_amt : '';
	var payment_type = (e !== null && e.payment_type != '') ? e.payment_type : '';
	var status = (e !== null && e.status != '') ? e.status : '';
	form += '<div class="form-group">';
	form += '<label for="payment_amount">Payment Amount:</label>';
	form += '<input type="text" name="payment_amount" id="payment_amount" placeholder="Payment Amount" value="' + payment_amt + '">';
	form += '</div>';
	form += '<div class="form-group">';
	form += '<label for="payment_date">Payment Date:</label>';
	form += '<input type="date" name="payment_date" id="payment_date" class="datepicker" value="' + today + '">';
	form += '</div>';
	form += '<div class="form-group">';
	form += '<label for="payment_type">Payment Type:</label>';
	form += '<input id="typer" type="radio" name="payment_type" value="regular"';
	if(payment_type == 'regular') {
		form += ' checked';
	}
	form += ' /><label for="typer">Regular</label> <input id="typep" type="radio" name="payment_type" value="principal"';
	if(payment_type == 'principal') {
		form += ' checked';
	}
	form += ' /><label for="typep">Principal Only</label>';
	form += '</div>';
	form += '<div class="form-group">';
	form += '<label for="payment_cleared">Payment Cleared:</label>';
	form += '<input id="status" type="checkbox" name="payment_status" value="1"';
	if(status == 1) {
		form += ' checked';
	}
	form += '/><label for="status"></label>';
	form += '</div>';

	form += '</form>';
	form += '<div class="helper"><small>* Making a payment is for record keeping. Our app does not make the payment to your loan holder.</small></div>';
	$('.modal-body').html(form);
	$('.modal-footer').html('<button type="button" class="btn btn-primary savePaymentBtn">Save Payment</button> <button type="button" class="btn btn-danger closeModal">Cancel</button>');
	modalOpen('payment-app-modal');
}

$(document).on('click', '.savePaymentBtn', function() {
	var error_count = 0;
	$('.helper').remove();
	var user_id = $('input[name="user_id"]').val();
	var id = $('input[name="id"]').val();
	var payment_amount = $('input[name="payment_amount"]').val();
	var payment_date = $('input[name="payment_date"]').val();
	var payment_type = $('input[name="payment_type"]:checked').val();
	var status = $('input[name="payment_status"]:checked').val();
	//check required
	var payment_id = ($('input[name="payment_id"]').val() != '' && $('input[name="payment_id"]').val() != null) ? $('input[name="payment_id"]').val() : null ;
	//verify data 
	if(payment_amount == '') {
		$('input[name="payment_amount"]').parent('div').addClass('hasError');
		$('input[name="payment_amount"]').after('<div class="helper">Payment amount is required</div>');
		error_count++;
	}

	console.log(payment_type);
	
	if(payment_type == '' || payment_type == undefined) {
		$('input[name="payment_type"]').parent('div').addClass('hasError');
		$('input[name="payment_type"]').parent('div').append('<div class="helper">Payment type is required</div>');
		error_count++;
	}

	if(error_count > 0 ) {

		return false;
	}
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'payment',
			'format': 'json',
			'user_id': user_id, 
			'id': id, 
			'payment_amount': payment_amount, 
			'payment_type': payment_type, 
			'payment_date': payment_date, 
			'status': status, 
			'payment_id': payment_id
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				//loading('hide', function() {
					location.reload();
				//})			
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				loading('hide');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.changepayStatus', function() {
	var id = $(this).attr('data-id');
	var status = $(this).attr('data-status');
	console.log(status);
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'payment_status',
			'format': 'json',
			'id' : id, 
			'status': status
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				if(status == 1) {
					$('#pay-status-' + id).find('i').removeClass('payClr');
					$('#pay-status-' + id).find('i').addClass('payNot');
					$('#pay-status-' + id).find('i').attr('data-status', 0);
					$('#pay-container-' + id).find('.cancelPaymentBtn').show();
				}
				else {
					$('#pay-status-' + id).find('i').addClass('payClr');
					$('#pay-status-' + id).find('i').removeClass('payNot');
					$('#pay-status-' + id).find('i').attr('data-status', 1);
					$('pay-container-' + id).find('.cancelPaymentBtn').hide();
				}
				loading('hide');

			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
				loading('hide');
			}
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
});

$(document).on('click', '.cancelPaymentBtn', function() {
	$('.alert').remove();
	var id = $(this).attr('data-id');
	console.log("ID: " + id);
	confirm_dialog('<h3><i class="typcn typcn-delete-outline"></i>Are you sure you want to delete this payment?</h3><p>This will remove the payment and is irreversible</p>',
		function() {
			//delete payment
			$$.ajax({
				url : serviceURL,
				type : 'POST',
				data : {
					'method': 'delete',
					'action': 'payment',
					'format': 'json',
					'id' : id,
				},
				dataType: 'html',
				beforeSend: function() {
					loading('show');
			  	},
				success : function(data) {
				console.log("DATA: " + data);
					var obj = $.parseJSON(data);
					if(obj.code === 1) {
						$('#pay-container-' + id).fadeOut().remove();
						$('#payments-table').before('<div class="alert alert-success">Payment successfully deleted</div>');
						loading('hide');
					}
					else {
						//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
						loading('hide');
					}
				},
				error : function(request,error) {
					console.log("Request (error): "+JSON.stringify(request));
					loading('hide');
				}
			});

			/*
			var request = $.ajax({
			  url: site_url + "lib/inc/ajax.inc.php",
			  type: "POST",
			  data: { action : 'delete_payment', id : id },
			});

			request.done(function(data) {
				console.log("DATA: " + data);
				var obj = $.parseJSON(data);
				if(obj.resp === true) {
					$('#tr-' + id).fadeOut().remove();
					$('#payments-table').before('<div class="alert alert-success">Payment successfully deleted</div>');
				}
				else {

				}
				$('html,body').animate({
					scrollTop: $("#payments-container").offset().top
				}, 'slow');
			});

			request.fail(function( jqXHR, textStatus ) {
				alert( "Request failed: " + textStatus );
				$('.pageOverlay').remove();
			});
			*/
		},
		function() {
			//No -- Do nothing
			$('html,body').animate({
				scrollTop: $("#payments-container").offset().top
			}, 'slow');
		}
	);
});

function showAccountSetupScreen(id) {
	console.log(id);
	$('.app-modal-title').html('Setup Account');
	if(id !== null) {
		$('.app-modal-title').html('Update Account');
	}
	$('.app-modal').attr('id', 'account-setup-modal');
	var form = '';
	//see if user has more accounts
	if(id == null && getStorage('account_count') >= getStorage('max_accounts')) {
		form += '<h1>You have reached the maximum accounts</h1>';
		form += '<p>Click below to upgrade your account to unlock unlimited accounts</p>';
		$('.modal-footer').html('<button type="button" class="btn btn-primary upgradeAcctBtn">Upgrade Account</button> <button type="button" class="btn btn-danger closeModal">Cancel</button>');
	}
	else {
		//Form
		form += '<form id="acctSetupFrm" method="post">';
		var orig_date = '';
		if(id !== null) {
			form += '<input type="hidden" name="id" value="' + id + '">';
			var orig_date = $('input[name="start_date"]').val().replace(/-/g, '/');
			var today = new Date(orig_date);
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd = '0'+dd
			} 
	
			if(mm<10) {
				mm = '0'+mm
			} 
			orig_date = mm + '/' + dd + '/' + yyyy;	
		}
		var account_title = (id !== null) ? $('input[name="account_title"]').val() : '';
		var account_number = (id !== null) ? $('input[name="account_number"]').val() : '';
		var loan_amount = (id !== null) ? $('input[name="loan_amount"]').val() : '';
		
		var loan_term = (id !== null) ? $('input[name="loan_term"]').val() : '';
		var int_rate = (id !== null) ? $('input[name="int_rate"]').val() : '';
		var due_date = (id !== null) ? $('input[name="due_date"]').val() : '';
		form += '<div class="form-group">';
		form += '<label for="account_title">Account Title:</label>';
		form += '<input type="text" name="account_title" id="account_title" placeholder="Account Title" value="' + account_title + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="account_number">Account Number:</label>';
		form += '<input type="text" name="account_number" id="account_number" placeholder="Account Number" value="' + account_number + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="account_number">Loan Amount:</label>';
		form += '<input type="text" name="loan_amount" id="loan_amount" placeholder="Loan Amount" value="' + loan_amount + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="orig_date">Start Date:</label>';
		form += '<input type="date" name="orig_date" id="orig_date" class="datepicker" placeholder="" value="' + orig_date + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="due_date">Due Date:</label>';
		form += '<select name="due_date" id="due_date" class="">';
		for (i = 1; i <= 31; i++) {
			var j = i % 10,
			k = i % 100;
			if (j == 1 && k != 11) {
				ord = i + "st";
			}
			else if (j == 2 && k != 12) {
				 ord = i + "nd";
			}
			else if (j == 3 && k != 13) {
				ord =i + "rd";
			}
			else {
				ord = i + "th";
			}
			form += '<option value="' + i + '"';
			if( i == due_date) {
				form += ' selected';
			}
			form += '>' + ord + '</option>';
		}
		form += '</select>';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="loan_term">Loan Term <small>(Months)</small>:</label>';
		form += '<input type="text" name="loan_term" id="loan_term" placeholder="Loan Term" value="' + loan_term + '">';
		form += '</div>';
		form += '<div class="form-group">';
		form += '<label for="int_rate">Interest Rate:</label>';
		form += '<input type="text" name="int_rate" id="int_rate" placeholder="Interest Rate" value="' + int_rate + '">';
		form += '</div>';
		form += '</form>';
		$('.modal-footer').html('<button type="button" class="btn btn-primary saveAcctBtn">Save Changes</button> <button type="button" class="btn btn-danger closeModal">Cancel</button>');
	}
	$('.modal-body').html(form);
	
	modalOpen('account-setup-modal');
}

function saveAcct() {
	var error_count = 0;
	$('.helper').remove();
	var user_id = 1;
	//check required
	var id = $('#acctSetupFrm input[name="id"]').val();
	var account_title = $('#acctSetupFrm input[name="account_title"]').val();
	var account_number = $('#acctSetupFrm input[name="account_number"]').val();
	var loan_term = $('#acctSetupFrm input[name="loan_term"]').val();
	var loan_amount = $('#acctSetupFrm input[name="loan_amount"]').val();
	var orig_date = $('#acctSetupFrm input[name="orig_date"]').val();
	var due_date = $('#acctSetupFrm select[name="due_date"]').val();
	var int_rate = $('#acctSetupFrm input[name="int_rate"]').val();
//console.log("ACCT NUMBER: " + account_number);
	//verify data 
	if(account_title == '') {
		$('#acctSetupFrm input[name="account_title"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="account_title"]').after('<div class="helper">Account title required</div>');
		error_count++;
	}

	if(account_number == '') {
		$('#acctSetupFrm input[name="account_number"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="account_number"]').after('<div class="helper">Account number required</div>');
		error_count++;
	}

	if(loan_term == '') {
		$('#acctSetupFrm input[name="loan_term"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="loan_term"]').after('<div class="helper">Loan term required</div>');
		error_count++;
	}

	if(orig_date == '') {
		$('#acctSetupFrm input[name="orig_date"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="orig_date"]').after('<div class="helper">Loan origination date required</div>');
		error_count++;
	}

	if(due_date == '') {
		$('#acctSetupFrm select[name="due_date"]').parent('div').addClass('hasError');
		$('#acctSetupFrm select[name="due_date"]').after('<div class="helper">Loan due date required</div>');
		error_count++;
	}

	if(int_rate == '') {
		$('#acctSetupFrm input[name="int_rate"]').parent('div').addClass('hasError');
		$('#acctSetupFrm input[name="int_rate"]').after('<div class="helper">Interest rate required</div>');
		error_count++;
	}

	if(error_count > 0 ) {

		return false;
	}

	//console.log(site_url + "lib/inc/ajax.inc.php");
	$$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method': 'post',
			'action': 'save_account',
			'format': 'json',
			'id': id, 
			'user_id': user_id, 
			'account_title': account_title, 
			'account_number': account_number, 
			'loan_amount': loan_amount, 
			'loan_term': loan_term, 
			'orig_date': orig_date, 
			'due_date': due_date, 
			'int_rate': int_rate
		},
		dataType: 'html',
		beforeSend: function() {
			loading('show');
	  	},
		success : function(data) {
		console.log("DATA: " + data);
			var obj = $.parseJSON(data);
			if(obj.code === 1) {
				location.reload(); 
			}
			else {
				//$('#loginFrm').prepend('<div class="helper error">' + obj.msg + '</div>');
			}
			loading('hide');
		},
		error : function(request,error) {
			console.log("Request (error): "+JSON.stringify(request));
			loading('hide');
		}
	});
}

function buildDashboard() {
	console.log("Building Dashboard");
	$('#user-id-input').val(getStorage('user_id'));
	$('body').append('<div class="page-overlay"><div class="loading"><span style="width:42px; height:42px" class="preloader preloader-white"></span></div></div>');
	$('#user-id-input').val()
	var user_id = $('#user-id-input').val();
	var acct_id = $('#acct-id-input').val();
	$.ajax({
		url : serviceURL,
		type : 'POST',
		data : {
			'method' : 'get',
			'action' : 'dashboard',
			'format' : 'json',
			'user' : user_id,
			'acct': acct_id
		},
		dataType:'html',
		beforeSend: function() {
			
	  	},
		success : function(data) {              
			console.log('Data: ' + data);
			var obj = $.parseJSON(data);
			//obj.data.id;
			//console.log(obj.data.acct.id);
			$('#acct-id-input').val(obj.data.acct.id);
			//alerts 
			if(obj.data.unread_alert_count != '' && obj.data.unread_alert_count > 0) {
				var alert_count = (obj.data.unread_alert_count > 9) ? '9+' : obj.data.unread_alert_count ;
				$('.halerts i').after('<span class="alert-count">' + alert_count + '</span>');
			}
			var alerts = '';
			if(obj.data.alerts != '' && obj.data.alerts != null) {
				alerts += '<ul>';
				$.each( obj.data.alerts, function( index, value ) {
					console.log(obj.data.alerts[index].id);
					alerts += '<li>';
					var icon = '<i class="typcn typcn-bell"></i>';
					if(obj.data.alerts[index].type == 'payment') {
						icon = '<i class="fa fa-usd"></i>';
					}
					alerts += '<div id="alert-tr-'  + obj.data.alerts[index].id + '" class="alert-div';
					if(obj.data.alerts[index].alert_read == 1) {
						alerts += ' read';
					}
					alerts += '"><div class="alert-icon">' + icon + '</div>';
					alerts += '<div class="alert-text"><h4 style="margin: 0; line-height: 1em;">'  + obj.data.alerts[index].alert_text + '<h4><small>'  + obj.data.alerts[index].time_ago + '</small></div></div>';
					alerts += '<div class="clr"></div>';
					alerts += '</li>';
				});
				alerts += '</ul>';
			}
			$('.alerts-container').html(alerts);
			//Loan Overview
			var loan_html = '';
		
			$('#start-date-input').val(obj.data.acct.orig_date);
			$('#account-title-input').val(obj.data.acct.account_title);
			$('#account-number-input').val(obj.data.acct.acct_number);
			$('#loan-term-input').val(obj.data.acct.loan_term);
			$('#due-date-input').val(obj.data.acct.due_date);
			$('#int-saved-input').val(obj.data.acct.int_saved);

			//format dates
			var orig_date = obj.data.acct.orig_date.replace(/-/g, '/');
			var today = new Date(orig_date);
			var dd = today.getDate();
			var mm = today.getMonth()+1; //January is 0!
			var yyyy = today.getFullYear();
			if(dd<10) {
				dd = '0'+dd
			} 

			if(mm<10) {
				mm = '0'+mm
			} 
			orig_date = mm + '/' + dd + '/' + yyyy;
			var payoff_date = '';
			if(obj.data.acct.payoff_date != null && obj.data.acct.payoff_date != '') {
				var payoff_date = obj.data.acct.payoff_date.replace(/-/g, '/');
				var today = new Date(payoff_date);
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				var yyyy = today.getFullYear();
				if(dd<10) {
					dd = '0'+dd
				} 
	
				if(mm<10) {
					mm = '0'+mm
				} 
				payoff_date = mm + '/' + dd + '/' + yyyy;
			}
			var adj_payoff_date = '';
			if(obj.data.acct.adj_payoff_date != null && obj.data.acct.adj_payoff_date != '') {
				var adj_payoff_date = obj.data.acct.adj_payoff_date.replace(/-/g, '/');
				var today = new Date(adj_payoff_date);
				var dd = today.getDate();
				var mm = today.getMonth()+1; //January is 0!
				var yyyy = today.getFullYear();
				if(dd<10) {
					dd = '0'+dd
				} 
	
				if(mm<10) {
					mm = '0'+mm
				} 
				adj_payoff_date = mm + '/' + dd + '/' + yyyy;
			}
			console.log(obj.data.acct.int_rate);
			$('#int-rate').val(obj.data.acct.int_rate);
			$('#loan-amount-input').val(obj.data.acct.loan_amount);
			$('#loan-years-input').val((obj.data.acct.loan_term/12));
			loan_html += '<div id="ov-switch">';
			loan_html += '<button class="btn btn-default btn-sm switchAccountBtn">Switch Account <i class="typcn typcn-arrow-sorted-down"></i></button>';
			loan_html += '<div id="account-container">';
			loan_html += '<ul>';
			//Sub accounts
			var account_count = 0
			$.each( obj.data.sub_accounts, function( index, value ){
				console.log(obj.data.sub_accounts[index].account_title);
				loan_html += '<li class="sub-account-link" data-id="'  + obj.data.sub_accounts[index].id + '">' + obj.data.sub_accounts[index].account_title + ' (Acct# ' + obj.data.sub_accounts[index].acct_number + ')</li>';
				account_count++;
			});
			setStorage('account_count', account_count);
			loan_html += '<li class="addAcctBtn">+ Add New Account</li></ul>';
			loan_html += '</div>';
			loan_html += '</div>';
			loan_html += '<div class="ov-acct"><span class="ov-title">Acct:</span><small>#' + obj.data.acct.acct_number + '</small><br>' + obj.data.acct.account_title + '</div>';
			loan_html += '<div class="ov-div"><span class="ov-caption">Loan Amt:</span> <b>$' + obj.data.acct.loan_amount + '</b></div>';
			loan_html += '<div class="ov-div"><span class="ov-caption">Loan Balance:</span> <b>$' + obj.data.acct.loan_balance + '</b></div>';
			loan_html += '<div class="ov-div"><span class="ov-caption">Loan Orig. Date:</span> <b>' + orig_date + '</b></div>';
			loan_html += '<div class="ov-div"><span class="ov-caption">Orig. Payoff Date:</span> <b>' + payoff_date + '</b></div>';
			if(adj_payoff_date != '') {
				loan_html += '<div class="ov-div"><span class="ov-caption">Est. Payoff Date:</span> <b>' + adj_payoff_date + '</b></div>';
			}
			loan_html += '<div class="ov-div"><span class="ov-caption">Interest Rate:</span> <b>' + obj.data.acct.int_rate + '%</b></div>';
			if(obj.data.acct.int_saved != '' && obj.data.acct.int_saved != null) {
				$('#int-rate-input').val(obj.data.acct.int_saved);
				$('#saved-percent-input').val(obj.data.acct.saved_percent);
				loan_html += '<div class="ov-div"><span class="ov-caption">Interest Saved:</span> <b>$' + obj.data.acct.int_saved + '</b></div>';
				var int_saved = $('input[name="int_saved"]').val();
				var saved_percent = $('input[name="saved_percent"]').val();
				$("#savings-circle").circliful({
					animationStep: 5,
					foregroundBorderWidth: 23,
					backgroundBorderWidth: 25,
					percent: saved_percent,
					icon: 'f155',
					iconSize: '40',
					iconPosition: 'middle',
					showPercent: 1,
					target: 0,
					noPercentageSign: true,
					replacePercentageByText: "$" + int_saved,
					percentageTextSize: '14'
				});

			}
			else {
				$('#int-saved-cont').hide();
			}
			loan_html += '<div id="acctEdit"><i class="fa fa-pencil-square-o editAcctBtn" data-id="' + obj.data.acct.id + '"></i></div>';
			
			$('#loan-overview').html(loan_html);
			
			//Payments
			var payments_html = '<h1>My Payments</h1>';
			payments_html += '<div id="payments-table">';
			if(obj.data.payments != '' && obj.data.payments != null) {
				$.each( obj.data.payments , function( index, value ){
					var payment_date = '';
					if(obj.data.payments[index].payment_date != null && obj.data.payments[index].payment_date != '') {
						var payment_date = obj.data.payments[index].payment_date.replace(/-/g, '/');
						var today = new Date(payment_date);
						var dd = today.getDate();
						var mm = today.getMonth()+1; //January is 0!
						var yyyy = today.getFullYear();
						if(dd<10) {
							dd = '0'+dd
						} 
			
						if(mm<10) {
							mm = '0'+mm
						} 
						payment_date = mm + '/' + dd + '/' + yyyy;
					}
					var status_marker = (obj.data.payments[index].status == 1) ? '<i class="fa fa-check fa-lg payClr changepayStatus" data-status="' + obj.data.payments[index].status + '" data-id="' + obj.data.payments[index].id + '"></i>' : '<i class="fa fa-check fa-lg payNot changepayStatus" data-status="' + obj.data.payments[index].status + '" data-id="' + obj.data.payments[index].id + '"></i>';
					payments_html += '<div class="payment-container" id="pay-container-' +  obj.data.payments[index].id + '">';
					payments_html += '<small>' + payment_date + '</small>';
					payments_html += '<div class="payment-amt">$' + obj.data.payments[index].payment_amt + '</div>';
					payments_html += '<div class="payment-type">' + obj.data.payments[index].payment_type + '</div>';
					payments_html += '<div class="payment-btns">';
					var cbtn_disp = 'inline-block';
					if(obj.data.payments[index].status == 1) {
						cbtn_disp = 'none';
					}
					payments_html += '<span id="pay-status-' + obj.data.payments[index].id + '" class="pay-status">' + status_marker + '</span>';
					payments_html += '<i class="typcn typcn-pencil editPaymentBtn" data-id="' + obj.data.payments[index].id + '"></i>';
					payments_html += '<i class="typcn typcn-cancel cancelPaymentBtn" data-id="' + obj.data.payments[index].id + '" style="display: ' + cbtn_disp + '"></i>';
					payments_html += '</div>';
					payments_html += '</div>';
				});
			}
			else {
				payments_html += 'No Payments. <span class="makePaymentBtn btn btn-primary btn-xs">Click here to get started</span>';
			}
			payments_html += '</div>';
			$('#payments-container').html(payments_html);
			//$.mobile.loading('hide');
			$('.page-overlay').fadeOut('fast', function() {
				$(this).remove();
			});
		},
		error : function(request,error) {
			alert("Request: "+JSON.stringify(request));
			//$.mobile.loading('hide');
			$('.page-overlay').fadeOut('fast', function() {
				$(this).remove();
			});
		}
	});
	
	function successHandler (result) {
		alert('result = ' + result);
	}
	
	function errorHandler (error) {
		alert('error = ' + error);
	}
	
	function onNotificationAPN (event) {
		if ( event.alert )
		{
			navigator.notification.alert(event.alert);
		}
	
		if ( event.sound )
		{
			var snd = new Media(event.sound);
			snd.play();
		}
	
		if ( event.badge )
		{
			pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
		}
	}
	
	function onNotification(e) {
		$("#app-status-ul").append('<li>EVENT -> RECEIVED:' + e.event + '</li>');
	
		switch( e.event )
		{
		case 'registered':
			if ( e.regid.length > 0 )
			{
				$("#app-status-ul").append('<li>REGISTERED -> REGID:' + e.regid + "</li>");
				// Your GCM push server needs to know the regID before it can push to this device
				// here is where you might want to send it the regID for later use.
				console.log("regID = " + e.regid);
			}
		break;
	
		case 'message':
			// if this flag is set, this notification happened while we were in the foreground.
			// you might want to play a sound to get the user's attention, throw up a dialog, etc.
			if ( e.foreground )
			{
				$("#app-status-ul").append('<li>--INLINE NOTIFICATION--' + '</li>');
	
				// on Android soundname is outside the payload.
				// On Amazon FireOS all custom attributes are contained within payload
				var soundfile = e.soundname || e.payload.sound;
				// if the notification contains a soundname, play it.
				var my_media = new Media("/android_asset/www/"+ soundfile);
				my_media.play();
			}
			else
			{  // otherwise we were launched because the user touched a notification in the notification tray.
				if ( e.coldstart )
				{
					$("#app-status-ul").append('<li>--COLDSTART NOTIFICATION--' + '</li>');
				}
				else
				{
					$("#app-status-ul").append('<li>--BACKGROUND NOTIFICATION--' + '</li>');
				}
			}
	
		   $("#app-status-ul").append('<li>MESSAGE -> MSG: ' + e.payload.message + '</li>');
	           //Only works for GCM
		   $("#app-status-ul").append('<li>MESSAGE -> MSGCNT: ' + e.payload.msgcnt + '</li>');
		   //Only works on Amazon Fire OS
		   $status.append('<li>MESSAGE -> TIME: ' + e.payload.timeStamp + '</li>');
		break;
	
		case 'error':
			$("#app-status-ul").append('<li>ERROR -> MSG:' + e.msg + '</li>');
		break;
	
		default:
			$("#app-status-ul").append('<li>EVENT -> Unknown, an event was received and we do not know what it is</li>');
		break;
	  }
	}
	
}
