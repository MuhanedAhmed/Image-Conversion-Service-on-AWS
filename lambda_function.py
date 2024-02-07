#### Importing all required libraries from python environment and also the attached layers.
import json
import boto3
import tempfile
import os
from PIL import Image 


# ---------------------------------------------------------------------------------------------------------------------------------

#### Global Variables
s3 = boto3.client('s3')

standardImageFormats = ['jpg', 'png' , 'tiff' , 'bmp']

# ---------------------------------------------------------------------------------------------------------------------------------

#### A function to make the image conversion process. 

def imageFormat (fileToConvertPath , newExtension , ID):
    
    
    if newExtension == 'jpg':
        
        with Image.open(fileToConvertPath) as img:
            
            # Create a new file path for the JPG image in the same directory
            outputFilePath = os.path.dirname(fileToConvertPath) + f'/{ID}-iConvert.jpg'
            # Save the image as JPG format
            img.convert('RGB').save(outputFilePath)
            
            return outputFilePath
    
    
    if newExtension == 'png':
        
        with Image.open(fileToConvertPath) as img:
            
            # Create a new file path for the PNG image in the same directory
            outputFilePath = os.path.dirname(fileToConvertPath) + f'/{ID}-iConvert.png'
            # Save the image as PNG format
            img.convert('RGBA').save(outputFilePath)
            
            return outputFilePath
    

    if newExtension == 'tiff':
        
        with Image.open(fileToConvertPath) as img:
            
            # Create a new file path for the TIFF image in the same directory
            outputFilePath = os.path.dirname(fileToConvertPath) + f'/{ID}-iConvert.tiff'
            # Save the image as TIFF format
            img.save(outputFilePath)
        
            return outputFilePath
    
    
    if newExtension == 'bmp':
        
        with Image.open(fileToConvertPath) as img:
            # Create a new file path for the BMP image in the same directory
            outputFilePath = os.path.dirname(fileToConvertPath) + f'/{ID}-iConvert.bmp'
            # Save the image as BMP format
            img.convert('RGB').save(outputFilePath)
            
            return outputFilePath          
        
    
    
# A function to clean up the created temporary directory
def cleanupTempDirectory(tempDir):
    
    # Remove the temporary directory and its contents
    for root, dirs, files in os.walk(tempDir, topdown=False):
        for file in files:
            filePath = os.path.join(root, file)
            os.remove(filePath)
        for dir in dirs:
            dirPath = os.path.join(root, dir)
            os.rmdir(dirPath)
    os.rmdir(tempDir)
    


def lambda_handler(event, context):
    
    # Get the input bucket name and the object name from the event.
    inputBucketname = event['Records'][0]['s3']['bucket']['name']
    uploadedFileName = event['Records'][0]['s3']['object']['key']
    
    try:
        
        # Creating a temporary directory to store the uploaded file.
        tempDirectory = tempfile.mkdtemp()
        
        
        # Downloading the file from the input files S3 bucket to the temporary directory.
        inputFilePath = os.path.join(tempDirectory, uploadedFileName)
        s3.download_file(inputBucketname, uploadedFileName, inputFilePath)
      
      
        # Extracting conversion information from file name.
        id , extensions =  uploadedFileName.split('-')
        toExtension , fromExtension = extensions.split('.')      
        
        # Checking if the uploaded file is an image.
        for originalFormat in standardImageFormats:
            
            if originalFormat == fromExtension :
                
                # Apllying te conversion function and saving the resulted file path.
                convertedFilePath = imageFormat(inputFilePath,toExtension,id)
            
        
        # Upload the converted image to the output S3 bucket
        outputBucketName = 'outputbucket-conversion-project'
        outputKey = os.path.basename(convertedFilePath)
        s3.upload_file(str(convertedFilePath), outputBucketName, outputKey)


        # Clean up the temporary directory
        cleanupTempDirectory(tempDirectory)
   

        return {
            'statusCode': 200,
            'body': json.dumps('Lambda finished successfully!')
        }
    
    except Exception as e:
        print(e)
        raise e