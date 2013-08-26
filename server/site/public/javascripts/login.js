$(document).ready(function(){
	//logged
	$('#ulLogin').removeClass('hide');
	if(false){
		$('#ulLogin li').not('#ulLogin .dropdown').addClass('hide');
	}else{
		$('#ulLogin li').addClass('hide');
		$('#ulLogin li').not('#ulLogin .dropdown').removeClass('hide');
	}
});