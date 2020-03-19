
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Vision IAS - File Upload</title>
     <link href="https://netdna.bootstrapcdn.com/twitter-bootstrap/2.3.1/css/bootstrap-combined.min.css" rel="stylesheet" />
     <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
     <link href="./toast/toast.min.css" rel="stylesheet"/>
     <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <link href="./demo.css" rel="stylesheet" media="screen" />
  </head>
  <body>
    <div class="container">
       <!--Logout Option-->
       <!--//TODO: Implement the logout.php page-->
        <form action="logout.php" method="POST" style="float: right">
          <!-- <button type="submit" name='logout' class="btn btn-primary" id='logout'>Log out</button> -->
        </form>
        
        <!--Heading-->
        <h1>Vision IAS - File Upload</h1>

        <!--Validation for TUS Support--->
      <div class="alert alert-warining hidden" id="support-alert">
        <b>Warning!</b> Your browser does not seem to support the features necessary to run tus-js-client. The buttons below may work but probably will fail silently.
      </div>

      <br />
    
    
    <!--Form Fields for Uploading the Video and realated Meta data-->    
    <div class="form">
      <!--Block to Display Error-->
       <ul id="form-messages" style="color: red"></ul>
       
        <table id="metatable">
       <!--Default index options from tus. To be made static-->
        <tr style="display: none;">
          <td>
            <label for="endpoint">
              Upload endpoint:
            </label>
          </td>
          <td>
            <!--Server End Point Statically Defined-->
            <input type="text" id="endpoint" name="endpoint" value="http://live.visionias.in:1080/files/">
          </td>
        </tr>
        <tr style="display: none;">
          <td>
            <label for="chunksize">
              Chunk size (bytes):
            </label>
          </td>
          <td>
            <input type="number" id="chunksize" name="chunksize">
          </td>
        </tr>
        <tr style="display: none;">
          <td>
            <label for="resume">
              Perform full upload:
              <br />
              <small>(even if we could resume)</small>
            </label>
          </td>
          <td>
            <input type="checkbox" id="resume">
          </td>
        </tr>
        <!--Updating For User Interface By: Vivek. Dynamic Options availbale to Uploader-->
        <tr>
          <td>
            <label for="modulenumber">
              Module Number :
            </label>
          </td>
          <td>
            <input type="number" id="modulenumber" value="" autocomplete="off" name="modulenumber" placeholder="Module Number" required>
          </td>
        </tr>
        <tr>
          <td>
            <label for="modulename">
              Module Name :
            </label>
          </td>
          <td>
            <input type="text" autocomplete="off" id='modulename' name="modulename" value="" placeholder="Module Name" required>
          </td>
        </tr>
        <tr>
          <td>
            <label for="class">
              Class Name : 
            </label>
          </td>
          <td>
            <input type="text" id="classname" autocomplete="off" placeholder="Class Name" name="classname" value="" required>
          </td>
        </tr>
        <tr>
          <td>
            <label for="faculty">
              Faculty Assigned :
            </label>
          </td>
          <td>
            <input type="text" id="faculty" autocomplete="off" name="faculty" value='' placeholder="Faculty name" required>
          </td>
        </tr>
        <tr>
          <td>
            <label for="datepicker">
              Class Date :
            </label>
          </td>
          <td>
            <input type="date" id="datepicker" autocomplete="off" value="" required>
          </td>
          <td>
            <label for="timepicker">
              Class Time :
            </label>
          </td>
          <td>
            <select name="timepicker" id="timepicker" required>
                <option value="" selected>-SELECT Class Time-</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>
            <label for="faculty">
              Option of File to Upload :
            </label>
          </td>
        </tr>
        <tr>
            <td>
            <input type="radio" id="mp4file" name="filecount" value="1" onclick="handleRadioClick(this);" checked>Only Mp4
          </td>
         <!--  <td>
              <input type="radio" id="2files" name="filecount" value="2" onclick="handleRadioClick(this);">Mp4 and image/srt
          </td> -->
<!--
          <td>
              <input type="radio" id="3file" name="filecount" value="3" onclick="handleRadioClick(this);">Mp4, images and srt
          </td>
-->
        </tr>
      </table>
    
      <br />
        <label for="file" id="Inputmp4file"> Upload Mp4 File:
            <input type="file" name="file" id="filemp4" accept="video/*" ><p style="align-items: baseline; float: right; margin-right: 15%">Only "( .mp4 )" type Allowed</p>
            
        </label>
      <br />
      <br />
        <label for="file" id="InputimageOrSrtfile" style="display: none">Image or Srt File :
            <input type="file" name="file" id="fileImageOrSrt" accept="image/*, .txt, .pdf" ><p style="align-items: baseline; float: right; margin-right: 15%">Only "( .txt, .jpeg, .jpg, .png )" type Allowed</p>
    </label>
      <br />
      <br />
<!--
        <label for="file" id="srtFile" style="display: none">Srt File:
      <input type="file" name="file" id="file" accept="image/*, .txt, .pdf"  >
    </label>
-->
      <br />
      <video src="" autostart="0" style="display: none" id="videoplayer"></video>
      <br />
    </div>
      <div class="row">
        <div class="span8">
          <div class="progress progress-striped progress-success">
            <div class="bar" style="width: 0%;"></div>
          </div>
        </div>
        <div class="span4">
          <button class="btn stop" id="toggle-btn">start upload</button>
          <button class="btn reset" id="reset-btn" style="display: none">reset form</button>
        </div>
        <div class="span8">
            <p id="progress-percentage-update" style="font-weight: bold;"></p>
        </div>
      </div>
    
    <!--DIV Form ENds Here--> 
      <hr />
      <h3>Uploads</h3>
      <!-- <p id="upload-list">
        Succesful uploads will be listed here. Try one!
      </p> -->

    </div>
    <!-- Success PopuUp Button-->
    <div class="wrap">
      <div class="modal js-modal">
        <div class="modal-image">
          <svg viewBox="0 0 32 32" style="fill:#48DB71"><path d="M1 14 L5 10 L13 18 L27 4 L31 8 L13 26 z"></path></svg>
        </div>
        <h1>Upload Successful!</h1>
        <p>File : <span id="sourcefile"></span> uploaded successfully.</p>
        <p>Uploaded at Server, with Directory Name: <span id="uploaddir"></span></p>
        <button class="js-close">Reload</button>
      </div>
     </div>

  </body>
  <!---Script to Set Date Limit-->
  <script type="application/javascript">
        //Popuating Date Picker 
        var today = new Date();
        //var prev = new Date();
        var day = today.getDate();
        var month = today.getMonth()+1;
        var year = today.getFullYear();
      if(day < 10)
          day = '0'+day
      if(month < 10)
          month = '0'+month;
      today =year+'-'+month+'-'+day;
      //prev.setDate(day - 10);
      document.getElementById("datepicker").setAttribute("max", today);
      document.getElementById("datepicker").value = today;

      //Populating Time Picker
      function populateTimepicker(selector) {
            var select = document.getElementById(selector);
            var hours, minutes, ampm;
            for(var i = 420; i <= 1320; i += 30){
                hours = Math.floor(i / 60);
                minutes = i % 60;
                if (minutes < 10){
                    minutes = '0' + minutes; // adding leading zero
                }
                ampm = hours % 24 < 12 ? 'AM' : 'PM';
                newhours = hours % 12;
                if (newhours === 0){
                    newhours = 12;
                }
                if (newhours < 10) {
                  newhours = '0' + newhours;
                }
                if (hours < 10) {
                  hours = '0' + hours;
                }
                select.insertAdjacentHTML('beforeend' ,  `<option value=${hours + ':' + minutes}>${newhours + ':' + minutes + ' ' + ampm}</option>`)
            }
        }
      
      //Calling the function on pageload to populate timepicker
        window.onload = function (e) {
            populateTimepicker("timepicker");
        }
        
    </script>

  <script src="./dist/tus.js"></script>
  <script src="./demo.js"></script>
  <script src="./toast/toast.min.js"></script>
</html>
