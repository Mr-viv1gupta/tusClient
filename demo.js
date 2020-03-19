/* global tus */
/* eslint no-console: 0 */

"use strict";

var upload          = null;
var uploadIsRunning = false;
var toggleBtn       = document.querySelector("#toggle-btn");
var resumeCheckbox  = document.querySelector("#resume");
var filesinput      = [];
var inputs          = document.querySelectorAll("input[type=file]");
var progress        = document.querySelector(".progress");
var progressBar     = progress.querySelector(".bar");
var alertBox        = document.querySelector("#support-alert");
var uploadList      = document.querySelector("#upload-list");
var chunkInput      = document.querySelector("#chunksize");
var endpointInput   = document.querySelector("#endpoint");
//Edit By Vivek
var moduleNumber = document.querySelector("#modulenumber");
var moduleName = document.querySelector("#modulename");
var className = document.querySelector("#classname");
var facultyName = document.querySelector("#faculty");
var datePicker = document.querySelector("#datepicker");
var timePicker = document.querySelector("#timepicker");
var errorText = document.querySelector("#form-messages");
var inputMp4 = document.querySelector("#filemp4");
var inputImageOrSrt = document.querySelector("#fileImageOrSrt");
var videoDuration = '';
var radioClick = false;
var anchor = document.createElement("a");


//Testing if tus is supported by Browser.
if (!tus.isSupported) {
  alertBox.classList.remove("hidden");
}

//If ToggleBtn not supported by the Browser.
//Throw the Error as described.
if (!toggleBtn) {
  throw new Error("Toggle button not found on this page. Aborting upload-page. ");
}

//If localStorage has data feel the form value    
if(localStorage.getItem('moduleNo')) {    
  setformDataUsinglocalStorage();   
}

//Js for getting Uploaded Video (MP4) File duration.
document.querySelector('#filemp4').addEventListener('change' , function(e){
  var source = document.querySelector("#videoplayer");
  source.src = URL.createObjectURL(this.files[0]);
  source.load();
  source.onloadedmetadata = function() {
      //console.log(source.duration);
      videoDuration = source.duration;
      //console.log(videoDuration)
    };
});

//ON Upload (ToggleBtn) Click
//First : Validate the Meta data using Validate() function.
//If True, use axious to write Meta data to Json file. 
//To be used by (TUSD) Golang Sever
toggleBtn.addEventListener("click", async function (e) {
    //Prevent Page from loading on button click.
    e.preventDefault();
    //Validating for Meta Data related to Video
    var responseValidation = validate(); 
    if(responseValidation){
        //Making Error's Section Blank
        errorText.innerHTML = ""; 
        //Disabling all the Input fields
        for (var i = 2; i < 11; i++) {
            document.getElementsByTagName("input")[i].disabled = true;
        }  
        //Populating localStorage           
        if(!localStorage.getItem('moduleNo')) {   
          populatelocalStorage();   
        }
        //Using Axious to Make Ajax request and writing meta data to file.
        
        postAxious();
                
    }else{
        console.log(inputs.files, "Meta Details not entered correctly");
        toastr.warning("Details related to Video File not entered correctly.")
      }
});

//On Click Reset button it clear's localStorage data and reload the form.   
document.getElementById("reset-btn").addEventListener("click", function() {   
    localStorage.clear();   
    location.reload(true);    
});

//Function to Show the Error Message using Toastr
function toastrError(message) {
    toastr.error(message+'<br /><br /><button type="button" class="btn-toastReload clear">Reload</button>', "Error")
    
    toastr.options = {
      "closeButton": true,
      "debug": false,
      "newestOnTop": true,
      "progressBar": false,
      "positionClass": "toast-top-center",
      "preventDuplicates": false,
      "showDuration": 0,
      "hideDuration": "1000",
      "timeOut": 0,
      "extendedTimeOut": 0,
      "showEasing": "swing",
      "hideEasing": "linear",
      "showMethod": "fadeIn",
      "hideMethod": "fadeOut",
      "tapToDismiss": false
    }
    
    document.querySelector(".btn-toastReload").addEventListener("click", function() {
        location.reload(true);
    });
}

//populatelocalStorage used to set meta data into localStorage    
//Inorder to use this data in case of netwrk error or unsucessful upload    
function populatelocalStorage() {   
    console.log('populatelocalStorage');    
    localStorage.setItem('moduleNo', moduleNumber.value);   
    localStorage.setItem('moduleName', moduleName.value);   
    localStorage.setItem('className', className.value);   
    localStorage.setItem('facultyName', facultyName.value);   
    localStorage.setItem('date', datePicker.value);   
    localStorage.setItem('timeValue', timePicker.options[timePicker.selectedIndex].value);
    localStorage.setItem('timeText', timePicker.options[timePicker.selectedIndex].text);
    
}

//Using localstorage data to feel form data.    
//And Enable reset button   
function setformDataUsinglocalStorage() {   
    console.log('setformDataUsinglocalStorage');    
    moduleNumber.value = localStorage.getItem('moduleNo');    
    moduleName.value = localStorage.getItem('moduleName');    
    className.value = localStorage.getItem('className');    
    facultyName.value = localStorage.getItem('facultyName');    
    datePicker.value = localStorage.getItem('date');
    timePicker.options[timePicker.selectedIndex].value = localStorage.getItem("timeValue");
    timePicker.options[timePicker.selectedIndex].text = localStorage.getItem("timeText");
    document.getElementById("reset-btn").style.display = "inline-block";    
}

//Calling postAxious to pass post data to update the temporary file   
// to be used by server to create the destination Dir   
//Starts the Upload by checkin the upload object instance
async function postAxious() {
    await axios.post('uploadDirectory.php', {
            moduleName: moduleName.value,
            moduleNumber: moduleNumber.value,
            Date : datePicker.value,
            Time : timePicker.value,
            file : inputMp4.value
        })
    .then(function (response){
            //  console.log(response.data);
        if(response.data == 'false'){
            //console.log(response.data)
            toggleBtn.disabled = true;
            console.log("File with same Name and MetaData given already exist.");
            //TODO: create a error dialog box.
            toastrError("File with same name and given details related to video, already exist at the Server.")
        }else if(response.data == 'dirDberror'){    
            toggleBtn.disabled = true;    
            console.log(" There is some technical Issue realted to upload dir creation, Please try after sometime.");
            toastrError(" There is some technical Issue realted to upload dir creation, Please try after sometime.")    
        }else {
            // console.log(response.data)
            filesinput['destinationDir'] = response.data;
                //Calling Start Upload function
                if (upload) {
                    if (uploadIsRunning) {
                      upload.abort();
                        console.log("Upload Paused")
                        toastr.info("Upload Paused")
                      toggleBtn.textContent = "resume upload";
                      uploadIsRunning = false;
                    } else {
                      upload.start();
                        console.log("Upload Resumed")
                        toastr.info("Upload Resumed")
                      toggleBtn.textContent = "pause upload";
                      uploadIsRunning = true;
                    }
                } else {

                    if (inputs.length > 0) {
                        console.log("Upload Started")
                        toastr.info("Upload Started")
                        for(var i = inputs.length-1; i >= 0;  i--){
                            if(inputs[i].files.length == 0){
                                continue;
                            }
                            startUpload(i);
                        }  
                    } else {
                        console.log("Select a File to Uoload")
                        alert("Select a File to Upload")
                      //input.click();
                    }
                }
            }
       
        })
        .catch(function (error) {
            console.log(error);
        })
}
//This part starts the Video Upload process on file selected.
//input.addEventListener("change", startUpload);

function startUpload(i) {
    var file = inputs[i].files[0];

    if(inputs[i].files[0].type == "video/mp4"){
        filesinput['mp4fileName'] = inputs[i].files[0].name;
        filesinput['mp4fileName'] = filesinput['mp4fileName'].replace("'", "''");
        filesinput['mp4fileSize'] = inputs[i].files[0].size;
    }
    
  // Only continue if a file has actually been selected.
  // IE will trigger a change event even if we reset the input element
  // using reset() and we do not want to blow up later.
  if (!file) {
    return;
  }

  var endpoint = endpointInput.value;
  var chunkSize = parseInt(chunkInput.value, 10);
  if (isNaN(chunkSize)) {
    chunkSize = Infinity;
  }

  toggleBtn.textContent = "pause upload";

  var options = {
    endpoint: endpoint,
    resume  : !resumeCheckbox.checked,
    chunkSize: chunkSize,
    retryDelays: [0, 1000, 3000, 5000],
    metadata: {
      filename: file.name,
      filetype: file.type,
      fdirName: filesinput['destinationDir']
    },
    onError : function (error) {
      if (error.originalRequest) {
        if (window.confirm("Failed because: " + error + "\nDo you want to retry?")) {
          // console.log(error)
          upload.start();
          uploadIsRunning = true;
          return;
        }else{
        	toastrError("Error :" + error )
        }
      } else {
        window.alert("Failed because of some technical Issue: " + error + "Please contact the It Department");
        toastrError(error)
      }

      reset();
    },
    onProgress: function (bytesUploaded, bytesTotal) {
      var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
      progressBar.style.width = percentage + "%";
      console.log(bytesUploaded, bytesTotal, percentage + "%");
      document.querySelector("#progress-percentage-update").innerHTML = readableBytes(bytesUploaded) +' '+readableBytes(bytesTotal)+ ' : '+ percentage + '%';
       
    },
    onSuccess: function () {
        console.log("Upload success")
        if(i == 0){
            var status =  databaseInsert();
              // console.log(status)
                if(status){
                    //console.log("DB Success");
                    toggleBtn.disabled = true;
                    localStorage.clear();
                    loadSuccessPopUp();
                }else{
                    console.log("DB Failed.");
                    if(dbfailSendMain()){
                        toggleBtn.disabled = true;
                        localStorage.clear();
                        loadSuccessPopUp();
                        toastr.info("Upload Complete")
                    }
                }
            reset();
        }
        
    }
  };
  upload = new tus.Upload(file, options);
  upload.start();
  uploadIsRunning = true;
}

function reset() {
  inputs.value = "";
  toggleBtn.textContent = "start upload";
  upload = null;
  uploadIsRunning = false;
}

/**
* dbfailSendMail funtion sends mail to the respective guides
*In situation of Upload complete 100% but fails to write details into the DB
* It passes all the meta data related to Video into 'mail.php' using axios
**/
async function dbfailSendMain() {
    await axios.post('simplemail.php', {
        fileName: filesinput['mp4fileName'],
        fileSize: filesinput['mp4fileSize'],
        moduleName: moduleName.value,
        moduleNumber: moduleNumber.value,
        className: className.value,
        facultyName: facultyName.value,
        moduleTime: timePicker.value,
        moduleDate: datePicker.value,
        videoPath: endpointInput.value,
        videoDuration: videoDuration,
        ID: filesinput['destinationDir']
    })
    .then(function (response){
        console.log(response.data)
        if(response.data == 'success'){
            return true;
        }else {
            return false;
        }
    })
    .catch(function (error) {
        console.log(error)
        toastrError(error)
    })
}
/**
 * Converts a long string of bytes into a readable format e.g KB, MB, GB, TB, YB
 * 
 * @param {Int} num The number of bytes.
 */
function readableBytes(bytes) {
    var i = Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    return (bytes / Math.pow(1024, i)).toFixed(2) * 1 + ' ' + sizes[i];
}

function loadSuccessPopUp() {
    document.getElementsByClassName("modal")[0].style.display = "block";
    document.getElementById("sourcefile").innerHTML = filesinput['mp4fileName'] + " (" + filesinput['mp4fileSize'] + "bytes)";
   document.getElementById("uploaddir").innerHTML = filesinput['destinationDir'];
    
    document.getElementsByClassName("js-close")[0].onclick = function() {
            
            location.reload(true);
        }
}

//Modified By Vivek:
async function databaseInsert(){
    
    var ajax = new XMLHttpRequest();
    ajax.open("POST", "database.php", true);
    ajax.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    ajax.onreadystatechange = await function() {
        if(this.readyState == 4 && this.status == 200)
            if(this.responseText == 'success'){
               // console.log(this.responseText);
                return true;
            }else{
                return false;
            }
    };
    // console.log(videoDuration)
    ajax.send("file_name=" + filesinput['mp4fileName'] + "&file_size=" + filesinput['mp4fileSize'] + "&module_name=" + moduleName.value + "&module_number="+ moduleNumber.value + "&class_name="+className.value+"&faculty_name="+facultyName.value+"&module_time="+timePicker.value+"&module_date="+datePicker.value+"&video_path="+endpointInput.value+"&video_duration="+videoDuration+"&ID="+filesinput['destinationDir']);
}

function validate(){
   
    var errorMessage = [];
    var videoArray = ['.mp4'];
    var imageOrSrtArray = ['.jpg', '.jpeg', '.txt', '.png'];
    
    if(moduleNumber.value == '' || moduleNumber.value == null){
        errorMessage.push("Module Number Required");
        moduleNumber.style.borderColor = "red";
    }else if(moduleNumber.value.length != 4){
        errorMessage.push("Module Number has invalid Length. Allowed Length 4");
        moduleNumber.style.borderColor = "red";
    }else{
        moduleNumber.style.borderColor = "#ffffff";
    }
    
    if(moduleName.value == '' || moduleName.value == null){
        errorMessage.push("Module Name Required");
        moduleName.style.borderColor = "red";
    }else{
        moduleName.style.borderColor = "#ffffff";
    }
    if(className.value == '' || className.value == null){
        errorMessage.push("Class Name is Required");
        className.style.borderColor = "red";
    }else{
        className.style.borderColor = "#ffffff";
    }
    if(facultyName.value == '' || facultyName.value == null){
        errorMessage.push("Faculty Name of the respective classs is required");
        facultyName.style.borderColor = "red";
    }else{
        facultyName.style.borderColor = "#ffffff";
    }
    if(timePicker.value == '' || timePicker.value == null){
        errorMessage.push("Scheduled Time of the Class is required");
        timePicker.style.borderColor = "red";
    }else{
        timePicker.style.borderColor = "#ffffff";
    }
    if(datePicker.value == '' || datePicker.value == null){
        errorMessage.push("Date of the CLass is required");
        datePicker.style.borderColor = "red";
    }else{
        datePicker.style.borderColor = "#ffffff";
    }
    if(inputMp4.value == '' || inputMp4.value == null){
        errorMessage.push("Video File Required to Upload");
        
        document.querySelector("#Inputmp4file").style.border = "1px solid red";
    }else if(!inputMp4.value.search(new RegExp('.mp4', "i"))){
        errorMessage.push("Video File Type Error: Only '( .mp4 )' allowed");
        document.querySelector("#Inputmp4file").style.border = "1px solid red";

    }else {
        document.querySelector("#Inputmp4file").style.border = "none";
    }
    
    if(radioClick == true){
        if(inputImageOrSrt.value == '' || inputImageOrSrt.value == null){
        errorMessage.push("Image or Srt File Required to Upload");
        document.querySelector("#InputimageOrSrtfile").style.border = "1px solid red";
           
        }else if(!inputImageOrSrt.value.search(new RegExp('.txt', "i")) && !inputImageOrSrt.value.search(new RegExp('.png', "i")) && !inputImageOrSrt.value.search(new RegExp('.jpg', "i")) && !inputImageOrSrt.value.search(new RegExp('.jpeg', "i"))){
            errorMessage.push("Image or Srt File Type Error: Only '(  .txt, .jpeg, .jpg, .png )' allowed");
            document.querySelector("#InputimageOrSrtfile").style.border = "1px solid red";

        }else {
            document.querySelector("#InputimageOrSrtfile").style.border = "none";
        }
    }
    //Checking If Error Exist then Print it and set upload false;
    if(typeof errorMessage !== 'undefined' && errorMessage.length > 0){
         var text = "<ul>";
        errorMessage.forEach(function(key, value){
            text += "<li>" + key + "</li>";
        });
        text += "</ul>";
        errorText.innerHTML = text;
    return false;    
    }else{
    return true;
    }
}


function handleRadioClick(myRadio) {
    switch(myRadio.value) {
        case '2':
            
           radioClick = true;  document.querySelector("#InputimageOrSrtfile").style.display = "block";
            break;
 
        default:
            
           radioClick = false; document.querySelector("#InputimageOrSrtfile").style.display = "none";
        document.querySelector("#fileImageOrSrt").value = "";   document.querySelector("#InputimageOrSrtfile").style.border = "none";
            console.log(3);
//            document.querySelector("#srtFile").style.display = "none";
    }

}