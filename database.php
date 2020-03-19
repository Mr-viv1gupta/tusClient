
<?php
//vod.visionias.in
$host = "localhost";
$username = "visionias";
$password = "Vision@1234$";
$database = "video_upload";

$connection = mysqli_connect($host, $username, $password, $database);

if(isset($_REQUEST)){
	//echo json_encode($_REQUEST);
	$username = 'multimedia@visionias.in';
	$fileName = $_REQUEST['file_name'];
	$fileSize = $_REQUEST['file_size'];
	$moduleNumber = $_REQUEST['module_number'];
	$moduleName = $_REQUEST['module_name'];
	$className = $_REQUEST['class_name'];
	$facultyName = $_REQUEST['faculty_name'];
	$classTime = $_REQUEST['module_time'];
	$classDate = $_REQUEST['module_date'];
	$videoPath = $_REQUEST['video_path'];
	$fileDuration = $_REQUEST['video_duration'];
	$fileDuration = floor($fileDuration/3600).gmdate(":i:s", $fileDuration % 3600);

	$uploadDir = $_REQUEST['ID'];
	//Getting Dir Name
    // $str = file_get_contents('/home/shubham/go/temp.json');
    // $json = json_decode($str, true);
    // $uploadDir = $json['ID'];
    //echo $uploadDir;

	$file_info = mysqli_query($connection , "SELECT * FROM video_details WHERE video_path = '$videoPath' AND filename = 'fileName'");
		
		if(!mysqli_num_rows($file_info) > 0){

			$inserted_data = mysqli_query($connection , "INSERT INTO video_details VALUES('' , '$username' , '$uploadDir', '$moduleNumber' , '$moduleName' ,  '$className' , '$facultyName' , '$classTime' , '$classDate' , '$fileName' , '$fileDuration', '$fileSize', 1, 0, '$videoPath')");
			//echo "INSERT INTO video_details VALUES('' , '$username' , '$uploadDir', '$moduleNumber' , '$moduleName' ,  '$className' , '$facultyName' , '$classTime' , '$classDate' , '$fileName' , '$fileDuration', '$fileSize', 1, 0, '$videoPath')";

			if(!$inserted_data){

				echo 'could not be inserted: ';
				echo mysqli_error($connection);
			}else{
				echo "success";
			}


		}

}
?>