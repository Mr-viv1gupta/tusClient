<?php

$_POST = json_decode(file_get_contents("php://input"),true);

if(isset($_POST)){

	//Database Entry elements
	$message = "The Database Update failed, for the File". $_POST['fileName'] . "Please Update the Details into Database ASAP\n" . "Details related to the file is as follow:\n" . "file Name :-> ". $_POST['fileName']."\n" . "file size :-> ". $_POST['fileSize']."\n" . "'module Number' :->  ". $_POST['moduleNumber']. "\n". "module Name :-> ". $_POST['moduleName']."\n" . "Class Name :-> ". $_POST['className']."\n"."Faculty Name :-> ". $_POST['facultyName']."\n"."class time :-> ". $_POST['moduleTime']."\n"."class date :-> ". $_POST['moduleDate']."\n"."video Path :-> ". $_POST['videoPath']."\n"."video Duration :-> ". $_POST['videoDuration']."\n"."ID :-> ". $_POST['ID']."\n\n\n\n" . "Please Ignore, if already done. Else Contact It Department or Server Maintenance Team";
	
//, info@visionias.in, deepakyadav.visionias@gmail.com, gajendra.visionias@gmail.com
//
	$to      = 'vivek.gupta@visionias.in, shubham.prasad@visionias.in';
	$subject = '[ALERT]:Issue with Database Update for File:'.$_POST['fileName']. '';
	
	$headers = 'From: multimedia@visionias.in' . "\r\n" .
	    'Reply-To: no-reply@visionias.in' . "\r\n" .
	    'CC: ksdwivedi@visionias.in' . "\r\n" .
	    'X-Mailer: PHP/' . phpversion();

	$retval = mail($to, $subject, $message, $headers);


	if( $retval == true ) {
	echo "success";
	}else {
	echo "Message could not be sent...";
	}

}
?>