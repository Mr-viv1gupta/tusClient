<?php

$_POST = json_decode(file_get_contents("php://input"),true);

if(isset($_POST)){
    
$ID = $_POST['moduleNumber'].preg_replace('/-/', '', $_POST['Date']).preg_replace('/:/', '', $_POST['Time']).'0'; 

if ($pos = substr(strrchr($_POST['file'], "\\"), 1) !== FALSE) { 
    $fileBeingUploaded = substr(strrchr($_POST['file'], "\\"), 1);
}
$postId = 0;
$conn = dbconnect();

$status = getData($conn, $ID, $postId, $fileBeingUploaded);


if($status == 'false'){
    echo json_encode($status);
    //TODO:
    //Handle ERROR: of existing file with same name and metaData.
}else {
    
    $ID = $status;

    if(uploadDirDbTemp($conn, $ID)){
        echo json_encode($status);
    }else{
        echo json_encode('dirDberror');
    }
//$array_file = array('moduleName' => $_POST['moduleName'], 'moduleNumber' => $_POST['moduleNumber'], 'moduleDate' => $_POST['Date'], 'moduleTime' => $_POST['Time'], 'InputFile' => $_POST['file'], 'ID' => $ID);
//
//$formattedData = json_encode($array_file);
//
////TODO: Update it Based on the TUSD server base location(GOPATH)
//$filename = 'C:\Users\HP\go\temp.json';
//$handle = fopen($filename, 'w+');
//fwrite($handle, $formattedData);
//fclose($handle);
}

    
    //echo json_encode($_POST);
}

function uploadDirDbTemp($connection, $ID) {
    
    $metadata = mysqli_query($connection, "UPDATE `tempmetadata` SET `directoryId`='$ID' WHERE `Id`= 1");
    
    if(!$metadata) {
        
        return false;
    }else{
        
        return true;
    }
}

function dbconnect() {
    $host = "localhost"; //vod.visionias.in
    $username = "visionias";
    $password = "Vision@1234$";
    $database = "video_upload";

    $connection = mysqli_connect($host, $username, $password, $database);
    
    return $connection;
}

function getData($connection, $ID, $postId, $fileBeingUploaded) {
//    global $postId = '00';
//    $ID = $ID . $postId;

    $dirInfo = mysqli_query($connection, "SELECT * FROM `video_details` WHERE `uploadId` = '".$ID . $postId."'");
    
//    echo json_encode("SELECT * FROM `video_details` WHERE `uploadId` = '".$ID . $postId."'");
    if(mysqli_num_rows($dirInfo) > 0){
            
            $fileInfo = mysqli_query($connection, "SELECT * FROM `video_details` WHERE `uploadId` = '".$ID . $postId."' AND `filename` = '$fileBeingUploaded'");
//            echo json_encode("SELECT * FROM `video_details` WHERE `uploadId` = '".$ID . $postId."' AND `filename` = '$fileBeingUploaded'");
            
            if(mysqli_num_rows($fileInfo) > 0) {
//                echo json_encode(mysqli_num_rows($fileInfo));
                return 'false';
            }else {
//                echo json_encode("inside");
                $postId = $postId + 1;
                return getData($connection, $ID, $postId, $fileBeingUploaded);
            }
    }else{
//        echo json_encode($ID . $postId);
        return $ID . $postId;
    }
}
?>