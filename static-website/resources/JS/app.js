document.addEventListener("DOMContentLoaded", function(){
    
    // Creating Global Variables
    let s3 ;
    let initialOptions = Array.from(document.getElementById("new-ext").options);
    
    window.onload = function () {

        // Set the region.
        AWS.config.region = 'Add your region';

        // Configure the credentials to use the identity pool.
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: 'Add your identity pool ID',
        });

        // Make the call to obtain credentials
        AWS.config.credentials.get(function(){

            // Credentials will be available when this function is called.
            var accessKeyId     = AWS.config.credentials.accessKeyId;
            var secretAccessKey = AWS.config.credentials.secretAccessKey;
            var sessionToken    = AWS.config.credentials.sessionToken;

        });
    
        // Create the S3 client.
        s3 = new AWS.S3();
       
    }


    // A function to include information needed by the lambda function into the name of the image. 
    function renameFile(FileName,newExtension){

        // Extracting the old extension.
        let oldExtension = FileName.slice((FileName.lastIndexOf(".") - 1 >>> 0) + 2);
        
        // Generating a random ID
        randomID = Math.floor(100000 + Math.random() * 900000);
        
        // Validating the input file's extension.
        if (!oldExtension){

            alert('Invalid file!\nNo extension is included.');
            return;
        }
     
        
        return randomID + '-' + newExtension + '.'+ oldExtension;
    }


    // A function to upload the image to the input files S3 bucket.
    function uploadFile(importedFile,toExtension) {
        
        let textMessage = document.getElementById('text-message')
        textMessage.innerHTML = "";
        
        let newName = renameFile(importedFile.name,toExtension);

        // Checking that the new name has been updated successfully.
        if(!newName){return;} 

        // Setting the parameters needed by the upload method of S3 client.
        const params = {
            Bucket: 'Add your input bucket name',
            Key: newName,
            Body: importedFile
        };

        s3.upload(params, (err, data) => {
            if (err) {
                console.error('Error uploading file:', err);
                textMessage.innerHTML = "Upload failed! Please try again."
                textMessage.style.color = '#FF0000';
                textMessage.style.display = 'block';
            } else {

                textMessage.innerHTML = "The image have been uploaded successfully! Please wait until it's converted and downloaded."
                textMessage.style.color = '#50C878';
                textMessage.style.display = 'block';


                // Checking for the output image periodically .
                ourinterval = setInterval(downloadfile, 5000);
            }
        });

    }


    // A function to fetch the image after conversion from the output files S3 bucket.
    function downloadfile(){
        const filename= randomID + "-iConvert." + value;
        
        const params = {
            Bucket: 'Add your output bucket name', 
            Key: filename,
        }

        s3.getObject(params, (err, data) => {
            if (err) {
            console.error('Error downloading object:', err);
            
            } else {
            
                // Convert data.Body to a Blob object
                const blob = new Blob([data.Body]);

                // Create a temporary link
                const link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);

                // Set the filename for the downloaded file (optional)
                link.download = filename ;

                // Trigger the download by simulating a click on the link
                link.click();

                // Clean up
                window.URL.revokeObjectURL(link.href);

                clearInterval(ourinterval);
                
            }

        });

    }
        
    
    
    document.getElementById("up-btn").addEventListener("click",function() {
        
        const inputFile = document.getElementById('input-image').files[0];        

        if (!inputFile) {
            alert('Please select a file !!!');
            return;
        }

        const e = document.getElementById("new-ext");
        value = e.value;
        if (e.selectedIndex === 0 && !value){
            alert('Please select a conversion type !!!');
            return;
        }

        uploadFile(inputFile,value);
    });


    // Constructing the options list based on input image extension.
    document.getElementById('input-image').addEventListener('change', function(e) {
        
        let selectobject = document.getElementById("new-ext");
        let extension = e.target.files[0].name.split('.').pop();
   
        // Remove all options
        selectobject.innerHTML = '';
       
        // Adding all available options except the original extension.
        initialOptions.forEach(option => {
            if (option.value !== extension) {
                selectobject.add(option.cloneNode(true));
            }
        });
    });


    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
    
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
})
